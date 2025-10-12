import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import { CvStatus } from '@prisma/client';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class CvService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private queue: QueueService,
  ) {}

  async uploadCv(userId: string, file: Express.Multer.File) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and DOCX files are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    // Upload to S3 with encryption
    const { key, url } = await this.storage.uploadFile(file, 'cvs');

    // Create CV record
    const cv = await this.prisma.cv.create({
      data: {
        userId,
        originalFilename: file.originalname,
        s3Url: url,
        s3Key: key,
        mimeType: file.mimetype,
        size: file.size,
        status: CvStatus.UPLOADED,
      },
    });

    // Queue parsing job
    await this.queue.addCvParseJob({
      cvId: cv.id,
      userId,
      s3Key: key,
      mimeType: file.mimetype,
    });

    // Update status to parsing
    await this.prisma.cv.update({
      where: { id: cv.id },
      data: { status: CvStatus.PARSING },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CV_UPLOADED',
        meta: { cvId: cv.id, filename: file.originalname },
      },
    });

    return {
      cvId: cv.id,
      status: 'uploaded',
      message: 'CV uploaded successfully. Parsing in progress...',
    };
  }

  async getCvs(userId: string) {
    const cvs = await this.prisma.cv.findMany({
      where: { userId },
      include: {
        parsedResume: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cvs.map(cv => ({
      id: cv.id,
      filename: cv.originalFilename,
      status: cv.status,
      size: cv.size,
      uploadedAt: cv.createdAt,
      parsedData: cv.parsedResume ? cv.parsedResume.jsonPayload : null,
    }));
  }

  async getCvById(cvId: string, userId: string) {
    const cv = await this.prisma.cv.findUnique({
      where: { id: cvId },
      include: {
        parsedResume: true,
      },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.userId !== userId) {
      throw new ForbiddenException('You do not have access to this CV');
    }

    return cv;
  }

  async downloadCv(cvId: string, userId: string) {
    const cv = await this.getCvById(cvId, userId);

    // Generate signed URL for download
    const downloadUrl = await this.storage.getSignedDownloadUrl(cv.s3Key, 3600);

    return {
      downloadUrl,
      filename: cv.originalFilename,
      expiresIn: 3600,
    };
  }

  async deleteCv(cvId: string, userId: string) {
    const cv = await this.getCvById(cvId, userId);

    // Delete from S3
    await this.storage.deleteFile(cv.s3Key);

    // Delete from database
    await this.prisma.cv.delete({
      where: { id: cvId },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CV_DELETED',
        meta: { cvId, filename: cv.originalFilename },
      },
    });

    return { message: 'CV deleted successfully' };
  }

  async requestCvFix(cvId: string, userId: string, goal: string, notes?: string) {
    const cv = await this.getCvById(cvId, userId);

    if (cv.status !== CvStatus.PARSED && cv.status !== CvStatus.FIXED) {
      throw new BadRequestException('CV must be parsed before requesting fixes');
    }

    // Create AI task
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'FIX_CV',
        input: {
          cvId,
          goal,
          notes,
        },
        status: 'PENDING',
      },
    });

    // Queue fix job
    await this.queue.addCvFixJob({
      taskId: task.id,
      cvId,
      userId,
      goal,
      notes,
    });

    // Update task status
    await this.prisma.aiTask.update({
      where: { id: task.id },
      data: { status: 'IN_PROGRESS' },
    });

    return {
      taskId: task.id,
      status: 'processing',
      message: 'CV fix requested. You will be notified when it\'s ready.',
    };
  }

  async requestCvScan(cvId: string, userId: string) {
    const cv = await this.getCvById(cvId, userId);

    // Get CV content
    const fileBuffer = await this.storage.getFile(cv.s3Key);
    const cvText = await this.extractText(fileBuffer, cv.mimeType);

    // Create AI task for scanning
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'PARSE',
        input: {
          cvId,
          action: 'scan',
        },
        status: 'IN_PROGRESS',
      },
    });

    return {
      taskId: task.id,
      status: 'processing',
      message: 'ATS scan in progress...',
    };
  }

  async translateCv(cvId: string, userId: string, targetLanguage: string) {
    const cv = await this.getCvById(cvId, userId);

    // Create AI task
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'PARSE',
        input: {
          cvId,
          action: 'translate',
          targetLanguage,
        },
        status: 'PENDING',
      },
    });

    return {
      taskId: task.id,
      status: 'processing',
      message: `CV translation to ${targetLanguage} in progress...`,
    };
  }

  async reParseCv(cvId: string, userId: string) {
    const cv = await this.getCvById(cvId, userId);

    // Update status
    await this.prisma.cv.update({
      where: { id: cvId },
      data: { status: CvStatus.PARSING },
    });

    // Queue parsing job
    await this.queue.addCvParseJob({
      cvId: cv.id,
      userId,
      s3Key: cv.s3Key,
      mimeType: cv.mimeType,
    });

    return {
      cvId: cv.id,
      status: 'parsing',
      message: 'CV parsing restarted',
    };
  }

  private async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new BadRequestException('Unsupported file type for text extraction');
  }
}


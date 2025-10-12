import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OpenAIService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { CvStatus } from '@prisma/client';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Processor('cv-parse')
export class CvParseProcessor {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private openai: OpenAIService,
    private email: EmailService,
  ) {}

  @Process('parse')
  async handleParse(job: Job) {
    const { cvId, userId, s3Key, mimeType } = job.data;

    try {
      // Update progress
      job.progress(10);

      // Download file from S3
      const fileBuffer = await this.storage.getFile(s3Key);
      job.progress(30);

      // Extract text
      let cvText: string;
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(fileBuffer);
        cvText = data.text;
      } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        cvText = result.value;
      } else {
        throw new Error('Unsupported file type');
      }

      job.progress(50);

      // Parse with OpenAI
      const parsedData = await this.openai.parseCv(cvText);
      job.progress(80);

      // Save parsed data
      const parsedResume = await this.prisma.parsedResume.create({
        data: {
          jsonPayload: parsedData,
          skills: parsedData.skills || [],
          positions: parsedData.positions || [],
          rawText: cvText.substring(0, 10000), // Limit raw text size
        },
      });

      // Update CV
      await this.prisma.cv.update({
        where: { id: cvId },
        data: {
          status: CvStatus.PARSED,
          parsedJsonId: parsedResume.id,
        },
      });

      // Update user profile with parsed data
      await this.updateUserProfile(userId, parsedData);

      job.progress(100);

      // Get user for email
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      // Send email notification
      if (user) {
        await this.email.sendCvProcessedEmail(
          user.email,
          user.profile?.fullName || 'User',
          cvId,
        );
      }

      return { success: true, cvId, parsedResumeId: parsedResume.id };
    } catch (error) {
      console.error('CV parsing failed:', error);

      // Update CV with error
      await this.prisma.cv.update({
        where: { id: cvId },
        data: {
          status: CvStatus.ERROR,
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  private async updateUserProfile(userId: string, parsedData: any) {
    const updateData: any = {};

    if (parsedData.full_name) {
      updateData.fullName = parsedData.full_name;
    }

    if (parsedData.email) {
      // Only update if email is not set
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!user.profile?.fullName) {
        updateData.fullName = parsedData.full_name;
      }
    }

    if (parsedData.phone) {
      updateData.phone = parsedData.phone;
    }

    if (parsedData.location) {
      updateData.location = parsedData.location;
    }

    if (parsedData.summary) {
      updateData.about = parsedData.summary;
    }

    if (parsedData.skills && parsedData.skills.length > 0) {
      updateData.skills = parsedData.skills;
    }

    if (parsedData.positions && parsedData.positions.length > 0) {
      updateData.experience = parsedData.positions;
    }

    if (parsedData.education && parsedData.education.length > 0) {
      updateData.education = parsedData.education;
    }

    if (parsedData.languages && parsedData.languages.length > 0) {
      updateData.languages = parsedData.languages;
    }

    if (parsedData.certifications && parsedData.certifications.length > 0) {
      updateData.certifications = parsedData.certifications;
    }

    updateData.lastParsedAt = new Date();

    // Update profile
    await this.prisma.profile.update({
      where: { userId },
      data: updateData,
    });
  }
}


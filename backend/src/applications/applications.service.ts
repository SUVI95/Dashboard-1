import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async createApplication(userId: string, dto: CreateApplicationDto) {
    // Verify job exists
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify CV belongs to user
    const cv = await this.prisma.cv.findUnique({
      where: { id: dto.cvId },
    });

    if (!cv || cv.userId !== userId) {
      throw new ForbiddenException('Invalid CV');
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        cvId: dto.cvId,
        coverLetterUrl: dto.coverLetterUrl,
        coverLetterText: dto.coverLetterText,
        notes: dto.notes,
        status: ApplicationStatus.DRAFT,
      },
      include: {
        job: true,
        cv: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'APPLICATION_CREATED',
        meta: { applicationId: application.id, jobId: dto.jobId },
      },
    });

    return application;
  }

  async submitApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Update to submitted
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.SUBMITTED,
        appliedAt: new Date(),
      },
      include: {
        job: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'APPLICATION_SUBMITTED',
        meta: { applicationId, jobId: application.jobId },
      },
    });

    return updated;
  }

  async getApplications(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        job: true,
        cv: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }

  async getApplicationById(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        cv: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return application;
  }

  async updateApplication(applicationId: string, userId: string, dto: UpdateApplicationDto) {
    const application = await this.getApplicationById(applicationId, userId);

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: dto,
      include: {
        job: true,
      },
    });

    return updated;
  }

  async deleteApplication(applicationId: string, userId: string) {
    await this.getApplicationById(applicationId, userId);

    await this.prisma.application.delete({
      where: { id: applicationId },
    });

    return { message: 'Application deleted successfully' };
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        cvs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        applications: {
          include: { job: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, encryptionKeyId, ...sanitized } = user;

    // Calculate profile completeness
    const completeness = this.calculateProfileCompleteness(user.profile);

    return {
      ...sanitized,
      profileCompleteness: completeness,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: dto,
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        meta: { fields: Object.keys(dto) },
      },
    });

    return profile;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    // Upload to S3
    const { url } = await this.storage.uploadFile(file, 'avatars');

    // Update profile
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl: url },
    });

    return { avatarUrl: url };
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        cvs: { include: { parsedResume: true } },
        aiTasks: true,
        applications: { include: { job: true } },
        auditLogs: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { passwordHash, encryptionKeyId, ...exportData } = user;

    return exportData;
  }

  async requestDeletion(userId: string) {
    // Soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_REQUESTED',
        meta: { requestedAt: new Date() },
      },
    });

    // In production, queue a job to permanently delete after 30 days

    return {
      message: 'Your account deletion request has been received. Your data will be permanently deleted in 30 days.',
    };
  }

  async getDashboardStats(userId: string) {
    const [cvCount, applicationCount, activeJobs, completedTasks] = await Promise.all([
      this.prisma.cv.count({ where: { userId } }),
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.count({
        where: {
          userId,
          status: { in: ['SUBMITTED', 'REVIEWED', 'INTERVIEW'] },
        },
      }),
      this.prisma.aiTask.count({
        where: { userId, status: 'COMPLETED' },
      }),
    ]);

    const recentApplications = await this.prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      cvCount,
      applicationCount,
      activeJobs,
      completedTasks,
      recentApplications,
    };
  }

  private calculateProfileCompleteness(profile: any): number {
    if (!profile) return 0;

    const fields = [
      profile.fullName,
      profile.phone,
      profile.location,
      profile.about,
      profile.avatarUrl,
      profile.skills && profile.skills.length > 0,
      profile.experience && profile.experience.length > 0,
      profile.education && profile.education.length > 0,
    ];

    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }
}


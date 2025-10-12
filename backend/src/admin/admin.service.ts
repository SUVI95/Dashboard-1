import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          profile: true,
          _count: {
            select: {
              cvs: true,
              applications: true,
              aiTasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map(u => {
        const { passwordHash, ...rest } = u;
        return rest;
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllTasks(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.aiTask.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aiTask.count(),
    ]);

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const [
      totalUsers,
      totalCvs,
      totalApplications,
      totalJobs,
      pendingTasks,
      completedTasks,
      failedTasks,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.cv.count(),
      this.prisma.application.count(),
      this.prisma.job.count(),
      this.prisma.aiTask.count({ where: { status: 'PENDING' } }),
      this.prisma.aiTask.count({ where: { status: 'COMPLETED' } }),
      this.prisma.aiTask.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalUsers,
      totalCvs,
      totalApplications,
      totalJobs,
      tasks: {
        pending: pendingTasks,
        completed: completedTasks,
        failed: failedTasks,
      },
    };
  }

  async retryTask(taskId: string) {
    const task = await this.prisma.aiTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Reset task status
    await this.prisma.aiTask.update({
      where: { id: taskId },
      data: {
        status: 'PENDING',
        error: null,
        progress: 0,
      },
    });

    // Re-queue based on type
    // This would require queue service integration
    
    return { message: 'Task queued for retry' };
  }
}


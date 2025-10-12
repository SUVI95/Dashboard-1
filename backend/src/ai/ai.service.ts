import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { OpenAIService } from '../openai/openai.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private openai: OpenAIService,
    private storage: StorageService,
  ) {}

  async generateCoverLetter(
    userId: string,
    cvId: string | undefined,
    jobText: string,
    jobUrl: string | undefined,
    tone: string,
  ) {
    // Create AI task
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'COVER_LETTER',
        input: {
          cvId,
          jobText,
          jobUrl,
          tone,
        },
        status: 'PENDING',
      },
    });

    // Queue job
    await this.queue.addCoverLetterJob({
      taskId: task.id,
      userId,
      cvId,
      jobText,
      tone,
    });

    // Update status
    await this.prisma.aiTask.update({
      where: { id: task.id },
      data: { status: 'IN_PROGRESS' },
    });

    return {
      taskId: task.id,
      status: 'processing',
      message: 'Cover letter generation in progress...',
    };
  }

  async getTask(taskId: string, userId: string) {
    const task = await this.prisma.aiTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async getUserTasks(userId: string, limit: number = 20) {
    const tasks = await this.prisma.aiTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return tasks;
  }

  async generateInterviewPrep(userId: string, jobDescription: string) {
    // Get user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const profileData = {
      name: user.profile?.fullName,
      skills: user.profile?.skills || [],
      experience: user.profile?.experience || [],
      education: user.profile?.education || [],
    };

    // Generate questions and answers
    const result = await this.openai.generateInterviewPrep(profileData, jobDescription);

    // Create task to store the result
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'PARSE',
        input: { action: 'interview_prep', jobDescription },
        outputData: result,
        status: 'COMPLETED',
        finishedAt: new Date(),
        progress: 100,
      },
    });

    return {
      taskId: task.id,
      ...result,
    };
  }

  async scanCvAts(userId: string, cvText: string) {
    // Scan with OpenAI
    const result = await this.openai.scanCvForAts(cvText);

    // Create task
    const task = await this.prisma.aiTask.create({
      data: {
        userId,
        taskType: 'PARSE',
        input: { action: 'ats_scan' },
        outputData: result,
        status: 'COMPLETED',
        finishedAt: new Date(),
        progress: 100,
      },
    });

    return {
      taskId: task.id,
      ...result,
    };
  }
}


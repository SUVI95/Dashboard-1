import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { TaskStatus } from '@prisma/client';

@Processor('cover-letter')
export class CoverLetterProcessor {
  constructor(
    private prisma: PrismaService,
    private openai: OpenAIService,
    private email: EmailService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job) {
    const { taskId, userId, cvId, jobText, tone } = job.data;

    try {
      job.progress(20);

      // Get user profile
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      // Get CV if provided
      let cvData = null;
      if (cvId) {
        const cv = await this.prisma.cv.findUnique({
          where: { id: cvId },
          include: { parsedResume: true },
        });
        cvData = cv?.parsedResume?.jsonPayload;
      }

      job.progress(40);

      // Prepare profile data
      const profileData = {
        name: user.profile?.fullName,
        email: user.email,
        phone: user.profile?.phone,
        location: user.profile?.location,
        summary: user.profile?.about,
        skills: user.profile?.skills || cvData?.skills || [],
        experience: user.profile?.experience || cvData?.positions || [],
        education: user.profile?.education || cvData?.education || [],
      };

      // Generate cover letter
      const coverLetter = await this.openai.generateCoverLetter(
        profileData,
        jobText,
        tone,
      );

      job.progress(90);

      // Update task
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          outputData: coverLetter,
          finishedAt: new Date(),
          progress: 100,
        },
      });

      job.progress(100);

      // Send email notification
      await this.email.sendTaskCompletedEmail(user.email, 'Cover Letter', taskId);

      return { success: true, taskId, coverLetter };
    } catch (error) {
      console.error('Cover letter generation failed:', error);

      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.FAILED,
          error: error.message,
          finishedAt: new Date(),
        },
      });

      throw error;
    }
  }
}


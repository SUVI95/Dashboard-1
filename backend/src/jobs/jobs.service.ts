import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        ...dto,
        requiredSkills: dto.requiredSkills || [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return job;
  }

  async getJobs(skills?: string[], location?: string, limit: number = 20) {
    const where: any = {
      expiresAt: { gte: new Date() },
    };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      take: limit,
    });

    // Calculate match score if skills provided
    if (skills && skills.length > 0) {
      return jobs.map(job => ({
        ...job,
        matchScore: this.calculateMatchScore(skills, job.requiredSkills),
      })).sort((a, b) => b.matchScore - a.matchScore);
    }

    return jobs;
  }

  async getJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async getMatchedJobs(userId: string, limit: number = 20) {
    // Get user profile with skills
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const userSkills = (user?.profile?.skills as string[]) || [];

    // Get jobs
    const jobs = await this.getJobs(userSkills, user?.profile?.location || undefined, limit);

    return jobs;
  }

  private calculateMatchScore(userSkills: string[], jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 0;
    if (!userSkills || userSkills.length === 0) return 0;

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());

    const matches = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    return Math.round((matches.length / normalizedJobSkills.length) * 100);
  }
}


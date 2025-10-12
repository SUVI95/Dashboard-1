import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/job.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a job posting (Employer only)' })
  @ApiResponse({ status: 201, description: 'Job created' })
  async createJob(@Body() dto: CreateJobDto) {
    return this.jobsService.createJob(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with optional filtering' })
  @ApiQuery({ name: 'skills', required: false, description: 'Comma-separated skills' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async getJobs(
    @Query('skills') skills?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : undefined;
    const limitNum = limit ? parseInt(limit) : 20;

    return this.jobsService.getJobs(skillsArray, location, limitNum);
  }

  @Get('matched')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get jobs matched to user profile' })
  @ApiResponse({ status: 200, description: 'Matched jobs' })
  async getMatchedJobs(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.jobsService.getMatchedJobs(userId, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobById(@Param('id') jobId: string) {
    return this.jobsService.getJobById(jobId);
  }
}


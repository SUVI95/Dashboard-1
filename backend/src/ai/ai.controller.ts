import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GenerateCoverLetterDto, GenerateInterviewPrepDto } from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('cover-letter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate AI cover letter for a job' })
  @ApiResponse({ status: 200, description: 'Cover letter task created' })
  async generateCoverLetter(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateCoverLetterDto,
  ) {
    return this.aiService.generateCoverLetter(
      userId,
      dto.cvId,
      dto.jobText,
      dto.jobUrl,
      dto.tone || 'professional',
    );
  }

  @Post('interview-prep')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate interview questions and prep' })
  @ApiResponse({ status: 200, description: 'Interview prep generated' })
  async generateInterviewPrep(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateInterviewPrepDto,
  ) {
    return this.aiService.generateInterviewPrep(userId, dto.jobDescription);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get all AI tasks for current user' })
  @ApiResponse({ status: 200, description: 'List of AI tasks' })
  async getTasks(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.aiService.getUserTasks(userId, limit ? parseInt(limit) : 20);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get AI task by ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiService.getTask(taskId, userId);
  }
}


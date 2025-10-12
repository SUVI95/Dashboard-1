import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';

@ApiTags('applications')
@Controller('applications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a job application draft' })
  @ApiResponse({ status: 201, description: 'Application created' })
  async createApplication(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.createApplication(userId, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an application' })
  @ApiResponse({ status: 200, description: 'Application submitted' })
  async submitApplication(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.submitApplication(applicationId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications for current user' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  async getApplications(@CurrentUser('id') userId: string) {
    return this.applicationsService.getApplications(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application details' })
  async getApplicationById(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.getApplicationById(applicationId, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  async updateApplication(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateApplication(applicationId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 200, description: 'Application deleted' })
  async deleteApplication(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.deleteApplication(applicationId, userId);
  }
}


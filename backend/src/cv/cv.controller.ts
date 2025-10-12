import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CvService } from './cv.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FixCvDto, TranslateCvDto } from './dto/cv.dto';

@ApiTags('cv')
@Controller('cv')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CvController {
  constructor(private cvService: CvService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a CV (PDF or DOCX)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'CV uploaded and queued for parsing' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cvService.uploadCv(userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CVs for current user' })
  @ApiResponse({ status: 200, description: 'List of CVs' })
  async getCvs(@CurrentUser('id') userId: string) {
    return this.cvService.getCvs(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CV by ID' })
  @ApiResponse({ status: 200, description: 'CV details' })
  @ApiResponse({ status: 404, description: 'CV not found' })
  async getCvById(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvService.getCvById(cvId, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for CV' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async downloadCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvService.downloadCv(cvId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete CV' })
  @ApiResponse({ status: 200, description: 'CV deleted successfully' })
  async deleteCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvService.deleteCv(cvId, userId);
  }

  @Post(':id/parse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-parse CV' })
  @ApiResponse({ status: 200, description: 'Parsing started' })
  async reParseCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvService.reParseCv(cvId, userId);
  }

  @Post(':id/fix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request AI-powered CV optimization' })
  @ApiResponse({ status: 200, description: 'Fix task created' })
  async fixCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: FixCvDto,
  ) {
    return this.cvService.requestCvFix(cvId, userId, dto.goal, dto.notes);
  }

  @Post(':id/scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scan CV for ATS optimization feedback' })
  @ApiResponse({ status: 200, description: 'Scan started' })
  async scanCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvService.requestCvScan(cvId, userId);
  }

  @Post(':id/translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate CV to another language' })
  @ApiResponse({ status: 200, description: 'Translation started' })
  async translateCv(
    @Param('id') cvId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TranslateCvDto,
  ) {
    return this.cvService.translateCv(cvId, userId, dto.targetLanguage);
  }
}


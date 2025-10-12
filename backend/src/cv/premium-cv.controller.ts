import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PremiumCvService } from './premium-cv.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('cv')
@Controller('cv/premium')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PremiumCvController {
  constructor(private premiumCvService: PremiumCvService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate premium CV PDF' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'pt', 'fi'] })
  @ApiResponse({ status: 200, description: 'PDF generated' })
  async generatePremiumCv(
    @CurrentUser('id') userId: string,
    @Body() data: any,
    @Query('language') language?: string,
    @Res() res?: Response,
  ) {
    const pdfBuffer = await this.premiumCvService.generatePremiumCvPdf(
      userId,
      data,
      language || 'en',
    );

    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=DuuniJobs-PremiumCV-${language || 'en'}.pdf`,
      );
      res.send(pdfBuffer);
    }

    return { success: true };
  }

  @Get('preview/:cvId')
  @ApiOperation({ summary: 'Get CV data for preview' })
  @ApiResponse({ status: 200, description: 'CV data retrieved' })
  async getCvPreview(
    @Param('cvId') cvId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.premiumCvService.getCvDataForPreview(cvId, userId);
  }

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate CV content to another language' })
  @ApiResponse({ status: 200, description: 'CV translated' })
  async translateCv(
    @CurrentUser('id') userId: string,
    @Body() body: { data: any; targetLanguage: string },
  ) {
    return this.premiumCvService.translateCvContent(body.data, body.targetLanguage);
  }
}


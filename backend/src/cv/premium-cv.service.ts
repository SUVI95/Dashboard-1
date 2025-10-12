import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';
import { CvTemplateService } from './cv-template.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PremiumCvService {
  constructor(
    private prisma: PrismaService,
    private openai: OpenAIService,
    private cvTemplate: CvTemplateService,
  ) {}

  async generatePremiumCvPdf(
    userId: string,
    data: any,
    language: string = 'en',
  ): Promise<Buffer> {
    // Get user to check if premium
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For MVP, allow all users. In production, check subscription:
    // if (!user.isPremium) {
    //   throw new ForbiddenException('Premium subscription required');
    // }

    // Translate if needed
    let cvData = data;
    if (language !== 'en' && language !== data.originalLanguage) {
      cvData = await this.translateCvContent(data, language);
    }

    // Merge with user profile data
    const mergedData = {
      fullName: cvData.fullName || user.profile?.fullName || 'Professional',
      jobTitle: cvData.jobTitle || 'Job Seeker',
      email: user.email,
      phone: cvData.phone || user.profile?.phone,
      location: cvData.location || user.profile?.location,
      photo: cvData.photo || user.profile?.avatarUrl,
      summary: cvData.summary || user.profile?.about,
      skills: cvData.skills || user.profile?.skills || [],
      languages: cvData.languages || user.profile?.languages || [],
      experience: cvData.experience || user.profile?.experience || [],
      education: cvData.education || user.profile?.education || [],
      certifications: cvData.certifications || user.profile?.certifications || [],
    };

    // Generate HTML
    const html = this.cvTemplate.generatePremiumTemplate(mergedData, language);

    // Convert to PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      });

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'CV_GENERATED_PREMIUM',
          meta: { language, format: 'PDF' },
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async getCvDataForPreview(cvId: string, userId: string) {
    const cv = await this.prisma.cv.findUnique({
      where: { id: cvId },
      include: {
        parsedResume: true,
        user: {
          include: { profile: true },
        },
      },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const parsedData: any = cv.parsedResume?.jsonPayload || {};

    return {
      fullName: parsedData.full_name || cv.user.profile?.fullName,
      jobTitle: parsedData.job_title || 'Job Seeker',
      email: cv.user.email,
      phone: parsedData.phone || cv.user.profile?.phone,
      location: parsedData.location || cv.user.profile?.location,
      photo: cv.user.profile?.avatarUrl,
      summary: parsedData.summary || cv.user.profile?.about,
      skills: parsedData.skills || cv.user.profile?.skills || [],
      languages: parsedData.languages || cv.user.profile?.languages || [],
      experience: parsedData.positions || cv.user.profile?.experience || [],
      education: parsedData.education || cv.user.profile?.education || [],
      certifications: parsedData.certifications || cv.user.profile?.certifications || [],
    };
  }

  async translateCvContent(data: any, targetLanguage: string): Promise<any> {
    const languageMap = {
      en: 'English',
      pt: 'Portuguese',
      fi: 'Finnish',
    };

    const targetLangName = languageMap[targetLanguage] || 'English';

    // Translate main text fields
    const fieldsToTranslate = {
      summary: data.summary,
      jobTitle: data.jobTitle,
    };

    const translatedFields = {};

    for (const [key, value] of Object.entries(fieldsToTranslate)) {
      if (value && typeof value === 'string') {
        translatedFields[key] = await this.openai.translateResume(value, targetLangName);
      }
    }

    // Translate experience descriptions
    const translatedExperience = await Promise.all(
      (data.experience || []).map(async (exp) => {
        if (exp.description) {
          const translatedDesc = await this.openai.translateResume(
            exp.description,
            targetLangName,
          );
          return { ...exp, description: translatedDesc };
        }
        return exp;
      }),
    );

    return {
      ...data,
      ...translatedFields,
      experience: translatedExperience,
      originalLanguage: data.originalLanguage || 'en',
      translatedTo: targetLanguage,
    };
  }
}


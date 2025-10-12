import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OpenAIService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';
import { CvStatus, TaskStatus } from '@prisma/client';
import * as puppeteer from 'puppeteer';

@Processor('cv-fix')
export class CvFixProcessor {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private openai: OpenAIService,
    private email: EmailService,
  ) {}

  @Process('fix')
  async handleFix(job: Job) {
    const { taskId, cvId, userId, goal, notes } = job.data;

    try {
      job.progress(10);

      // Get CV and parsed data
      const cv = await this.prisma.cv.findUnique({
        where: { id: cvId },
        include: { parsedResume: true },
      });

      if (!cv || !cv.parsedResume) {
        throw new Error('CV or parsed data not found');
      }

      job.progress(30);

      // Generate improved CV with OpenAI
      const { improvedCv, changelog } = await this.openai.fixCv(
        cv.parsedResume.jsonPayload,
        goal,
        notes,
      );

      job.progress(60);

      // Generate PDF from markdown
      const pdfBuffer = await this.generatePdf(improvedCv);

      job.progress(80);

      // Upload to S3
      const { key, url } = await this.storage.uploadBuffer(
        pdfBuffer,
        `improved-cv-${Date.now()}.pdf`,
        'application/pdf',
        'fixed-cvs',
      );

      job.progress(90);

      // Update task
      await this.prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          outputUrl: url,
          outputData: {
            changelog,
            goal,
            s3Key: key,
          },
          finishedAt: new Date(),
          progress: 100,
        },
      });

      // Update CV status
      await this.prisma.cv.update({
        where: { id: cvId },
        data: { status: CvStatus.FIXED },
      });

      job.progress(100);

      // Get user for email
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        await this.email.sendTaskCompletedEmail(user.email, 'CV Fix', taskId);
      }

      return { success: true, taskId, outputUrl: url };
    } catch (error) {
      console.error('CV fix failed:', error);

      // Update task with error
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

  private async generatePdf(markdown: string): Promise<Buffer> {
    const html = this.markdownToHtml(markdown);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private markdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #1e40af;
            margin-top: 20px;
          }
          h3 {
            color: #3b82f6;
          }
          ul {
            list-style-type: disc;
            margin-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  }
}


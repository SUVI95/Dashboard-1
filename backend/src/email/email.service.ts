import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: parseInt(this.config.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const from = this.config.get('EMAIL_FROM') || 'noreply@duunijobs.fi';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'DuuniJobs - Verify Your Email',
        html: this.getOtpEmailTemplate(otp),
      });

      console.log(`OTP email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // In development, log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
      }
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const from = this.config.get('EMAIL_FROM') || 'noreply@duunijobs.fi';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Welcome to DuuniJobs Candidates Platform',
        html: this.getWelcomeEmailTemplate(name),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendCvProcessedEmail(
    email: string,
    name: string,
    cvId: string,
  ): Promise<void> {
    const from = this.config.get('EMAIL_FROM') || 'noreply@duunijobs.fi';
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Your CV has been processed',
        html: `
          <h2>Hi ${name},</h2>
          <p>Your CV has been successfully parsed and your profile has been updated.</p>
          <p><a href="${frontendUrl}/cvs/${cvId}">View your CV</a></p>
          <p>Best regards,<br/>DuuniJobs Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send CV processed email:', error);
    }
  }

  async sendTaskCompletedEmail(
    email: string,
    taskType: string,
    taskId: string,
  ): Promise<void> {
    const from = this.config.get('EMAIL_FROM') || 'noreply@duunijobs.fi';
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: `Your ${taskType} is ready`,
        html: `
          <h2>Good news!</h2>
          <p>Your ${taskType} task has been completed.</p>
          <p><a href="${frontendUrl}/ai/tasks/${taskId}">View result</a></p>
          <p>Best regards,<br/>DuuniJobs Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send task completed email:', error);
    }
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DuuniJobs</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Thank you for registering with DuuniJobs! Please use the following code to verify your email address:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 DuuniJobs. All rights reserved.</p>
            <p>Visit us at <a href="https://duunijobs.fi">duunijobs.fi</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .cta-button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DuuniJobs!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Welcome to DuuniJobs Candidates Platform! We're excited to help you find your dream job.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Upload your CV and let our AI optimize it</li>
              <li>Generate tailored cover letters for each job</li>
              <li>Browse matching job opportunities</li>
              <li>Track your applications</li>
            </ul>
            <a href="${frontendUrl}/dashboard" class="cta-button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 DuuniJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}


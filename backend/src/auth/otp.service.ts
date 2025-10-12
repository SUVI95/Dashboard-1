import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

interface OtpData {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private otpStore = new Map<string, OtpData>();

  constructor(
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async sendOtp(email: string): Promise<void> {
    const code = this.generateOtpCode();
    const expiresAt = new Date();
    const expiresInMs = parseInt(this.config.get('OTP_EXPIRES_IN') || '600000'); // 10 minutes
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    this.otpStore.set(email.toLowerCase(), {
      code,
      expiresAt,
      attempts: 0,
    });

    // Send email
    await this.emailService.sendOtpEmail(email, code);

    // Clean up expired OTPs
    this.cleanExpiredOtps();
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const otpData = this.otpStore.get(email.toLowerCase());

    if (!otpData) {
      return false;
    }

    // Check if expired
    if (otpData.expiresAt < new Date()) {
      this.otpStore.delete(email.toLowerCase());
      return false;
    }

    // Check attempts (max 5)
    if (otpData.attempts >= 5) {
      this.otpStore.delete(email.toLowerCase());
      return false;
    }

    // Increment attempts
    otpData.attempts++;

    // Verify code
    if (otpData.code === code) {
      this.otpStore.delete(email.toLowerCase());
      return true;
    }

    return false;
  }

  private generateOtpCode(): string {
    const length = parseInt(this.config.get('OTP_LENGTH') || '6');
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    
    return code;
  }

  private cleanExpiredOtps(): void {
    const now = new Date();
    
    for (const [email, data] of this.otpStore.entries()) {
      if (data.expiresAt < now) {
        this.otpStore.delete(email);
      }
    }
  }
}


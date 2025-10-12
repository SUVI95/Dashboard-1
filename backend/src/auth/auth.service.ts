import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { OtpService } from './otp.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.CANDIDATE,
        profile: {
          create: {
            fullName: dto.name,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Send OTP for email verification
    await this.otpService.sendOtp(user.email);

    // Log audit
    await this.createAuditLog(user.id, 'USER_REGISTERED', {
      email: user.email,
    });

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      email: user.email,
      requiresVerification: true,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    // If email not verified, send OTP
    if (!user.emailVerified) {
      await this.otpService.sendOtp(user.email);
      return {
        message: 'Please verify your email with the OTP sent.',
        email: user.email,
        requiresVerification: true,
      };
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Log audit
    await this.createAuditLog(user.id, 'USER_LOGIN', {
      email: user.email,
    });

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Update user as verified
    const user = await this.prisma.user.update({
      where: { email: dto.email.toLowerCase() },
      data: { emailVerified: true },
      include: { profile: true },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Log audit
    await this.createAuditLog(user.id, 'EMAIL_VERIFIED', {
      email: user.email,
    });

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async requestOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.otpService.sendOtp(email);

    return {
      message: 'OTP sent successfully',
      email,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
      include: { profile: true },
    });

    if (!user) {
      // Check if email exists
      user = await this.prisma.user.findUnique({
        where: { email: profile.emails[0].value.toLowerCase() },
        include: { profile: true },
      });

      if (user) {
        // Link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            emailVerified: true,
          },
          include: { profile: true },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            emailVerified: true,
            role: UserRole.CANDIDATE,
            profile: {
              create: {
                fullName: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value,
              },
            },
          },
          include: { profile: true },
        });
      }
    }

    const tokens = await this.generateTokens(user);

    await this.createAuditLog(user.id, 'GOOGLE_LOGIN', {
      email: user.email,
    });

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async linkedinLogin(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { linkedinId: profile.id },
      include: { profile: true },
    });

    if (!user) {
      const email = profile.emails?.[0]?.value || `${profile.id}@linkedin.com`;
      
      user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            linkedinId: profile.id,
            emailVerified: true,
          },
          include: { profile: true },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: email.toLowerCase(),
            linkedinId: profile.id,
            emailVerified: true,
            role: UserRole.CANDIDATE,
            profile: {
              create: {
                fullName: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value,
              },
            },
          },
          include: { profile: true },
        });
      }
    }

    const tokens = await this.generateTokens(user);

    await this.createAuditLog(user.id, 'LINKEDIN_LOGIN', {
      email: user.email,
    });

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, encryptionKeyId, deletedAt, ...sanitized } = user;
    return sanitized;
  }

  private async createAuditLog(userId: string, action: string, meta: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          meta,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}


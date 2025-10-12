import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    LinkedInStrategy,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}


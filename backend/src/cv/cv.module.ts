import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PremiumCvController } from './premium-cv.controller';
import { PremiumCvService } from './premium-cv.service';
import { CvTemplateService } from './cv-template.service';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';
import { OpenAIModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [StorageModule, QueueModule, OpenAIModule, EmailModule],
  controllers: [CvController, PremiumCvController],
  providers: [CvService, PremiumCvService, CvTemplateService],
  exports: [CvService, PremiumCvService],
})
export class CvModule {}


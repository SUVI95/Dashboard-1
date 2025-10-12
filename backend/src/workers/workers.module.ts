import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CvParseProcessor } from './cv-parse.processor';
import { CvFixProcessor } from './cv-fix.processor';
import { CoverLetterProcessor } from './cover-letter.processor';
import { StorageModule } from '../storage/storage.module';
import { OpenAIModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'cv-parse' },
      { name: 'cv-fix' },
      { name: 'cover-letter' },
      { name: 'auto-apply' },
    ),
    StorageModule,
    OpenAIModule,
    EmailModule,
  ],
  providers: [CvParseProcessor, CvFixProcessor, CoverLetterProcessor],
})
export class WorkersModule {}


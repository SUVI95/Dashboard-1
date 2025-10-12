import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { QueueModule } from '../queue/queue.module';
import { OpenAIModule } from '../openai/openai.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [QueueModule, OpenAIModule, StorageModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}


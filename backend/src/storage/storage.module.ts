import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { EncryptionService } from './encryption.service';

@Module({
  providers: [StorageService, EncryptionService],
  exports: [StorageService, EncryptionService],
})
export class StorageModule {}


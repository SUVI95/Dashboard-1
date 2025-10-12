import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private uploadPath: string;

  constructor(private config: ConfigService) {
    this.uploadPath = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'cvs'), { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'generated'), { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'avatars'), { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'cvs',
  ): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, key);

    await fs.writeFile(filePath, file.buffer);

    const url = `/uploads/${key}`;
    return { key, url };
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'generated',
  ): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}-${filename}`;
    const filePath = path.join(this.uploadPath, key);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${key}`;
    return { key, url };
  }

  async getFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.uploadPath, key);
    return await fs.readFile(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadPath, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the local URL
    return `/uploads/${key}`;
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the local URL
    return `/uploads/${key}`;
  }
}

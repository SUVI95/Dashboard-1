import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get('S3_ENDPOINT');
    const region = this.config.get('S3_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // Needed for MinIO
    });

    this.bucketName = this.config.get('S3_BUCKET_NAME');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'cvs',
  ): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256', // Server-side encryption
    });

    await this.s3Client.send(command);

    const url = `${this.config.get('S3_ENDPOINT')}/${this.bucketName}/${key}`;

    return { key, url };
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'generated',
  ): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
    });

    await this.s3Client.send(command);

    const url = `${this.config.get('S3_ENDPOINT')}/${this.bucketName}/${key}`;

    return { key, url };
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body as Readable;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}


import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('cv-parse') private cvParseQueue: Queue,
    @InjectQueue('cv-fix') private cvFixQueue: Queue,
    @InjectQueue('cover-letter') private coverLetterQueue: Queue,
    @InjectQueue('auto-apply') private autoApplyQueue: Queue,
  ) {}

  async addCvParseJob(data: any) {
    return this.cvParseQueue.add('parse', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addCvFixJob(data: any) {
    return this.cvFixQueue.add('fix', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addCoverLetterJob(data: any) {
    return this.coverLetterQueue.add('generate', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addAutoApplyJob(data: any) {
    return this.autoApplyQueue.add('apply', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  private getQueue(name: string): Queue {
    switch (name) {
      case 'cv-parse':
        return this.cvParseQueue;
      case 'cv-fix':
        return this.cvFixQueue;
      case 'cover-letter':
        return this.coverLetterQueue;
      case 'auto-apply':
        return this.autoApplyQueue;
      default:
        throw new Error(`Unknown queue: ${name}`);
    }
  }
}


import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { NOTIFICATIONS_QUEUE } from '../../../common/queue/queue.module';

export interface NotificationJobData {
  userId: string;
  title: string;
  body: string;
}

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue,
  ) {}

  enqueuePush(data: NotificationJobData) {
    return this.queue.add('send-push', data);
  }
}

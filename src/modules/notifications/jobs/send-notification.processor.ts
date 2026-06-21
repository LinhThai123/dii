import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { NOTIFICATIONS_QUEUE } from '../../../common/queue/queue.module';
import { NotificationsService } from '../notifications.service';
import { NotificationJobData } from './notification-queue.service';

@Processor(NOTIFICATIONS_QUEUE)
export class SendNotificationProcessor {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send-push')
  async handleSendPush(job: Job<NotificationJobData>) {
    await this.notificationsService.sendPush(job.data);
  }
}

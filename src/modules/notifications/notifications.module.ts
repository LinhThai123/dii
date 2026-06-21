import { Module } from '@nestjs/common';
import { NotificationQueueService } from './jobs/notification-queue.service';
import { SendNotificationProcessor } from './jobs/send-notification.processor';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { FcmProvider } from './providers/fcm.provider';

@Module({
  providers: [
    NotificationsService,
    FcmProvider,
    EmailProvider,
    NotificationQueueService,
    SendNotificationProcessor,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

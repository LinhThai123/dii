import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoupleLinkedEvent, DateCreatedEvent, Events } from '../../common/events';
import { EmailProvider } from './providers/email.provider';
import { FcmProvider } from './providers/fcm.provider';
import { NotificationQueueService } from './jobs/notification-queue.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly emailProvider: EmailProvider,
    private readonly queueService: NotificationQueueService,
  ) {}

  sendPush(payload: { userId: string; title: string; body: string }) {
    return this.fcmProvider.send(payload);
  }

  enqueuePush(payload: { userId: string; title: string; body: string }) {
    return this.queueService.enqueuePush(payload);
  }

  @OnEvent(Events.COUPLE_LINKED)
  handleCoupleLinked(event: CoupleLinkedEvent) {
    for (const userId of event.userIds) {
      this.enqueuePush({
        userId,
        title: 'Couple linked!',
        body: 'You are now connected with your partner.',
      });
    }
  }

  @OnEvent(Events.DATE_CREATED)
  handleDateCreated(event: DateCreatedEvent) {
    this.enqueuePush({
      userId: event.coupleId,
      title: 'New date planned',
      body: 'A new date has been added to your calendar.',
    });
  }
}

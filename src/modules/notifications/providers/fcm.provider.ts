import { Injectable, Logger } from '@nestjs/common';

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
}

@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);

  async send(payload: PushNotificationPayload) {
    // TODO: Integrate Firebase Cloud Messaging
    this.logger.log(`Push to ${payload.userId}: ${payload.title}`);
    return { success: true };
  }
}

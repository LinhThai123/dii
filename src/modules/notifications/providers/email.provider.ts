import { Injectable, Logger } from '@nestjs/common';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async send(payload: EmailPayload) {
    // TODO: Integrate SendGrid
    this.logger.log(`Email to ${payload.to}: ${payload.subject}`);
    return { success: true };
  }
}

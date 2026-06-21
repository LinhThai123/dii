import { Injectable, Logger } from '@nestjs/common';

export interface GoogleUserInfo {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthProvider {
  private readonly logger = new Logger(GoogleAuthProvider.name);

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    // TODO: Integrate google-auth-library OAuth2Client.verifyIdToken
    // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.logger.warn('Google token verification stub — replace in production');

    if (!idToken || idToken.length < 10) {
      throw new Error('Invalid Google ID token');
    }

    return {
      sub: `google_stub_${idToken.slice(-12)}`,
      email: undefined,
      name: undefined,
      picture: undefined,
    };
  }
}

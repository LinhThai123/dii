import { Injectable, Logger } from '@nestjs/common';

export interface FacebookUserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: { data?: { url?: string } };
}

@Injectable()
export class FacebookAuthProvider {
  private readonly logger = new Logger(FacebookAuthProvider.name);

  async verifyAccessToken(accessToken: string): Promise<FacebookUserInfo> {
    // TODO: GET https://graph.facebook.com/me?fields=id,name,email,picture
    this.logger.warn('Facebook token verification stub — replace in production');

    if (!accessToken || accessToken.length < 10) {
      throw new Error('Invalid Facebook access token');
    }

    return {
      id: `facebook_stub_${accessToken.slice(-12)}`,
    };
  }
}

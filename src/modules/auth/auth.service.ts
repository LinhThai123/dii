import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, OtpPurpose, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TOKEN_TYPE } from '../../common/constants/api.constants';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '../../common/exceptions';
import {
  generateOtpCode,
  hashToken,
  hashOtp,
  verifyOtp,
} from '../../common/utils/crypto.util';
import { isValidVietnamesePhone, normalizePhone } from '../../common/utils/phone.util';
import { Events, UserCreatedEvent } from '../../common/events';
import { MobileJwtPayload } from '../../shared/interfaces/mobile-jwt-payload.interface';
import type { MobileAuthenticatedUser } from '../../shared/interfaces/mobile-jwt-payload.interface';
import { AuthRepository } from './auth.repository';
import { FacebookAuthProvider } from './providers/facebook-auth.provider';
import { GoogleAuthProvider } from './providers/google-auth.provider';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpTtlMs = 5 * 60 * 1000;
  private readonly maxOtpAttempts = 3;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly googleProvider: GoogleAuthProvider,
    private readonly facebookProvider: FacebookAuthProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendPhoneOtp(phone: string) {
    const normalized = normalizePhone(phone);
    if (!isValidVietnamesePhone(normalized)) {
      throw new BadRequestException('Invalid phone number');
    }

    const code = generateOtpCode();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + this.otpTtlMs);

    await this.authRepository.saveOtp(
      normalized,
      codeHash,
      OtpPurpose.LOGIN,
      expiresAt,
    );

    if (this.config.get('app.nodeEnv') === 'development') {
      this.logger.log(`[DEV OTP] ${normalized}: ${code}`);
    }

    // TODO: Send SMS via provider
    return { message: 'OTP sent', expiresIn: this.otpTtlMs / 1000 };
  }

  async verifyPhoneOtp(phone: string, code: string, name?: string) {
    const normalized = normalizePhone(phone);
    const otp = await this.authRepository.findLatestOtp(
      normalized,
      OtpPurpose.LOGIN,
    );

    if (!otp) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    if (otp.attempts >= this.maxOtpAttempts) {
      throw new UnauthorizedException('Too many attempts');
    }

    const valid = await verifyOtp(code, otp.codeHash);
    if (!valid) {
      await this.authRepository.incrementOtpAttempts(otp.id);
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.authRepository.deleteOtp(otp.id);

    let account = await this.authRepository.findAuthAccount(
      AuthProvider.PHONE,
      normalized,
    );

    if (!account) {
      const user = await this.authRepository.createUserWithAuthAccount({
        phone: normalized,
        name,
        provider: AuthProvider.PHONE,
        providerAccountId: normalized,
        isVerified: true,
      });
      this.eventEmitter.emit(
        Events.USER_CREATED,
        new UserCreatedEvent(user.id, user.email ?? normalized),
      );
    } else {
      await this.authRepository.updateAuthAccountTokens(account.id, {});
    }

    account = await this.authRepository.findAuthAccount(
      AuthProvider.PHONE,
      normalized,
    );

    return this.issueTokens(account!.user.id);
  }

  async loginWithGoogle(idToken: string) {
    const googleUser = await this.googleProvider.verifyIdToken(idToken);
    return this.loginWithOAuthProvider({
      provider: AuthProvider.GOOGLE,
      providerAccountId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
      metadata: googleUser,
    });
  }

  async loginWithFacebook(accessToken: string) {
    const fbUser = await this.facebookProvider.verifyAccessToken(accessToken);
    return this.loginWithOAuthProvider({
      provider: AuthProvider.FACEBOOK,
      providerAccountId: fbUser.id,
      email: fbUser.email,
      name: fbUser.name,
      avatar: fbUser.picture?.data?.url,
      metadata: fbUser,
    });
  }

  async linkPhone(user: MobileAuthenticatedUser, phone: string, code: string) {
    const normalized = normalizePhone(phone);
    const otp = await this.authRepository.findLatestOtp(
      normalized,
      OtpPurpose.LINK_ACCOUNT,
    );

    if (!otp) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    const valid = await verifyOtp(code, otp.codeHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.authRepository.deleteOtp(otp.id);

    const existing = await this.authRepository.findAuthAccount(
      AuthProvider.PHONE,
      normalized,
    );
    if (existing && existing.userId !== user.id) {
      throw new ConflictException('Phone already linked to another account');
    }

    if (!existing) {
      await this.authRepository.linkAuthAccount(user.id, {
        provider: AuthProvider.PHONE,
        providerAccountId: normalized,
        isVerified: true,
      });
    }

    return { message: 'Phone linked successfully' };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.authRepository.findRefreshToken(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(stored.userId, stored.id);
  }

  async logout(userId: string) {
    await this.authRepository.deleteUserRefreshTokens(userId);
    return { message: 'Logged out' };
  }

  async getLinkedAccounts(userId: string) {
    const accounts = await this.authRepository.findUserAuthAccounts(userId);
    return accounts.map((a) => ({
      provider: a.provider,
      isVerified: a.isVerified,
      linkedAt: a.createdAt,
    }));
  }

  private async loginWithOAuthProvider(data: {
    provider: AuthProvider;
    providerAccountId: string;
    email?: string;
    name?: string;
    avatar?: string;
    metadata?: unknown;
  }) {
    let account = await this.authRepository.findAuthAccount(
      data.provider,
      data.providerAccountId,
    );

    if (!account) {
      const user = await this.authRepository.createUserWithAuthAccount({
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        isVerified: true,
        metadata: data.metadata as Prisma.InputJsonValue,
      });
      this.eventEmitter.emit(
        Events.USER_CREATED,
        new UserCreatedEvent(user.id, user.email ?? ''),
      );
      account = await this.authRepository.findAuthAccount(
        data.provider,
        data.providerAccountId,
      );
    }

    return this.issueTokens(account!.user.id);
  }

  private async issueTokens(userId: string, replaceRefreshTokenId?: string) {
    const payload: MobileJwtPayload = {
      sub: userId,
      type: TOKEN_TYPE.MOBILE,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.mobileRefreshSecret'),
      expiresIn: '7d',
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (replaceRefreshTokenId) {
      await this.authRepository.deleteRefreshToken(replaceRefreshTokenId);
    }

    await this.authRepository.saveRefreshToken(
      userId,
      hashToken(refreshToken),
      expiresAt,
    );

    return { accessToken, refreshToken };
  }
}

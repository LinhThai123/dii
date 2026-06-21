import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TOKEN_TYPE } from '../../../common/constants/api.constants';
import { UnauthorizedException } from '../../../common/exceptions';
import { hashToken } from '../../../common/utils/crypto.util';
import { AdminJwtPayload } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { AdminAuthRepository } from './admin-auth.repository';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminAuthRepository: AdminAuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, ip?: string) {
    const admin = await this.adminAuthRepository.findByEmail(email);

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.adminAuthRepository.updateLastLogin(admin.id, ip);
    return this.issueTokens(admin.id, this.extractPermissions(admin));
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.adminAuthRepository.findRefreshToken(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const admin = await this.adminAuthRepository.findById(stored.adminId);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(admin.id, this.extractPermissions(admin), stored.id);
  }

  async logout(adminId: string) {
    await this.adminAuthRepository.deleteAdminRefreshTokens(adminId);
    return { message: 'Logged out' };
  }

  async getProfile(adminId: string) {
    const admin = await this.adminAuthRepository.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roles: admin.roles.map((r) => r.role.code),
      permissions: this.extractPermissions(admin),
    };
  }

  private extractPermissions(admin: {
    roles: {
      role: {
        permissions: { permission: { code: string } }[];
      };
    }[];
  }): string[] {
    const codes = new Set<string>();
    for (const userRole of admin.roles) {
      for (const rp of userRole.role.permissions) {
        codes.add(rp.permission.code);
      }
    }
    return Array.from(codes);
  }

  private async issueTokens(
    adminId: string,
    permissions: string[],
    replaceRefreshTokenId?: string,
  ) {
    const payload: AdminJwtPayload = {
      sub: adminId,
      type: TOKEN_TYPE.ADMIN,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: adminId, type: TOKEN_TYPE.ADMIN },
      {
        secret: this.config.get<string>('jwt.adminRefreshSecret'),
        expiresIn: '7d',
      },
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (replaceRefreshTokenId) {
      await this.adminAuthRepository.deleteRefreshToken(replaceRefreshTokenId);
    }

    await this.adminAuthRepository.saveRefreshToken(
      adminId,
      hashToken(refreshToken),
      expiresAt,
    );

    return { accessToken, refreshToken };
  }
}

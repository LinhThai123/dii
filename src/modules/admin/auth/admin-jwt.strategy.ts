import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TOKEN_TYPE } from '../../../common/constants/api.constants';
import { UnauthorizedException } from '../../../common/exceptions';
import { AdminJwtPayload } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { AdminAuthRepository } from './admin-auth.repository';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    config: ConfigService,
    private readonly adminAuthRepository: AdminAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.adminSecret')!,
    });
  }

  async validate(payload: AdminJwtPayload) {
    if (payload.type !== TOKEN_TYPE.ADMIN) {
      throw new UnauthorizedException('Invalid token type');
    }

    const admin = await this.adminAuthRepository.findById(payload.sub);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account inactive');
    }

    return {
      id: payload.sub,
      email: admin.email,
      permissions: payload.permissions ?? [],
    };
  }
}

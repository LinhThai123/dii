import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TOKEN_TYPE } from '../../../common/constants/api.constants';
import { UnauthorizedException } from '../../../common/exceptions';
import { MobileJwtPayload } from '../../../shared/interfaces/mobile-jwt-payload.interface';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.mobileSecret')!,
    });
  }

  validate(payload: MobileJwtPayload) {
    if (payload.type !== TOKEN_TYPE.MOBILE) {
      throw new UnauthorizedException('Invalid token type');
    }
    return { id: payload.sub };
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_API_PREFIX } from '../constants/api.constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AdminJwtAuthGuard } from './admin-jwt.guard';
import { MobileJwtAuthGuard } from './mobile-jwt.guard';

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private mobileGuard: MobileJwtAuthGuard,
    private adminGuard: AdminJwtAuthGuard,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ url?: string }>();
    const url = request.url ?? '';

    if (url.includes(`/${ADMIN_API_PREFIX}/`)) {
      return this.adminGuard.canActivate(context);
    }

    return this.mobileGuard.canActivate(context);
  }
}

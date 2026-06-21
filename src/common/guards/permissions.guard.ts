import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ForbiddenException } from '../exceptions';
import type { AdminAuthenticatedUser } from '../../shared/interfaces/admin-jwt-payload.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<{
      user?: AdminAuthenticatedUser;
    }>();

    if (!user?.permissions?.length) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (user.permissions.includes('*')) return true;

    const hasPermission = required.every((p) => user.permissions.includes(p));
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

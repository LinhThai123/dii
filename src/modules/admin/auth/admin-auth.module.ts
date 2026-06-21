import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AdminJwtModule } from './admin-jwt.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthRepository } from './admin-auth.repository';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtStrategy } from './admin-jwt.strategy';

@Module({
  imports: [PassportModule, AdminJwtModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminAuthRepository, AdminJwtStrategy],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}

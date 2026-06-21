import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { FacebookAuthProvider } from './providers/facebook-auth.provider';
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { MobileJwtStrategy } from './strategies/mobile-jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'mobile-jwt' })],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    GoogleAuthProvider,
    FacebookAuthProvider,
    MobileJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

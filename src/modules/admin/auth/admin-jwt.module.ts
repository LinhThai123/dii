import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('jwt.adminSecret'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AdminJwtModule {}

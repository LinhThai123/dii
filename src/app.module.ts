import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RouterModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { validateEnv } from './config/env.validation';
import { MOBILE_API_PREFIX, ADMIN_API_PREFIX } from './common/constants/api.constants';
import { AppCacheModule } from './common/cache/cache.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppAuthGuard } from './common/guards/app-auth.guard';
import { AdminJwtAuthGuard } from './common/guards/admin-jwt.guard';
import { MobileJwtAuthGuard } from './common/guards/mobile-jwt.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { QueueModule } from './common/queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { MobileJwtModule } from './shared/mobile-jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    LoggerModule,
    AppCacheModule,
    QueueModule,
    DatabaseModule,
    MobileJwtModule,
    MobileModule,
    AdminModule,
    RouterModule.register([
      { path: MOBILE_API_PREFIX, module: MobileModule },
      { path: ADMIN_API_PREFIX, module: AdminModule },
    ]),
  ],
  providers: [
    MobileJwtAuthGuard,
    AdminJwtAuthGuard,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AppAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}

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
import s3Config from './config/s3.config';
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
import { AdminAuthModule } from './modules/admin/auth/admin-auth.module';
import { AdminsModule } from './modules/admin/admins/admins.module';
import { AuditLogsModule } from './modules/admin/audit-logs/audit-logs.module';
import { AnniversariesModule as AdminAnniversariesModule } from './modules/admin/anniversaries/anniversaries.module';
import { CouplesModule as AdminCouplesModule } from './modules/admin/couples/couples.module';
import { DatesModule as AdminDatesModule } from './modules/admin/dates/dates.module';
import { MediaModule as AdminMediaModule } from './modules/admin/media/media.module';
import { MemoriesModule as AdminMemoriesModule } from './modules/admin/memories/memories.module';
import { PlacesModule as AdminPlacesModule } from './modules/admin/places/places.module';
import { ReviewsModule as AdminReviewsModule } from './modules/admin/reviews/reviews.module';
import { RolesModule } from './modules/admin/roles/roles.module';
import { SettingsModule } from './modules/admin/settings/settings.module';
import { UsersModule as AdminUsersModule } from './modules/admin/users/users.module';
import { AlbumsModule } from './modules/albums/albums.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { CouplesModule } from './modules/couples/couples.module';
import { DatesModule } from './modules/dates/dates.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './common/health/health.module';
import { MobileJwtModule } from './shared/mobile-jwt.module';
import { MapboxModule } from './shared/mapbox/mapbox.module';
import { S3Module } from './shared/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, s3Config],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    LoggerModule,
    AppCacheModule,
    QueueModule,
    DatabaseModule,
    MobileJwtModule,
    MapboxModule,
    S3Module,
    MobileModule,
    AdminModule,
    RouterModule.register([
      {
        path: MOBILE_API_PREFIX,
        module: MobileModule,
        children: [
          { path: '', module: HealthModule },
          { path: '', module: AuthModule },
          { path: '', module: UsersModule },
          { path: '', module: CouplesModule },
          { path: '', module: DatesModule },
          { path: '', module: MemoriesModule },
          { path: '', module: LocationsModule },
          { path: '', module: AlbumsModule },
          { path: '', module: ChatModule },
          { path: '', module: NotificationsModule },
          { path: '', module: UploadsModule },
        ],
      },
      {
        path: ADMIN_API_PREFIX,
        module: AdminModule,
        children: [
          { path: '', module: AdminAuthModule },
          { path: '', module: SettingsModule },
          { path: '', module: AdminsModule },
          { path: '', module: RolesModule },
          { path: '', module: AuditLogsModule },
          { path: '', module: AdminUsersModule },
          { path: '', module: AdminCouplesModule },
          { path: '', module: AdminAnniversariesModule },
          { path: '', module: AdminPlacesModule },
          { path: '', module: AdminDatesModule },
          { path: '', module: AdminMemoriesModule },
          { path: '', module: AdminMediaModule },
          { path: '', module: AdminReviewsModule },
          { path: '', module: UploadsModule },
        ],
      },
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

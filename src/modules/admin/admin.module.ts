import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AnniversariesModule } from './anniversaries/anniversaries.module';
import { CouplesModule } from './couples/couples.module';
import { DatesModule } from './dates/dates.module';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { MediaModule } from './media/media.module';
import { MemoriesModule } from './memories/memories.module';
import { PlacesModule } from './places/places.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { AdminSharedModule } from './shared/admin-shared.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    AdminSharedModule,
    AdminAuthModule,
    SettingsModule,
    AdminsModule,
    RolesModule,
    AuditLogsModule,
    UsersModule,
    CouplesModule,
    AnniversariesModule,
    PlacesModule,
    DatesModule,
    MemoriesModule,
    MediaModule,
    ReviewsModule,
    UploadsModule,
  ],
  controllers: [AdminDashboardController],
})
export class AdminModule {}

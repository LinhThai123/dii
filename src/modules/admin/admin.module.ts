import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { AdminSharedModule } from './shared/admin-shared.module';
import { AdminUsersController } from './users/admin-users.controller';

@Module({
  imports: [
    AdminSharedModule,
    AdminAuthModule,
    SettingsModule,
    AdminsModule,
    RolesModule,
    AuditLogsModule,
  ],
  controllers: [AdminDashboardController, AdminUsersController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CouplesModule } from '../couples/couples.module';
import { DatesModule } from '../dates/dates.module';
import { MemoriesModule } from '../memories/memories.module';
import { LocationsModule } from '../locations/locations.module';
import { AlbumsModule } from '../albums/albums.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadsModule } from '../uploads/uploads.module';
import { HealthModule } from '../../common/health/health.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    CouplesModule,
    DatesModule,
    MemoriesModule,
    LocationsModule,
    AlbumsModule,
    ChatModule,
    NotificationsModule,
    UploadsModule,
  ],
})
export class MobileModule {}

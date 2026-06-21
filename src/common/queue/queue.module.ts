import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const NOTIFICATIONS_QUEUE = 'notifications';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
      }),
    }),
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}

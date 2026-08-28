import { Module } from '@nestjs/common';
import { DatesController } from './dates.controller';
import { DatesRepository } from './dates.repository';
import { DatesService } from './dates.service';

@Module({
  controllers: [DatesController],
  providers: [DatesService, DatesRepository],
})
export class DatesModule {}

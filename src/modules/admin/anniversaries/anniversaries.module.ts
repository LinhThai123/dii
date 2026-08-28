import { Module } from '@nestjs/common';
import { AnniversariesController } from './anniversaries.controller';
import { AnniversariesRepository } from './anniversaries.repository';
import { AnniversariesService } from './anniversaries.service';

@Module({
  controllers: [AnniversariesController],
  providers: [AnniversariesService, AnniversariesRepository],
})
export class AnniversariesModule {}

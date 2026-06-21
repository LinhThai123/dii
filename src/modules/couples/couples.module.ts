import { Module } from '@nestjs/common';
import { CouplesController } from './couples.controller';
import { CouplesRepository } from './couples.repository';
import { CouplesService } from './couples.service';

@Module({
  controllers: [CouplesController],
  providers: [CouplesService, CouplesRepository],
  exports: [CouplesService],
})
export class CouplesModule {}

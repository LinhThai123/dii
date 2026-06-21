import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { MobileAuthenticatedUser } from '../../shared/interfaces/mobile-jwt-payload.interface';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { MemoriesService } from './memories.service';

@ApiTags('memories')
@ApiBearerAuth()
@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get()
  findAll(@Query('coupleId') coupleId: string) {
    return this.memoriesService.findByCoupleId(coupleId);
  }

  @Post()
  create(
    @CurrentUser() user: MobileAuthenticatedUser,
    @Body() dto: CreateMemoryDto,
  ) {
    return this.memoriesService.create(user.id, dto);
  }
}

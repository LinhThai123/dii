import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { MobileAuthenticatedUser } from '../../shared/interfaces/mobile-jwt-payload.interface';
import { DatesService } from './dates.service';
import { CreateDatePlanDto } from './dto/create-date-plan.dto';

@ApiTags('dates')
@ApiBearerAuth()
@Controller('dates')
export class DatesController {
  constructor(private readonly datesService: DatesService) {}

  @Get()
  findAll(@Query('coupleId') coupleId: string) {
    return this.datesService.findByCoupleId(coupleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datesService.findById(id);
  }

  @Post()
  create(
    @CurrentUser() user: MobileAuthenticatedUser,
    @Body() dto: CreateDatePlanDto,
  ) {
    return this.datesService.create(user.id, dto);
  }
}

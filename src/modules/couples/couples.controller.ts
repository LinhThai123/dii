import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { MobileAuthenticatedUser } from '../../shared/interfaces/mobile-jwt-payload.interface';
import { CouplesService } from './couples.service';
import { CreateCoupleDto, JoinCoupleDto } from './dto/create-couple.dto';

@ApiTags('couples')
@ApiBearerAuth()
@Controller('couples')
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Post()
  create(@CurrentUser() user: MobileAuthenticatedUser, @Body() dto: CreateCoupleDto) {
    return this.couplesService.create(user.id, dto);
  }

  @Post('join')
  join(@CurrentUser() user: MobileAuthenticatedUser, @Body() dto: JoinCoupleDto) {
    return this.couplesService.join(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couplesService.findById(id);
  }
}

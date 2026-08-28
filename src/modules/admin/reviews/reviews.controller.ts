import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { ReviewsService } from './reviews.service';

@ApiTags('admin-reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(PermissionsGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @RequirePermissions('reviews.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('placeId') placeId?: string,
    @Query('userId') userId?: string,
    @Query('minRating') minRating?: string,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      placeId,
      userId,
      minRating ? parseInt(minRating, 10) : undefined,
      search,
    );
  }

  @Get(':id')
  @RequirePermissions('reviews.read')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Delete(':id')
  @RequirePermissions('reviews.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.reviewsService.remove(id, admin.id, ip);
  }
}

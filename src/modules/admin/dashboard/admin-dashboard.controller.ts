import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { PrismaService } from '../../../database/prisma/prisma.service';

@ApiTags('admin-dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @RequirePermissions('analytics.read')
  async getStats() {
    const [users, couples, datePlans, places] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.couple.count({ where: { status: 'ACTIVE' } }),
      this.prisma.datePlan.count(),
      this.prisma.place.count(),
    ]);

    return { users, activeCouples: couples, datePlans, places };
  }
}

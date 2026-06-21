import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { AdminAuthService } from './admin-auth.service';

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

class AdminLoginDto {
  @ApiProperty({ example: 'admin@dii.app' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

@ApiTags('admin-auth')
@Controller('auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.adminAuthService.login(dto.email, dto.password, ip);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.adminAuthService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  logout(@CurrentUser() admin: AdminAuthenticatedUser) {
    return this.adminAuthService.logout(admin.id);
  }

  @Get('me')
  @ApiBearerAuth()
  getMe(@CurrentUser() admin: AdminAuthenticatedUser) {
    return this.adminAuthService.getProfile(admin.id);
  }
}

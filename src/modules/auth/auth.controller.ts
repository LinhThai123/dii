import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { MobileAuthenticatedUser } from '../../shared/interfaces/mobile-jwt-payload.interface';
import { AuthService } from './auth.service';
import {
  FacebookLoginDto,
  GoogleLoginDto,
  LinkPhoneDto,
  RefreshTokenDto,
  SendPhoneOtpDto,
  VerifyPhoneOtpDto,
} from './dto/auth.dto';

@ApiTags('mobile-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('phone/send-otp')
  sendOtp(@Body() dto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOtp(dto.phone);
  }

  @Public()
  @Post('phone/verify')
  verifyOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto.phone, dto.code, dto.name);
  }

  @Public()
  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Public()
  @Post('facebook')
  facebookLogin(@Body() dto: FacebookLoginDto) {
    return this.authService.loginWithFacebook(dto.accessToken);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  logout(@CurrentUser() user: MobileAuthenticatedUser) {
    return this.authService.logout(user.id);
  }

  @Get('accounts')
  @ApiBearerAuth()
  getAccounts(@CurrentUser() user: MobileAuthenticatedUser) {
    return this.authService.getLinkedAccounts(user.id);
  }

  @Post('link/phone')
  @ApiBearerAuth()
  linkPhone(
    @CurrentUser() user: MobileAuthenticatedUser,
    @Body() dto: LinkPhoneDto,
  ) {
    return this.authService.linkPhone(user, dto.phone, dto.code);
  }

  @Delete('accounts/:provider')
  @ApiBearerAuth()
  unlinkAccount(
    @CurrentUser() _user: MobileAuthenticatedUser,
    @Param('provider') _provider: AuthProvider,
  ) {
    // TODO: implement unlink with minimum 1 account rule
    return { message: 'Not implemented yet' };
  }
}

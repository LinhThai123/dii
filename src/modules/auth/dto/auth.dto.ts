import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class SendPhoneOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^(\+84|84|0)[0-9]{9,10}$/)
  phone: string;
}

export class VerifyPhoneOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ required: false })
  @IsString()
  name?: string;
}

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from mobile SDK' })
  @IsString()
  idToken: string;
}

export class FacebookLoginDto {
  @ApiProperty({ description: 'Facebook access token from mobile SDK' })
  @IsString()
  accessToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class LinkPhoneDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string;
}

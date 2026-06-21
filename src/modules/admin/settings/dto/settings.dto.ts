import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingValueType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ example: 'otp.expiry_minutes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'key must be lowercase alphanumeric with dots, underscores, or hyphens',
  })
  key: string;

  @ApiProperty({ example: '5' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ enum: SettingValueType, example: SettingValueType.NUMBER })
  @IsEnum(SettingValueType)
  valueType: SettingValueType;

  @ApiProperty({ example: 'auth' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 'OTP expiry (minutes)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}

export class UpdateSettingDto {
  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  value?: string;

  @ApiPropertyOptional({ enum: SettingValueType })
  @IsOptional()
  @IsEnum(SettingValueType)
  valueType?: SettingValueType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDatePlanDto {
  @ApiProperty()
  @IsString()
  coupleId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

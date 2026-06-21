import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMemoryDto {
  @ApiProperty()
  @IsString()
  coupleId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  memoryAt?: string;
}

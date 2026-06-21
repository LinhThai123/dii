import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty()
  @IsString()
  coupleId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}

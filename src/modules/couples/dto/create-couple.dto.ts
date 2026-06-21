import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCoupleDto {
  @ApiProperty({ required: false })
  @IsString()
  note?: string;
}

export class JoinCoupleDto {
  @ApiProperty({ example: 'A1B2C3D4' })
  @IsString()
  @Length(6, 12)
  inviteCode: string;
}

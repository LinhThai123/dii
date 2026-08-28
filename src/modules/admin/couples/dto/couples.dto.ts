import { ApiProperty } from '@nestjs/swagger';
import { CoupleStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCoupleStatusDto {
  @ApiProperty({ enum: CoupleStatus, example: CoupleStatus.INACTIVE })
  @IsEnum(CoupleStatus)
  status: CoupleStatus;
}

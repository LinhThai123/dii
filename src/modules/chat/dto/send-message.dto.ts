import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  coupleId: string;

  @ApiProperty()
  @IsString()
  content: string;
}

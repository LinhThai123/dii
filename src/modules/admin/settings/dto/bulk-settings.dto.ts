import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class BulkSettingsDto {
  @ApiProperty({
    description: 'Key-value map of platform settings',
    example: { 'general.platform_name': 'Dii' },
  })
  @IsObject()
  values: Record<string, string>;
}

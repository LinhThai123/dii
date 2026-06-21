import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UploadsService } from './uploads.service';

class PresignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: PresignedUrlDto) {
    return this.uploadsService.getPresignedUploadUrl(
      dto.filename,
      dto.contentType,
    );
  }
}

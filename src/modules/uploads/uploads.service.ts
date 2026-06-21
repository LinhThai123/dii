import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  getPresignedUploadUrl(filename: string, contentType: string) {
    const key = `uploads/${randomUUID()}-${filename}`;
    const bucket = this.config.get<string>('AWS_S3_BUCKET') ?? 'dii-uploads';

    // TODO: Integrate AWS S3 presigned URL
    return {
      uploadUrl: `https://${bucket}.s3.amazonaws.com/${key}`,
      key,
      contentType,
      expiresIn: 3600,
    };
  }
}

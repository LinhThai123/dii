import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3Service } from '../../shared/s3/s3.service';

@Injectable()
export class UploadsService {
  constructor(private readonly s3: S3Service) {}

  getPresignedUploadUrl(filename: string, contentType: string) {
    const key = `uploads/${randomUUID()}-${filename}`;
    return this.s3.getPresignedUploadUrl(key, contentType);
  }
}

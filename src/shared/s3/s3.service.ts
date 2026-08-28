import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('s3.endpoint');
    const region = this.config.get<string>('s3.region') ?? 'us-east-1';
    const accessKeyId = this.config.get<string>('s3.accessKeyId') ?? '';
    const secretAccessKey =
      this.config.get<string>('s3.secretAccessKey') ?? '';

    this.bucket = this.config.get<string>('s3.bucket') ?? 'dii-uploads';
    this.client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: endpoint
        ? (this.config.get<boolean>('s3.forcePathStyle') ?? true)
        : false,
    });

    const publicUrl = this.config.get<string>('s3.publicUrl');
    this.publicBaseUrl =
      publicUrl ??
      (endpoint
        ? `${endpoint.replace(/\/$/, '')}/${this.bucket}`
        : `https://${this.bucket}.s3.${region}.amazonaws.com`);
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      contentType,
      expiresIn,
      publicUrl: this.getPublicUrl(key),
    };
  }

  getPublicUrl(key: string) {
    return `${this.publicBaseUrl}/${key}`;
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

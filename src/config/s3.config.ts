import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION ?? 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET ?? 'dii-uploads',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  publicUrl: process.env.AWS_S3_PUBLIC_URL || undefined,
  forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE !== 'false',
}));

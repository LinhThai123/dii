import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  /** Fixed OTP for local dev when SMS/Firebase is not configured. Ignored in production. */
  devOtpCode: process.env.DEV_OTP_CODE,
}));

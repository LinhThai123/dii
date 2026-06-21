import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  mobileSecret: process.env.MOBILE_JWT_SECRET ?? process.env.JWT_SECRET,
  mobileRefreshSecret:
    process.env.MOBILE_JWT_REFRESH_SECRET ?? process.env.JWT_REFRESH_SECRET,
  mobileRefreshExpiresIn: process.env.MOBILE_JWT_REFRESH_EXPIRES_IN ?? '7d',
  adminSecret: process.env.ADMIN_JWT_SECRET,
  adminRefreshSecret: process.env.ADMIN_JWT_REFRESH_SECRET,
  adminRefreshExpiresIn: process.env.ADMIN_JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

import { createHash, randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, '0');
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

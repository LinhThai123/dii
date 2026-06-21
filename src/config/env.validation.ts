import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  MOBILE_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  MOBILE_JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_JWT_REFRESH_SECRET: string;

  @IsString()
  MOBILE_JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  ADMIN_JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
  ) {
    super(
      {
        statusCode: status,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

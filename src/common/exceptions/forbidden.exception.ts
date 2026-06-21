import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, HttpStatus.FORBIDDEN, code);
  }
}

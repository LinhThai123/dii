import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, HttpStatus.NOT_FOUND, code);
  }
}

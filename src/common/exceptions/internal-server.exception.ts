import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class InternalServerException extends BaseException {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, code);
  }
}

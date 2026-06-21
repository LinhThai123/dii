import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ConflictException extends BaseException {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, HttpStatus.CONFLICT, code);
  }
}

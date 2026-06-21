import { Global, Injectable, Logger, Module } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('App');

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, context?: string, trace?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }
}

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

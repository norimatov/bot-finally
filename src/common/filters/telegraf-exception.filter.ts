
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Context } from 'telegraf';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TelegrafExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp().getRequest<Context>();
    
    this.logger.error(`Bot error: ${exception.message}`, exception.stack);
    
    ctx.reply('❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
  }
}

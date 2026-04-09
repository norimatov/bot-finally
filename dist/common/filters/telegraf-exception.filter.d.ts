import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class TelegrafExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: Error, host: ArgumentsHost): void;
}

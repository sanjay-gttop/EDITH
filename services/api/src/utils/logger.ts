export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  correlation_id?: string;
  actor_id?: string;
  resource_id?: string;
  client_event_id?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private readonly serviceName: string = 'api-service') {}

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      context: context || {},
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
    // Structured JSON log output for CloudWatch Logs
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  error(message: string, context?: LogContext, err?: Error): void {
    this.log('ERROR', message, context, err);
  }
}

export const logger = new Logger('resqsync-api');

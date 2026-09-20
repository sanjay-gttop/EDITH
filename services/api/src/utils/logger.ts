import type { WorkloadType } from './metrics';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  correlation_id?: string;
  actor_id?: string;
  resource_id?: string;
  client_event_id?: string;
  workload_type?: WorkloadType;
  environment?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(
    private readonly serviceName: string = 'api-service',
    private readonly defaultWorkload: WorkloadType = 'Lambda',
  ) {}

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      workload_type: context?.workload_type || this.defaultWorkload,
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
    // Structured JSON log output for CloudWatch Logs across all workloads
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

export const logger = new Logger('resqsync-api', 'Lambda');
export const ecsLogger = new Logger('resqsync-ecs-task', 'ECS');
export const stepFunctionsLogger = new Logger('resqsync-orchestrator', 'StepFunctions');
export const sagemakerLogger = new Logger('resqsync-ai-service', 'SageMaker');

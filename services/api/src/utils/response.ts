import type { APIGatewayProxyResult } from 'aws-lambda';
import { AppError } from './errors';
import { logger } from './logger';

export interface ApiResponseOptions {
  headers?: Record<string, string>;
  correlationId?: string;
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Client-Id,X-Correlation-Id',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
};

export function successResponse(
  body: unknown,
  statusCode: number = 200,
  options: ApiResponseOptions = {},
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...DEFAULT_HEADERS,
      'X-Correlation-Id': options.correlationId || crypto.randomUUID(),
      ...options.headers,
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  error: unknown,
  correlationId: string = crypto.randomUUID(),
): APIGatewayProxyResult {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    logger.warn(`API Error: [${error.code}] ${error.message}`, {
      correlation_id: correlationId,
      status: error.statusCode,
      details: error.details,
    });

    return {
      statusCode: error.statusCode,
      headers: {
        ...DEFAULT_HEADERS,
        'X-Correlation-Id': correlationId,
      },
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          correlation_id: correlationId,
          timestamp,
          details: error.details,
        },
      }),
    };
  }

  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(`Unhandled Exception: ${err.message}`, { correlation_id: correlationId }, err);

  return {
    statusCode: 500,
    headers: {
      ...DEFAULT_HEADERS,
      'X-Correlation-Id': correlationId,
    },
    body: JSON.stringify({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred. Please contact system support.',
        correlation_id: correlationId,
        timestamp,
      },
    }),
  };
}

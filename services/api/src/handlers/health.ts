import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  try {
    logger.info('Health check requested', { correlation_id: correlationId });

    return successResponse(
      {
        status: 'HEALTHY',
        service: 'resqsync-api',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        environment: process.env.NODE_ENV || 'production',
      },
      200,
      { correlationId },
    );
  } catch (error) {
    return errorResponse(error, correlationId);
  }
}

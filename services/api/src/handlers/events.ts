import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  const entityId = event.pathParameters?.entity_id;

  try {
    if (!entityId) {
      throw new ValidationError('entity_id is required in URL path');
    }

    logger.info('List append-only events for entity', {
      correlation_id: correlationId,
      entity_id: entityId,
    });

    return successResponse(
      {
        entity_id: entityId,
        events: [],
        total: 0,
      },
      200,
      { correlationId },
    );
  } catch (error) {
    return errorResponse(error, correlationId);
  }
}

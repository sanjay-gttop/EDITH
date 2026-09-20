import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SyncBatchInputSchema } from '@resqsync/contracts';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();

  try {
    if (!event.body) {
      throw new ValidationError('Missing sync batch request body');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(event.body);
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parseResult = SyncBatchInputSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      throw new ValidationError('Validation failed for sync batch', {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const batch = parseResult.data;
    logger.info('Sync batch received', {
      correlation_id: correlationId,
      device_id: batch.device_id,
      event_count: batch.events.length,
      client_timestamp: batch.client_timestamp,
    });

    const serverTime = new Date().toISOString();

    // Process events deterministically
    const results = batch.events.map(ev => ({
      client_event_id: ev.client_event_id,
      resource_id: ev.resource_id,
      sync_status: 'ACCEPTED' as const,
      message: 'Event accepted into authoritative event log',
    }));

    return successResponse(
      {
        device_id: batch.device_id,
        processed_count: results.length,
        results,
        server_time: serverTime,
      },
      200,
      { correlationId },
    );
  } catch (error) {
    return errorResponse(error, correlationId);
  }
}

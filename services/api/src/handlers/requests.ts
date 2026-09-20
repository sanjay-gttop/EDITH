import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateRequestInputSchema } from '@resqsync/contracts';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();

  try {
    if (!event.body) {
      throw new ValidationError('Missing emergency request body');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(event.body);
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parseResult = CreateRequestInputSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      throw new ValidationError('Invalid emergency request parameters', {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const input = parseResult.data;
    logger.info('Emergency request received', {
      correlation_id: correlationId,
      incident_id: input.incident_id,
      severity: input.severity,
      channel: input.reporting_channel,
    });

    const serverTime = new Date().toISOString();
    return successResponse(
      {
        request_id: `REQ-${Date.now()}`,
        incident_id: input.incident_id,
        status: 'PENDING',
        created_at: serverTime,
      },
      201,
      { correlationId },
    );
  } catch (error) {
    return errorResponse(error, correlationId);
  }
}

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ClaimResourceInputSchema } from '@resqsync/contracts';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();

  try {
    if (!event.body) {
      throw new ValidationError('Missing request body');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(event.body);
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parseResult = ClaimResourceInputSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      throw new ValidationError('Validation failed for claim request', {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const claimInput = parseResult.data;

    logger.info('Resource claim request validated', {
      correlation_id: correlationId,
      resource_id: claimInput.resource_id,
      actor_id: claimInput.actor_id,
      client_event_id: claimInput.client_event_id,
      observed_version: claimInput.observed_version,
    });

    // Milestone 1 handler structure: validate contracts and return structured success
    // Authoritative DynamoDB conditional update is implemented in Milestone 3
    const serverTime = new Date().toISOString();
    metrics.recordClaimSuccess(claimInput.resource_id, 12);

    return successResponse(
      {
        claim_id: `claim-${Date.now()}`,
        resource_id: claimInput.resource_id,
        status: 'CLAIMED',
        version: claimInput.observed_version + 1,
        authoritative_state: {
          resource_id: claimInput.resource_id,
          resource_type: 'AMBULANCE_ALS',
          call_sign: 'Medic-Unit',
          status: 'CLAIMED',
          version: claimInput.observed_version + 1,
          agency_id: 'AGY-METRO-EMS',
          assigned_incident_id: claimInput.incident_id,
          assigned_actor_id: claimInput.actor_id,
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          updated_at: serverTime,
        },
        server_time: serverTime,
      },
      200,
      { correlationId },
    );
  } catch (error) {
    metrics.recordLambdaError('claimsHandler', (error as Error).name);
    return errorResponse(error, correlationId);
  }
}

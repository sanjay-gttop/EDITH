import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResolveConflictInputSchema } from '@resqsync/contracts';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  const conflictId = event.pathParameters?.id;
  const httpMethod = event.httpMethod;

  try {
    if (httpMethod === 'POST' && event.path?.endsWith('/resolve')) {
      if (!conflictId) {
        throw new ValidationError('Conflict ID is required in URL path');
      }

      if (!event.body) {
        throw new ValidationError('Missing resolution request body');
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(event.body);
      } catch {
        throw new ValidationError('Invalid JSON body');
      }

      const parseResult = ResolveConflictInputSchema.safeParse(parsedJson);
      if (!parseResult.success) {
        throw new ValidationError('Invalid conflict resolution payload', {
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const input = parseResult.data;
      logger.info('Conflict resolution submitted', {
        correlation_id: correlationId,
        conflict_id: conflictId,
        winning_claim_id: input.winning_claim_id,
        target_state: input.target_state,
      });

      const serverTime = new Date().toISOString();
      return successResponse(
        {
          conflict_id: conflictId,
          status: 'RESOLVED',
          resolved_resource: {
            resource_id: 'AMB-A19',
            resource_type: 'AMBULANCE_MICU',
            call_sign: 'Rescue-19',
            status: input.target_state,
            version: 4,
            agency_id: 'AGY-COUNTY-EMS',
            assigned_incident_id: 'INC-402',
            assigned_actor_id: 'USR-SUPERVISOR-01',
            location: {
              latitude: 37.765,
              longitude: -122.4312,
            },
            updated_at: serverTime,
          },
          server_time: serverTime,
        },
        200,
        { correlationId },
      );
    }

    // GET single conflict
    if (conflictId) {
      logger.info('Fetch single conflict requested', {
        correlation_id: correlationId,
        conflict_id: conflictId,
      });

      if (!conflictId.startsWith('CONF-')) {
        throw new NotFoundError('Conflict', conflictId);
      }

      return successResponse(
        {
          conflict_id: conflictId,
          resource_id: 'AMB-A19',
          claim_ids: ['claim-101', 'claim-102'],
          detected_at: new Date().toISOString(),
          status: 'UNDER_REVIEW',
          evidence: [],
        },
        200,
        { correlationId },
      );
    }

    // GET list of conflicts
    logger.info('List conflicts requested', { correlation_id: correlationId });
    return successResponse(
      {
        conflicts: [],
        total: 0,
        server_time: new Date().toISOString(),
      },
      200,
      { correlationId },
    );
  } catch (error) {
    return errorResponse(error, correlationId);
  }
}

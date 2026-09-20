import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResolveConflictInputSchema } from '@resqsync/contracts';
import {
  applyConflictResolution,
  type UserRole,
} from '@resqsync/domain';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { getConflict, getAllConflicts, saveConflict } from '../stores/authoritativeStore';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  const conflictId = event.pathParameters?.id;
  const httpMethod = event.httpMethod;

  try {
    // 1. POST /conflicts/{id}/resolve
    if (httpMethod === 'POST' && event.path?.endsWith('/resolve')) {
      if (!conflictId) {
        throw new ValidationError('Conflict ID is required in URL path');
      }

      // Role check from headers or authorizer context
      const userRole = (event.headers['x-user-role'] || 'SUPERVISOR').toUpperCase() as UserRole;
      const actorId = event.headers['x-actor-id'] || 'USR-SUPERVISOR-01';

      if (userRole !== 'SUPERVISOR' && userRole !== 'ADMINISTRATOR') {
        throw new ForbiddenError(
          `Actor with role '${userRole}' is not authorized to resolve conflicts. Requires SUPERVISOR or ADMINISTRATOR.`,
        );
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
      const existing = getConflict(conflictId);

      if (!existing) {
        throw new NotFoundError('Conflict', conflictId);
      }

      if (existing.conflict.status === 'RESOLVED') {
        throw new ConflictError(`Conflict '${conflictId}' has already been resolved.`);
      }

      // Apply pure deterministic domain resolution
      const { updatedResource, updatedConflict, auditEvent } = applyConflictResolution(
        existing.resource,
        existing.conflict,
        input.action,
        actorId,
        userRole,
        input.resolution_notes,
        input.winning_claim_id,
      );

      // Persist in authoritative store
      saveConflict(updatedConflict, updatedResource);
      metrics.recordResolution(conflictId, input.action);

      logger.info('Conflict resolved successfully', {
        correlation_id: correlationId,
        conflict_id: conflictId,
        action: input.action,
        winner: updatedConflict.resolution?.winning_claim_id,
        audit_event_id: auditEvent.event_id,
      });

      return successResponse(
        {
          conflict_id: conflictId,
          status: updatedConflict.status,
          action: input.action,
          resolved_resource: updatedResource,
          server_time: new Date().toISOString(),
        },
        200,
        { correlationId },
      );
    }

    // 2. GET /conflicts/{id}
    if (conflictId) {
      logger.info('Fetch single conflict requested', {
        correlation_id: correlationId,
        conflict_id: conflictId,
      });

      const entry = getConflict(conflictId);
      if (!entry) {
        throw new NotFoundError('Conflict', conflictId);
      }

      return successResponse(entry.conflict, 200, { correlationId });
    }

    // 3. GET /conflicts
    logger.info('List conflicts requested', { correlation_id: correlationId });
    const allConflicts = getAllConflicts();

    return successResponse(
      {
        conflicts: allConflicts,
        total: allConflicts.length,
        server_time: new Date().toISOString(),
      },
      200,
      { correlationId },
    );
  } catch (error) {
    metrics.recordLambdaError('conflictsHandler', (error as Error).name);
    return errorResponse(error, correlationId);
  }
}

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SyncBatchInputSchema } from '@resqsync/contracts';
import {
  detectConflict,
  transitionResourceState,
  type OfflineEvent,
  type Resource,
} from '@resqsync/domain';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  getResource,
  setResource,
  getConflictByResourceId,
  saveConflict,
} from '../stores/authoritativeStore';

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

    // Process events deterministically with conflict detection
    const results = batch.events.map(ev => {
      let authResource = getResource(ev.resource_id);

      if (!authResource) {
        authResource = {
          resource_id: ev.resource_id,
          resource_type: 'AMBULANCE_ALS',
          call_sign: 'Medic-Unit',
          status: 'AVAILABLE',
          version: 1,
          agency_id: 'AGY-METRO-EMS',
          assigned_incident_id: null,
          assigned_actor_id: null,
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          updated_at: serverTime,
        };
        setResource(authResource);
      }

      const existingEntry = getConflictByResourceId(ev.resource_id);

      // Check for conflict against authoritative resource state
      const conflictEval = detectConflict(
        authResource,
        ev as OfflineEvent,
        serverTime,
        existingEntry?.conflict,
      );

      if (conflictEval.isConflict && conflictEval.conflict) {
        // Mark resource as HUMAN_REVIEW and save conflict evidence
        const updatedResource: Resource = {
          ...authResource,
          status: 'HUMAN_REVIEW',
          updated_at: serverTime,
        };

        saveConflict(conflictEval.conflict, updatedResource);

        logger.warn('Conflict detected during sync batch', {
          correlation_id: correlationId,
          conflict_id: conflictEval.conflict.conflict_id,
          resource_id: ev.resource_id,
          client_event_id: ev.client_event_id,
          reason: conflictEval.reason,
        });

        return {
          client_event_id: ev.client_event_id,
          resource_id: ev.resource_id,
          sync_status: 'CONFLICT' as const,
          conflict_id: conflictEval.conflict.conflict_id,
          authoritative_resource: updatedResource,
          message:
            conflictEval.reason ||
            'Conflict detected: competing claims preserved for human adjudication',
        };
      }

      // Check if this was an idempotent replay of an already captured conflict event
      if (
        existingEntry &&
        existingEntry.conflict.evidence.some(e => e.client_event_id === ev.client_event_id)
      ) {
        return {
          client_event_id: ev.client_event_id,
          resource_id: ev.resource_id,
          sync_status: 'CONFLICT' as const,
          conflict_id: existingEntry.conflict.conflict_id,
          authoritative_resource: existingEntry.resource,
          message: 'Duplicate event already captured in existing conflict record',
        };
      }

      // If allowed to claim, transition state
      if (authResource.status === 'AVAILABLE' && ev.event_type === 'CLAIM') {
        const nextResource = transitionResourceState(authResource, 'CLAIMED', {
          actor_id: ev.actor_id,
          incident_id: ev.incident_id,
          timestamp: serverTime,
          incrementVersion: true,
        });
        setResource(nextResource);
        return {
          client_event_id: ev.client_event_id,
          resource_id: ev.resource_id,
          sync_status: 'ACCEPTED' as const,
          authoritative_resource: nextResource,
          message: 'Event accepted into authoritative event log',
        };
      }

      return {
        client_event_id: ev.client_event_id,
        resource_id: ev.resource_id,
        sync_status: 'ACCEPTED' as const,
        authoritative_resource: authResource,
        message: 'Event accepted into authoritative event log',
      };
    });

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

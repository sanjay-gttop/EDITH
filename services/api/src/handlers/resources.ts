import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListResourcesQuerySchema } from '@resqsync/contracts';
import { successResponse, errorResponse } from '../utils/response';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  const resourceId = event.pathParameters?.id;

  try {
    // If specific resource ID is requested: GET /resources/{id}
    if (resourceId) {
      logger.info('Fetch single resource requested', {
        correlation_id: correlationId,
        resource_id: resourceId,
      });

      // DynamoDB lookup placeholder (authoritative DynamoDB client implemented in Milestone 3)
      // Throw 404 if not found
      if (!resourceId.startsWith('AMB-')) {
        throw new NotFoundError('Resource', resourceId);
      }

      return successResponse(
        {
          resource_id: resourceId,
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
            address: 'Station 4',
          },
          updated_at: new Date().toISOString(),
        },
        200,
        { correlationId },
      );
    }

    // List resources: GET /resources
    const parseResult = ListResourcesQuerySchema.safeParse(event.queryStringParameters || {});
    if (!parseResult.success) {
      throw new ValidationError('Invalid resource query parameters', {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    logger.info('List resources query parsed', {
      correlation_id: correlationId,
      query: parseResult.data,
    });

    return successResponse(
      {
        resources: [],
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

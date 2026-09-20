import { describe, it, expect } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { healthHandler, claimsHandler, syncHandler, requestsHandler } from '@resqsync/api';

function createMockEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: null,
    headers: { 'x-correlation-id': 'test-corr-123' },
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    ...overrides,
  };
}

describe('Lambda API Handlers', () => {
  it('healthHandler returns status 200 with HEALTHY status', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/health' });
    const result = await healthHandler(event);
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.status).toBe('HEALTHY');
    expect(body.service).toBe('resqsync-api');
  });

  it('claimsHandler validates body and returns structured 400 when body is missing', async () => {
    const event = createMockEvent({ httpMethod: 'POST', path: '/claims', body: null });
    const result = await claimsHandler(event);
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('claimsHandler returns 200 with claimed state on valid input', async () => {
    const validClaim = {
      resource_id: 'AMB-A12',
      incident_id: 'INC-402',
      actor_id: 'USR-RESP-04',
      device_id: 'DEV-TAB-01',
      client_event_id: 'evt-client-9921',
      observed_version: 1,
      channel: 'WEB',
      created_at_client: '2026-09-20T10:00:00.000Z',
    };
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/claims',
      body: JSON.stringify(validClaim),
    });
    const result = await claimsHandler(event);
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.resource_id).toBe('AMB-A12');
    expect(body.status).toBe('CLAIMED');
    expect(body.version).toBe(2);
  });

  it('syncHandler processes batch and returns accepted status', async () => {
    const validBatch = {
      device_id: 'DEV-TAB-01',
      client_timestamp: '2026-09-20T10:05:00.000Z',
      events: [
        {
          client_event_id: 'evt-01',
          resource_id: 'AMB-A12',
          incident_id: 'INC-402',
          actor_id: 'USR-RESP-01',
          device_id: 'DEV-TAB-01',
          event_type: 'CLAIM',
          created_at_client: '2026-09-20T10:00:00.000Z',
          observed_version: 1,
          channel: 'WEB',
          payload: {},
          sync_status: 'PENDING_SYNC',
        },
      ],
    };
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/sync',
      body: JSON.stringify(validBatch),
    });
    const result = await syncHandler(event);
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.processed_count).toBe(1);
    expect(body.results[0].sync_status).toBe('ACCEPTED');
  });

  it('requestsHandler accepts emergency intake with 201 Created', async () => {
    const validRequest = {
      incident_id: 'INC-991',
      severity: 'CRITICAL',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      reporting_channel: 'WEB',
      notes: 'Multiple casualties reported',
    };
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/requests',
      body: JSON.stringify(validRequest),
    });
    const result = await requestsHandler(event);
    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body.status).toBe('PENDING');
    expect(body.request_id).toBeDefined();
  });
});

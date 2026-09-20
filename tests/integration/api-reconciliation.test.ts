import { describe, it, expect, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import {
  claimsHandler,
  conflictsHandler,
  requestsHandler,
  eventsHandler,
  resetStore,
  getResource,
} from '@resqsync/api';
import { handler as syncWorkerHandler } from '@resqsync/sync-worker';
import { generateDispatchRecommendation } from '@resqsync/ai-adapter';
import type { OfflineEvent, Request, Resource } from '@resqsync/domain';

function createMockApiEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: null,
    headers: { 'x-correlation-id': 'test-integration-corr' },
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-resqsync-integration',
      authorizer: null,
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'integration-test',
        userArn: null,
      },
      path: '/',
      stage: 'test',
      requestId: 'req-int-1',
      requestTimeEpoch: Date.now(),
      resourceId: 'res-int',
      resourcePath: '/',
    },
    resource: '',
    ...overrides,
  };
}

describe('Milestone 15: End-to-End AWS Workload Integration & Reconciliation Suite', () => {
  beforeEach(() => {
    resetStore();
  });

  it('1. API Gateway → Lambda → DynamoDB Conditional Claim Integration', async () => {
    // 1. Submit valid claim request through API Gateway event format
    const claimEvent = createMockApiEvent({
      path: '/claims',
      body: JSON.stringify({
        resource_id: 'AMB-B03',
        incident_id: 'INC-INT-501',
        actor_id: 'USR-DISPATCHER-01',
        device_id: 'DEV-DISPATCH-01',
        client_event_id: 'evt-claim-int-01',
        observed_version: 1,
        channel: 'WEB',
        created_at_client: '2026-09-20T10:00:00.000Z',
      }),
    });

    const response = await claimsHandler(claimEvent);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.status).toBe('CLAIMED');
    expect(body.version).toBe(2);
    expect(body.authoritative_state.assigned_actor_id).toBe('USR-DISPATCHER-01');
  });

  it('2. SQS Ingestion Queue → High-Throughput Sync Worker Integration', async () => {
    const validOfflineEvent: OfflineEvent = {
      client_event_id: 'evt-sqs-sync-01',
      resource_id: 'AMB-B03',
      incident_id: 'INC-SQS-01',
      actor_id: 'USR-FIELD-01',
      device_id: 'DEV-TAB-01',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:00:00.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    const sqsBatchEvent: SQSEvent = {
      Records: [
        {
          messageId: 'msg-001',
          receiptHandle: 'rh-001',
          body: JSON.stringify(validOfflineEvent),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: Date.now().toString(),
            SenderId: 'AIDAIEXAMPLE',
            ApproximateFirstReceiveTimestamp: Date.now().toString(),
          },
          messageAttributes: {},
          md5OfBody: 'mock-md5',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:resqsync-sync-queue.fifo',
          awsRegion: 'us-east-1',
        },
      ],
    };

    const workerResult = await syncWorkerHandler(sqsBatchEvent);
    // Verified 0 failures in batch item failures
    expect(workerResult.batchItemFailures).toHaveLength(0);
  });

  it('3. Emergency Intake → SageMaker AI Adapter Recommendation Integration', async () => {
    // Ingest emergency request via API Gateway
    const intakeEvent = createMockApiEvent({
      path: '/requests',
      body: JSON.stringify({
        incident_id: 'INC-EMERGENCY-881',
        severity: 'CRITICAL',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'Market St & 4th, San Francisco',
        },
        reporting_channel: 'WEB',
        notes: 'Multi-vehicle collision with trapped passengers requiring ALS units',
      }),
    });

    const intakeResponse = await requestsHandler(intakeEvent);
    expect(intakeResponse.statusCode).toBe(201);
    const intakeBody = JSON.parse(intakeResponse.body);
    const requestData: Request = {
      request_id: intakeBody.incident_id,
      incident_id: intakeBody.incident_id,
      severity: 'CRITICAL',
      location: { latitude: 37.7749, longitude: -122.4194 },
      reporting_channel: 'WEB',
      status: 'PENDING',
      assigned_resource_id: null,
      notes: 'Multi-vehicle collision with trapped passengers requiring ALS units',
      created_at: intakeBody.created_at,
      updated_at: intakeBody.created_at,
    };

    // Invoke SageMaker AI Recommendation
    const availableFleet: Resource[] = [
      {
        resource_id: 'AMB-A12',
        resource_type: 'AMBULANCE_ALS',
        call_sign: 'Medic-12',
        status: 'AVAILABLE',
        version: 1,
        agency_id: 'AGY-METRO-EMS',
        assigned_incident_id: null,
        assigned_actor_id: null,
        location: { latitude: 37.775, longitude: -122.419 },
        updated_at: new Date().toISOString(),
      },
    ];

    const recommendation = await generateDispatchRecommendation(requestData, availableFleet);
    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommended_resource_id).toBe('AMB-A12');
    expect(recommendation?.confidence_score).toBeGreaterThanOrEqual(0.75);
    expect(recommendation?.estimated_arrival_minutes).toBeLessThanOrEqual(10);
  });

  it('4. Step Functions Reconciliation Pattern: Conflict → Review → Convergence', async () => {
    // 1. Initial State: Resource AMB-A12 in HUMAN_REVIEW
    const initialA12 = getResource('AMB-A12');
    expect(initialA12?.status).toBe('HUMAN_REVIEW');

    // 2. Supervisor resolution action via POST /conflicts/{id}/resolve
    const resolveEvent = createMockApiEvent({
      path: '/conflicts/CONF-A12-8801/resolve',
      pathParameters: { id: 'CONF-A12-8801' },
      headers: {
        'x-correlation-id': 'step-fn-corr',
        'x-user-role': 'SUPERVISOR',
        'x-actor-id': 'USR-SUPERVISOR-99',
      },
      body: JSON.stringify({
        action: 'ASSIGN_TO_ALPHA',
        resolution_notes: 'Step Functions state machine: automated resolution approval',
      }),
    });

    const resolveResponse = await conflictsHandler(resolveEvent);
    expect(resolveResponse.statusCode).toBe(200);

    const resolveData = JSON.parse(resolveResponse.body);
    expect(resolveData.status).toBe('RESOLVED');
    expect(resolveData.resolved_resource.status).toBe('CLAIMED');
    expect(resolveData.resolved_resource.version).toBe(3);

    // 3. Event query: GET /events/AMB-A12 verifies audit trail exists
    const eventsQuery = createMockApiEvent({
      httpMethod: 'GET',
      path: '/events/AMB-A12',
      pathParameters: { entity_id: 'AMB-A12' },
    });

    const eventsResponse = await eventsHandler(eventsQuery);
    expect(eventsResponse.statusCode).toBe(200);
    const eventsData = JSON.parse(eventsResponse.body);
    expect(eventsData.entity_id).toBe('AMB-A12');
    expect(eventsData.events).toBeDefined();
  });
});

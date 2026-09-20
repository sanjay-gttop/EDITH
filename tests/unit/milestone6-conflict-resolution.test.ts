import { describe, it, expect, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import {
  detectConflict,
  applyConflictResolution,
  createConflict,
  type Resource,
  type OfflineEvent,
  type ConflictEvidence,
} from '@resqsync/domain';
import {
  syncHandler,
  conflictsHandler,
  resetStore,
  clearStore,
  setResource,
  getResource,
} from '@resqsync/api';

function createMockEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {
      'x-correlation-id': 'test-m6-corr',
    },
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/conflicts',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api',
      authorizer: null,
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
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
        userAgent: 'vitest',
        userArn: null,
      },
      path: '/conflicts',
      stage: 'test',
      requestId: 'req-test-m6',
      requestTimeEpoch: Date.now(),
      resourceId: 'res-test',
      resourcePath: '/conflicts',
    },
    resource: '',
    ...overrides,
  };
}

describe('Milestone 6: ResQSync Conflict Detection & Resolution Workflow', () => {
  beforeEach(() => {
    resetStore();
  });

  it('Test 1: Signature Scenario - AMB-A12 offline Alpha vs online Bravo competition, detection, preservation, supervisor resolution & client convergence', async () => {
    clearStore();
    // 1. Authoritative initial state: AMB-A12 was available at v1
    const initialResource: Resource = {
      resource_id: 'AMB-A12',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-12',
      status: 'AVAILABLE',
      version: 1,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: null,
      assigned_actor_id: null,
      location: { latitude: 37.7749, longitude: -122.4194 },
      updated_at: '2026-09-20T10:00:00.000Z',
    };
    setResource(initialResource);

    // 2. Alpha goes offline and creates a local claim observed at version 1
    const alphaOfflineEvent: OfflineEvent = {
      client_event_id: 'evt-alpha-9901',
      resource_id: 'AMB-A12',
      incident_id: 'INC-ALPHA-401',
      actor_id: 'USR-ALPHA',
      device_id: 'DEV-TAB-ALPHA',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:02:00.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: { note: 'Offline triage at sector 4' },
      sync_status: 'PENDING_SYNC',
    };

    // 3. Bravo remains online and claims AMB-A12; authoritative state updates to v2
    const bravoClaimedResource: Resource = {
      ...initialResource,
      status: 'CLAIMED',
      version: 2,
      assigned_incident_id: 'INC-BRAVO-402',
      assigned_actor_id: 'USR-BRAVO',
      updated_at: '2026-09-20T10:03:00.000Z',
    };
    setResource(bravoClaimedResource);

    // 4. Alpha reconnects and sends sync batch to API handler
    const syncEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/sync',
      body: JSON.stringify({
        device_id: 'DEV-TAB-ALPHA',
        client_timestamp: '2026-09-20T10:06:00.000Z',
        events: [alphaOfflineEvent],
      }),
    });

    const syncResult = await syncHandler(syncEvent);
    expect(syncResult.statusCode).toBe(200);

    const syncBody = JSON.parse(syncResult.body);
    expect(syncBody.processed_count).toBe(1);
    expect(syncBody.results[0].sync_status).toBe('CONFLICT');
    const conflictId = syncBody.results[0].conflict_id;
    expect(conflictId).toBeDefined();

    // Authoritative resource is now flagged for human review
    const currentResource = getResource('AMB-A12');
    expect(currentResource?.status).toBe('HUMAN_REVIEW');

    // 5. Verify human supervisor reviews the conflict via GET /conflicts/{id}
    const getConflictEvent = createMockEvent({
      httpMethod: 'GET',
      path: `/conflicts/${conflictId}`,
      pathParameters: { id: conflictId },
    });
    const getConflictResult = await conflictsHandler(getConflictEvent);
    expect(getConflictResult.statusCode).toBe(200);

    const retrievedConflict = JSON.parse(getConflictResult.body);
    expect(retrievedConflict.conflict_id).toBe(conflictId);
    expect(retrievedConflict.status).toBe('DETECTED');
    // Both claims must remain completely preserved!
    expect(retrievedConflict.evidence).toHaveLength(2);
    expect(retrievedConflict.evidence.some((e: ConflictEvidence) => e.actor_id === 'USR-ALPHA')).toBe(true);
    expect(retrievedConflict.evidence.some((e: ConflictEvidence) => e.actor_id === 'USR-BRAVO')).toBe(true);

    // 6. Human supervisor resolves in favor of Alpha: POST /conflicts/{id}/resolve
    const resolveEvent = createMockEvent({
      httpMethod: 'POST',
      path: `/conflicts/${conflictId}/resolve`,
      pathParameters: { id: conflictId },
      headers: {
        'x-correlation-id': 'test-resolve-corr',
        'x-user-role': 'SUPERVISOR',
        'x-actor-id': 'USR-SUPERVISOR-42',
      },
      body: JSON.stringify({
        action: 'ASSIGN_TO_ALPHA',
        resolution_notes: 'Alpha triage has 3 critical code-red patients. Bravo rerouted to unit AMB-C08.',
      }),
    });

    const resolveResult = await conflictsHandler(resolveEvent);
    expect(resolveResult.statusCode).toBe(200);

    const resolveBody = JSON.parse(resolveResult.body);
    expect(resolveBody.status).toBe('RESOLVED');
    expect(resolveBody.action).toBe('ASSIGN_TO_ALPHA');
    expect(resolveBody.resolved_resource.status).toBe('CLAIMED');
    expect(resolveBody.resolved_resource.assigned_actor_id).toBe('USR-ALPHA');
    expect(resolveBody.resolved_resource.assigned_incident_id).toBe('INC-ALPHA-401');
    expect(resolveBody.resolved_resource.version).toBe(3);

    // 7. Authoritative state reflects resolution
    const authoritativeFinal = getResource('AMB-A12');
    expect(authoritativeFinal?.status).toBe('CLAIMED');
    expect(authoritativeFinal?.assigned_actor_id).toBe('USR-ALPHA');
    expect(authoritativeFinal?.version).toBe(3);

    // 8. Clients converge: Both claims remain intact in conflict record after resolution
    const checkConflictAgain = await conflictsHandler(getConflictEvent);
    const resolvedAudit = JSON.parse(checkConflictAgain.body);
    expect(resolvedAudit.status).toBe('RESOLVED');
    expect(resolvedAudit.evidence).toHaveLength(2);
    expect(resolvedAudit.resolution.resolved_by).toBe('USR-SUPERVISOR-42');
  });

  it('Test 2: Two offline claims competing for the same resource', () => {
    const resource: Resource = {
      resource_id: 'AMB-B05',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-05',
      status: 'AVAILABLE',
      version: 1,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: null,
      assigned_actor_id: null,
      location: { latitude: 37.77, longitude: -122.41 },
      updated_at: '2026-09-20T10:00:00.000Z',
    };

    const deltaClaim: OfflineEvent = {
      client_event_id: 'evt-delta-1',
      resource_id: 'AMB-B05',
      incident_id: 'INC-DELTA',
      actor_id: 'USR-DELTA',
      device_id: 'DEV-DELTA',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:01:00.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    // Delta syncs first: no conflict
    const deltaEval = detectConflict(resource, deltaClaim);
    expect(deltaEval.isConflict).toBe(false);

    // Server updates resource state for Delta
    const resourceAfterDelta: Resource = {
      ...resource,
      status: 'CLAIMED',
      version: 2,
      assigned_actor_id: 'USR-DELTA',
      assigned_incident_id: 'INC-DELTA',
      updated_at: '2026-09-20T10:02:00.000Z',
    };

    // Echo syncs second with observed_version: 1
    const echoClaim: OfflineEvent = {
      client_event_id: 'evt-echo-2',
      resource_id: 'AMB-B05',
      incident_id: 'INC-ECHO',
      actor_id: 'USR-ECHO',
      device_id: 'DEV-ECHO',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:00:30.000Z', // Client clock earlier, but synced second
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    const echoEval = detectConflict(resourceAfterDelta, echoClaim);
    expect(echoEval.isConflict).toBe(true);
    expect(echoEval.conflict).toBeDefined();
    expect(echoEval.conflict?.evidence).toHaveLength(2);
    expect(echoEval.conflict?.evidence[0].actor_id).toBe('USR-DELTA');
    expect(echoEval.conflict?.evidence[1].actor_id).toBe('USR-ECHO');
  });

  it('Test 3: Three concurrent competing claims preserved without loss', () => {
    const resource: Resource = {
      resource_id: 'AMB-C01',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-01',
      status: 'AVAILABLE',
      version: 1,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: null,
      assigned_actor_id: null,
      location: { latitude: 37.77, longitude: -122.41 },
      updated_at: '2026-09-20T10:00:00.000Z',
    };

    // Claim 1 wins online race
    const resV2: Resource = {
      ...resource,
      status: 'CLAIMED',
      version: 2,
      assigned_actor_id: 'USR-1',
      assigned_incident_id: 'INC-1',
      updated_at: '2026-09-20T10:01:00.000Z',
    };

    // Claim 2 arrives from offline client
    const claim2: OfflineEvent = {
      client_event_id: 'evt-2',
      resource_id: 'AMB-C01',
      incident_id: 'INC-2',
      actor_id: 'USR-2',
      device_id: 'DEV-2',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:01:30.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    const eval2 = detectConflict(resV2, claim2);
    expect(eval2.isConflict).toBe(true);
    const conflict2 = eval2.conflict!;
    expect(conflict2.evidence).toHaveLength(2);

    // Claim 3 arrives from another offline client
    const claim3: OfflineEvent = {
      client_event_id: 'evt-3',
      resource_id: 'AMB-C01',
      incident_id: 'INC-3',
      actor_id: 'USR-3',
      device_id: 'DEV-3',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:02:00.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    const eval3 = detectConflict(resV2, claim3, '2026-09-20T10:05:00.000Z', conflict2);
    expect(eval3.isConflict).toBe(true);
    expect(eval3.conflict?.evidence).toHaveLength(3);
    const actors = eval3.conflict?.evidence.map(e => e.actor_id);
    expect(actors).toContain('USR-1');
    expect(actors).toContain('USR-2');
    expect(actors).toContain('USR-3');
  });

  it('Test 4: Duplicate sync idempotency produces identical conflict record without duplicate evidence', () => {
    const resource: Resource = {
      resource_id: 'AMB-D04',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-04',
      status: 'CLAIMED',
      version: 2,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: 'INC-ONLINE',
      assigned_actor_id: 'USR-ONLINE',
      location: { latitude: 37.77, longitude: -122.41 },
      updated_at: '2026-09-20T10:00:00.000Z',
    };

    const offlineEvent: OfflineEvent = {
      client_event_id: 'evt-repeat-999',
      resource_id: 'AMB-D04',
      incident_id: 'INC-REPEAT',
      actor_id: 'USR-REPEAT',
      device_id: 'DEV-REPEAT',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:00:30.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    // First detection
    const firstEval = detectConflict(resource, offlineEvent);
    expect(firstEval.isConflict).toBe(true);
    const conflict = firstEval.conflict!;
    expect(conflict.evidence).toHaveLength(2);

    // Second (duplicate) detection with same client_event_id
    const duplicateEval = detectConflict(resource, offlineEvent, undefined, conflict);
    expect(duplicateEval.isConflict).toBe(false);
    expect(duplicateEval.conflict?.evidence).toHaveLength(2);
  });

  it('Test 5: Resolution requesting information updates conflict status to UNDER_REVIEW and preserves claims', () => {
    const resource: Resource = {
      resource_id: 'AMB-A12',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-12',
      status: 'HUMAN_REVIEW',
      version: 2,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: 'INC-BRAVO-402',
      assigned_actor_id: 'USR-BRAVO',
      location: { latitude: 37.7749, longitude: -122.4194 },
      updated_at: '2026-09-20T10:06:00.000Z',
    };

    const conflict = createConflict('AMB-A12', [
      {
        claim_id: 'claim-1',
        actor_id: 'USR-ALPHA',
        device_id: 'DEV-1',
        client_event_id: 'evt-1',
        created_at_client: '2026-09-20T10:00:00.000Z',
        received_at_server: '2026-09-20T10:05:00.000Z',
        channel: 'WEB',
        observed_version: 1,
        payload: {},
      },
      {
        claim_id: 'claim-2',
        actor_id: 'USR-BRAVO',
        device_id: 'DEV-2',
        client_event_id: 'evt-2',
        created_at_client: '2026-09-20T10:01:00.000Z',
        received_at_server: '2026-09-20T10:01:00.000Z',
        channel: 'WEB',
        observed_version: 1,
        payload: {},
      },
    ]);

    const result = applyConflictResolution(
      resource,
      conflict,
      'REQUEST_INFORMATION',
      'USR-SUPERVISOR',
      'SUPERVISOR',
      'Need triage acuity confirmation from field commander.',
    );

    expect(result.updatedConflict.status).toBe('UNDER_REVIEW');
    expect(result.updatedResource.status).toBe('HUMAN_REVIEW');
    expect(result.updatedConflict.evidence).toHaveLength(2);
  });

  it('Test 6: Unauthorized resolution rejected - RESPONDER and DISPATCHER roles receive 403 Forbidden', async () => {
    const rolesToTest = ['RESPONDER', 'DISPATCHER', 'VIEWER'];

    for (const role of rolesToTest) {
      const unauthorizedEvent = createMockEvent({
        httpMethod: 'POST',
        path: '/conflicts/CONF-A12-8801/resolve',
        pathParameters: { id: 'CONF-A12-8801' },
        headers: {
          'x-user-role': role,
          'x-actor-id': `USR-${role}`,
        },
        body: JSON.stringify({
          action: 'ASSIGN_TO_ALPHA',
          resolution_notes: 'Attempted resolution by unauthorized role',
        }),
      });

      const response = await conflictsHandler(unauthorizedEvent);
      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('FORBIDDEN');
    }
  });

  it('Test 7: Already resolved conflict rejected with 409 Conflict', async () => {
    // 1. Initial resolution succeeds
    const resolveEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/conflicts/CONF-A12-8801/resolve',
      pathParameters: { id: 'CONF-A12-8801' },
      headers: {
        'x-user-role': 'SUPERVISOR',
        'x-actor-id': 'USR-SUPERVISOR',
      },
      body: JSON.stringify({
        action: 'ASSIGN_TO_BRAVO',
        resolution_notes: 'First supervisor decision is authoritative',
      }),
    });

    const firstResult = await conflictsHandler(resolveEvent);
    expect(firstResult.statusCode).toBe(200);

    // 2. Second resolution attempt on the same conflict ID must return 409 Conflict
    const secondResult = await conflictsHandler(resolveEvent);
    expect(secondResult.statusCode).toBe(409);
    const body = JSON.parse(secondResult.body);
    expect(body.error.code).toBe('STATE_CONFLICT');
  });

  it('Test 8: Client convergence verification - Authoritative version increments and all clients see updated allocation', async () => {
    // Initial fetch of resource
    const initialFetch = getResource('AMB-A12');
    const initialVersion = initialFetch!.version;

    // Supervisor resolves conflict
    const resolveEvent = createMockEvent({
      httpMethod: 'POST',
      path: '/conflicts/CONF-A12-8801/resolve',
      pathParameters: { id: 'CONF-A12-8801' },
      headers: {
        'x-user-role': 'ADMINISTRATOR',
        'x-actor-id': 'USR-ADMIN',
      },
      body: JSON.stringify({
        action: 'ASSIGN_TO_ALPHA',
        resolution_notes: 'Administrator confirms Alpha allocation',
      }),
    });

    const response = await conflictsHandler(resolveEvent);
    expect(response.statusCode).toBe(200);

    // Post-resolution check: version strictly incremented, status is CLAIMED
    const updated = getResource('AMB-A12');
    expect(updated?.version).toBe(initialVersion + 1);
    expect(updated?.status).toBe('CLAIMED');
    expect(updated?.assigned_actor_id).toBe('USR-ALPHA');
  });
});

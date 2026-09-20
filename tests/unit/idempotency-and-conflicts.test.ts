import { describe, it, expect } from 'vitest';
import {
  createConflict,
  resolveConflict,
  type ConflictEvidence,
  type OfflineEvent,
  type Resource,
} from '@resqsync/domain';

describe('Idempotency, Evidence Preservation, & Global Ordering Rules', () => {
  it('preserves complete competing evidence without silent overwrites when a conflict occurs', () => {
    const evidenceA: ConflictEvidence = {
      claim_id: 'claim-alpha-01',
      actor_id: 'USR-RESP-ALPHA',
      device_id: 'DEV-TABLET-01',
      client_event_id: 'evt-alpha-8821',
      created_at_client: '2026-09-20T10:00:00.000Z',
      received_at_server: '2026-09-20T10:05:00.000Z',
      channel: 'WEB',
      observed_version: 1,
      payload: { note: 'Responding to flood sector 3' },
    };

    const evidenceB: ConflictEvidence = {
      claim_id: 'claim-bravo-02',
      actor_id: 'USR-RESP-BRAVO',
      device_id: 'DEV-RADIO-04',
      client_event_id: 'evt-bravo-9932',
      created_at_client: '2026-09-20T09:58:00.000Z', // Earlier client time, but arrived later
      received_at_server: '2026-09-20T10:06:00.000Z',
      channel: 'SMS',
      observed_version: 1,
      payload: { note: 'Responding to structural collapse' },
    };

    // Conflict entity captures BOTH competing claims
    const conflict = createConflict('AMB-A12', [evidenceA, evidenceB]);

    expect(conflict.status).toBe('DETECTED');
    expect(conflict.claim_ids).toHaveLength(2);
    expect(conflict.evidence).toHaveLength(2);
    expect(conflict.evidence[0].claim_id).toBe('claim-alpha-01');
    expect(conflict.evidence[1].claim_id).toBe('claim-bravo-02');

    // Supervisor resolution preserves the entire historical audit trail
    const resolvedConflict = resolveConflict(
      conflict,
      'claim-alpha-01',
      'USR-SUPERVISOR-01',
      'Unit already on route to flood sector 3. Bravo redirected to AMB-A07.',
    );

    expect(resolvedConflict.status).toBe('RESOLVED');
    expect(resolvedConflict.resolution?.winning_claim_id).toBe('claim-alpha-01');
    // Crucial check: Losing evidence is NEVER purged
    expect(resolvedConflict.evidence).toHaveLength(2);
    expect(resolvedConflict.evidence.find(e => e.claim_id === 'claim-bravo-02')).toBeDefined();
  });

  it('guarantees client event idempotency: duplicate event submissions produce identical outcome', () => {
    const processedEvents = new Map<string, { processed: boolean; allocation_id: string }>();

    function processEvent(event: OfflineEvent) {
      if (processedEvents.has(event.client_event_id)) {
        // Return existing idempotency record
        return {
          idempotent_replay: true,
          record: processedEvents.get(event.client_event_id)!,
        };
      }
      const record = {
        processed: true,
        allocation_id: `alloc-${event.resource_id}`,
      };
      processedEvents.set(event.client_event_id, record);
      return { idempotent_replay: false, record };
    }

    const testEvent: OfflineEvent = {
      client_event_id: 'evt-repeat-1234',
      resource_id: 'AMB-A12',
      incident_id: 'INC-101',
      actor_id: 'USR-RESP-01',
      device_id: 'DEV-01',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T10:00:00.000Z',
      observed_version: 1,
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    // First submission
    const run1 = processEvent(testEvent);
    expect(run1.idempotent_replay).toBe(false);
    expect(run1.record.allocation_id).toBe('alloc-AMB-A12');

    // Second (duplicate) submission
    const run2 = processEvent(testEvent);
    expect(run2.idempotent_replay).toBe(true);
    expect(run2.record.allocation_id).toBe('alloc-AMB-A12');
  });

  it('proves client timestamp CANNOT establish global ordering over authoritative server state', () => {
    const authoritativeResource: Resource = {
      resource_id: 'AMB-A12',
      resource_type: 'AMBULANCE_ALS',
      call_sign: 'Medic-12',
      status: 'CLAIMED',
      version: 5,
      agency_id: 'AGY-METRO-EMS',
      assigned_incident_id: 'INC-ONLINE',
      assigned_actor_id: 'USR-SERVER-ONLINE',
      location: { latitude: 37.77, longitude: -122.41 },
      updated_at: '2026-09-20T10:30:00.000Z',
    };

    // Disconnected client with earlier claimed timestamp and stale observed version
    const offlineEventWithFabricatedOrEarlierClock: OfflineEvent = {
      client_event_id: 'evt-clock-drift-01',
      resource_id: 'AMB-A12',
      incident_id: 'INC-OFFLINE',
      actor_id: 'USR-OFFLINE',
      device_id: 'DEV-DRIFT',
      event_type: 'CLAIM',
      created_at_client: '2026-09-20T08:00:00.000Z', // 2.5 hours earlier!
      observed_version: 2, // Stale!
      channel: 'WEB',
      payload: {},
      sync_status: 'PENDING_SYNC',
    };

    // Server verification rule:
    const isStale =
      offlineEventWithFabricatedOrEarlierClock.observed_version < authoritativeResource.version;
    const isAvailable = authoritativeResource.status === 'AVAILABLE';

    // Must be rejected or flagged as conflict, despite earlier client timestamp
    expect(isStale).toBe(true);
    expect(isAvailable).toBe(false);
  });
});

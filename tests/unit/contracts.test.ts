import { describe, it, expect } from 'vitest';
import {
  ClaimResourceInputSchema,
  SyncBatchInputSchema,
  CreateRequestInputSchema,
  ResolveConflictInputSchema,
  StandardErrorResponseSchema,
} from '@resqsync/contracts';

describe('Contracts & Schema Validation', () => {
  it('validates a correct ClaimResourceInput payload', () => {
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

    const parsed = ClaimResourceInputSchema.safeParse(validClaim);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid ClaimResourceInput missing required fields', () => {
    const invalidClaim = {
      resource_id: 'AMB-A12',
      // missing incident_id, actor_id, device_id, etc.
    };

    const parsed = ClaimResourceInputSchema.safeParse(invalidClaim);
    expect(parsed.success).toBe(false);
  });

  it('validates a correct SyncBatchInput payload with multiple offline events', () => {
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
          payload: { note: 'Rapid dispatch' },
          sync_status: 'PENDING_SYNC',
        },
      ],
    };

    const parsed = SyncBatchInputSchema.safeParse(validBatch);
    expect(parsed.success).toBe(true);
  });

  it('validates emergency request intake payload', () => {
    const validRequest = {
      incident_id: 'INC-900',
      severity: 'CRITICAL',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'Market St & 4th',
      },
      reporting_channel: 'WEB',
      notes: 'Mass casualty triage area established',
    };

    const parsed = CreateRequestInputSchema.safeParse(validRequest);
    expect(parsed.success).toBe(true);
  });

  it('validates conflict resolution payload', () => {
    const validResolution = {
      winning_claim_id: 'claim-101',
      resolution_notes: 'Claimant was physically first at scene.',
      target_state: 'CLAIMED',
    };

    const parsed = ResolveConflictInputSchema.safeParse(validResolution);
    expect(parsed.success).toBe(true);
  });

  it('validates structured error contract', () => {
    const errorPayload = {
      error: {
        code: 'STALE_VERSION_REJECTED',
        message: 'Resource version conflict',
        correlation_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        timestamp: '2026-09-20T10:00:00.000Z',
        details: { resource_id: 'AMB-A12' },
      },
    };

    const parsed = StandardErrorResponseSchema.safeParse(errorPayload);
    expect(parsed.success).toBe(true);
  });
});

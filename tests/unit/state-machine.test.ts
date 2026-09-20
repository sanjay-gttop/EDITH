import { describe, it, expect } from 'vitest';
import {
  canClaim,
  canDispatch,
  canRelease,
  canResolveConflict,
  transitionResourceState,
  isTransitionAllowed,
  createClaimEvent,
  type Resource,
  type Conflict,
} from '@resqsync/domain';

const mockResource: Resource = {
  resource_id: 'AMB-A12',
  resource_type: 'AMBULANCE_ALS',
  call_sign: 'Medic-12',
  status: 'AVAILABLE',
  version: 1,
  agency_id: 'AGY-METRO-EMS',
  assigned_incident_id: null,
  assigned_actor_id: null,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  updated_at: '2026-09-20T10:00:00.000Z',
};

describe('ResQSync Authoritative State Machine', () => {
  it('allows claiming an AVAILABLE resource (AVAILABLE -> CLAIMED)', () => {
    const claimCheck = canClaim(mockResource);
    expect(claimCheck.allowed).toBe(true);

    const claimed = transitionResourceState(mockResource, 'CLAIMED', {
      actor_id: 'USR-RESP-01',
      incident_id: 'INC-100',
    });

    expect(claimed.status).toBe('CLAIMED');
    expect(claimed.version).toBe(2);
    expect(claimed.assigned_actor_id).toBe('USR-RESP-01');
    expect(claimed.assigned_incident_id).toBe('INC-100');
  });

  it('allows offline transition to PENDING_SYNC without incrementing authoritative version', () => {
    const claimCheck = canClaim(mockResource);
    expect(claimCheck.allowed).toBe(true);

    const pendingSync = transitionResourceState(mockResource, 'PENDING_SYNC', {
      actor_id: 'USR-OFFLINE-02',
      incident_id: 'INC-200',
    });

    expect(pendingSync.status).toBe('PENDING_SYNC');
    // Offline optimistic state does not bump global authoritative version
    expect(pendingSync.version).toBe(1);
    expect(pendingSync.assigned_actor_id).toBe('USR-OFFLINE-02');
  });

  it('reconciles PENDING_SYNC -> ACCEPTED / CLAIMED upon server confirmation', () => {
    const pendingResource: Resource = {
      ...mockResource,
      status: 'PENDING_SYNC',
      assigned_actor_id: 'USR-OFFLINE-02',
    };

    expect(isTransitionAllowed('PENDING_SYNC', 'CLAIMED')).toBe(true);
    const authoritative = transitionResourceState(pendingResource, 'CLAIMED', {
      incrementVersion: true,
    });

    expect(authoritative.status).toBe('CLAIMED');
    expect(authoritative.version).toBe(2);
  });

  it('transitions PENDING_SYNC -> CONFLICT when a competing claim is detected', () => {
    const pendingResource: Resource = {
      ...mockResource,
      status: 'PENDING_SYNC',
    };

    expect(isTransitionAllowed('PENDING_SYNC', 'CONFLICT')).toBe(true);
    const conflictState = transitionResourceState(pendingResource, 'CONFLICT');
    expect(conflictState.status).toBe('CONFLICT');
  });

  it('transitions CONFLICT -> HUMAN_REVIEW for supervisor triage', () => {
    const inConflictResource: Resource = {
      ...mockResource,
      status: 'CONFLICT',
      version: 2,
    };

    expect(isTransitionAllowed('CONFLICT', 'HUMAN_REVIEW')).toBe(true);
    const escalated = transitionResourceState(inConflictResource, 'HUMAN_REVIEW');
    expect(escalated.status).toBe('HUMAN_REVIEW');
  });

  it('transitions HUMAN_REVIEW -> RESOLVED once supervisor adjudicates', () => {
    const reviewResource: Resource = {
      ...mockResource,
      status: 'HUMAN_REVIEW',
      version: 3,
    };

    expect(isTransitionAllowed('HUMAN_REVIEW', 'RESOLVED')).toBe(true);
    const resolved = transitionResourceState(reviewResource, 'RESOLVED');
    expect(resolved.status).toBe('RESOLVED');
  });

  it('enforces RBAC: RESPONDER and DISPATCHER cannot resolve conflicts; SUPERVISOR and ADMINISTRATOR can', () => {
    const inConflictResource: Resource = {
      ...mockResource,
      status: 'HUMAN_REVIEW',
    };
    const mockConflict: Conflict = {
      conflict_id: 'CONF-01',
      resource_id: 'AMB-A12',
      claim_ids: ['claim-1', 'claim-2'],
      detected_at: new Date().toISOString(),
      status: 'UNDER_REVIEW',
      evidence: [],
    };

    expect(canResolveConflict(inConflictResource, mockConflict, 'RESPONDER').allowed).toBe(false);
    expect(canResolveConflict(inConflictResource, mockConflict, 'DISPATCHER').allowed).toBe(false);
    expect(canResolveConflict(inConflictResource, mockConflict, 'SUPERVISOR').allowed).toBe(true);
    expect(canResolveConflict(inConflictResource, mockConflict, 'ADMINISTRATOR').allowed).toBe(true);
  });

  it('rejects invalid state transitions (e.g. AVAILABLE directly to DISPATCHED or IN_USE)', () => {
    expect(() => transitionResourceState(mockResource, 'DISPATCHED')).toThrowError(
      /Illegal state transition/,
    );
    expect(() => transitionResourceState(mockResource, 'IN_USE')).toThrowError(
      /Illegal state transition/,
    );
  });

  it('allows lifecycle progression: CLAIMED -> DISPATCHED -> IN_USE -> AVAILABLE', () => {
    const claimed: Resource = { ...mockResource, status: 'CLAIMED' };
    expect(canDispatch(claimed)).toBe(true);

    const dispatched = transitionResourceState(claimed, 'DISPATCHED');
    expect(dispatched.status).toBe('DISPATCHED');

    const inUse = transitionResourceState(dispatched, 'IN_USE');
    expect(inUse.status).toBe('IN_USE');

    expect(canRelease(inUse)).toBe(true);
    const released = transitionResourceState(inUse, 'AVAILABLE', {
      actor_id: undefined,
      incident_id: undefined,
    });
    expect(released.status).toBe('AVAILABLE');
  });

  it('creates deterministic claim event with generated claim_id', () => {
    const claim = createClaimEvent({
      resource_id: 'AMB-A12',
      incident_id: 'INC-1',
      actor_id: 'USR-1',
      device_id: 'DEV-1',
      client_event_id: 'evt-1',
      observed_version: 1,
      created_at_client: '2026-09-20T10:00:00.000Z',
      channel: 'WEB',
      status: 'SUBMITTED',
    });
    expect(claim.claim_id).toBeDefined();
    expect(claim.resource_id).toBe('AMB-A12');
  });
});

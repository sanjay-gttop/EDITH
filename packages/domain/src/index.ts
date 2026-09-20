// ResQSync Domain - Authoritative Domain Models and Deterministic State Machine

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

export type ResourceStatus =
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'DISPATCHED'
  | 'IN_USE'
  | 'PENDING_SYNC'
  | 'CONFLICT'
  | 'HUMAN_REVIEW'
  | 'RESOLVED';

export type SyncStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'PENDING_SYNC'
  | 'SYNCING'
  | 'ACCEPTED'
  | 'CONFLICT'
  | 'REJECTED'
  | 'SYNCHRONIZED';

export type Channel = 'WEB' | 'SMS' | 'API';

export type UserRole =
  | 'RESPONDER'
  | 'DISPATCHER'
  | 'SUPERVISOR'
  | 'ADMINISTRATOR';

export type AmbulanceType =
  | 'AMBULANCE_BLS' // Basic Life Support
  | 'AMBULANCE_ALS' // Advanced Life Support
  | 'AMBULANCE_MICU'; // Mobile Intensive Care Unit

export type IncidentSeverity = 'CRITICAL' | 'URGENT' | 'STANDARD' | 'NON_EMERGENCY';

// ============================================================================
// 2. CORE ENTITIES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  heading?: number;
  speed_kmh?: number;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  agency_id: string;
  badge_number?: string;
  created_at: string;
}

export interface Agency {
  agency_id: string;
  name: string;
  jurisdiction: string;
  contact_phone: string;
  active_incident_count: number;
}

export interface Resource {
  resource_id: string;
  resource_type: string;
  call_sign: string;
  status: ResourceStatus;
  version: number;
  agency_id: string;
  assigned_incident_id: string | null;
  assigned_actor_id: string | null;
  location: Coordinates;
  fuel_percent?: number;
  updated_at: string;
  _is_demo_seed?: boolean;
}

export interface Ambulance extends Resource {
  resource_type: AmbulanceType;
  equipment_level: 'BASIC_LIFE_SUPPORT' | 'ADVANCED_LIFE_SUPPORT' | 'MOBILE_INTENSIVE_CARE';
  crew_size?: number;
}

export interface Claim {
  claim_id: string;
  resource_id: string;
  incident_id: string;
  actor_id: string;
  device_id: string;
  client_event_id: string;
  observed_version: number;
  created_at_client: string;
  created_at_server?: string;
  channel: Channel;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CONFLICT';
}

export interface Request {
  request_id: string;
  incident_id: string;
  severity: IncidentSeverity;
  location: Coordinates;
  reporting_channel: Channel;
  status: 'PENDING' | 'DISPATCHED' | 'FULFILLED' | 'CANCELLED';
  assigned_resource_id: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConflictEvidence {
  claim_id: string;
  actor_id: string;
  device_id: string;
  client_event_id: string;
  created_at_client: string;
  received_at_server: string;
  channel: Channel;
  observed_version: number;
  payload: Record<string, unknown>;
}

export interface Conflict {
  conflict_id: string;
  resource_id: string;
  claim_ids: string[];
  detected_at: string;
  status: 'DETECTED' | 'UNDER_REVIEW' | 'RESOLVED';
  evidence: ConflictEvidence[];
  resolution?: {
    winning_claim_id: string;
    resolved_by: string;
    resolved_at: string;
    notes: string;
    target_state: ResourceStatus;
  };
}

export interface DomainEvent {
  event_id: string;
  event_type: string;
  entity_id: string;
  actor_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
  correlation_id: string;
}

export interface DeviceSync {
  device_id: string;
  last_sync_at: string;
  pending_event_count: number;
  client_version: string;
  sync_status: SyncStatus;
}

export interface OfflineEvent {
  client_event_id: string;
  resource_id: string;
  incident_id: string;
  actor_id: string;
  device_id: string;
  event_type: 'CLAIM' | 'DISPATCH' | 'RELEASE' | 'STATUS_UPDATE';
  created_at_client: string;
  observed_version: number;
  channel: Channel;
  payload: Record<string, unknown>;
  sync_status: 'PENDING_SYNC' | 'ACCEPTED' | 'CONFLICT' | 'REJECTED';
}

// ============================================================================
// 3. PURE DETERMINISTIC STATE MACHINE FUNCTIONS
// ============================================================================

export interface CanClaimResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Pure evaluation of whether a resource can be claimed.
 * Online or offline: resource must be in AVAILABLE status.
 */
export function canClaim(resource: Resource): CanClaimResult {
  if (resource.status !== 'AVAILABLE') {
    return {
      allowed: false,
      reason: `Resource ${resource.resource_id} is in state ${resource.status}, expected AVAILABLE`,
    };
  }
  return { allowed: true };
}

/**
 * Pure evaluation of whether a resource can be dispatched.
 * Only CLAIMED resources can transition to DISPATCHED.
 */
export function canDispatch(resource: Resource): boolean {
  return resource.status === 'CLAIMED';
}

/**
 * Pure evaluation of whether a resource can be released back to AVAILABLE.
 * CLAIMED, DISPATCHED, or IN_USE resources can be released.
 */
export function canRelease(resource: Resource): boolean {
  return ['CLAIMED', 'DISPATCHED', 'IN_USE'].includes(resource.status);
}

/**
 * Pure evaluation of whether an actor can resolve a conflict.
 * Requires SUPERVISOR or ADMINISTRATOR role, and resource must be in CONFLICT or HUMAN_REVIEW.
 */
export function canResolveConflict(
  resource: Resource,
  conflict: Conflict,
  actorRole: UserRole,
): { allowed: boolean; reason?: string } {
  if (actorRole !== 'SUPERVISOR' && actorRole !== 'ADMINISTRATOR') {
    return {
      allowed: false,
      reason: `Actor with role ${actorRole} is not authorized to resolve conflicts. Requires SUPERVISOR or ADMINISTRATOR.`,
    };
  }
  if (!['CONFLICT', 'HUMAN_REVIEW'].includes(resource.status)) {
    return {
      allowed: false,
      reason: `Resource ${resource.resource_id} is in status ${resource.status}, expected CONFLICT or HUMAN_REVIEW`,
    };
  }
  if (conflict.status === 'RESOLVED') {
    return {
      allowed: false,
      reason: `Conflict ${conflict.conflict_id} has already been resolved`,
    };
  }
  return { allowed: true };
}

export interface TransitionOptions {
  actor_id?: string;
  incident_id?: string;
  timestamp?: string;
  incrementVersion?: boolean;
}

/**
 * Deterministic state transition function.
 * Validates transition legality and returns a NEW immutable Resource copy.
 */
export function transitionResourceState(
  resource: Resource,
  nextState: ResourceStatus,
  options: TransitionOptions = {},
): Resource {
  const current = resource.status;
  const valid = isTransitionAllowed(current, nextState);

  if (!valid) {
    throw new Error(
      `Illegal state transition: Cannot transition resource ${resource.resource_id} from ${current} to ${nextState}`,
    );
  }

  const shouldIncrement = options.incrementVersion ?? (nextState !== 'PENDING_SYNC');

  return {
    ...resource,
    status: nextState,
    version: shouldIncrement ? resource.version + 1 : resource.version,
    assigned_incident_id:
      options.incident_id !== undefined ? options.incident_id : resource.assigned_incident_id,
    assigned_actor_id:
      options.actor_id !== undefined ? options.actor_id : resource.assigned_actor_id,
    updated_at: options.timestamp || new Date().toISOString(),
  };
}

/**
 * Matrix of allowed resource state transitions.
 */
export function isTransitionAllowed(current: ResourceStatus, next: ResourceStatus): boolean {
  if (current === next) return true;

  switch (current) {
    case 'AVAILABLE':
      return next === 'CLAIMED' || next === 'PENDING_SYNC';
    case 'PENDING_SYNC':
      return next === 'CLAIMED' || next === 'CONFLICT' || next === 'AVAILABLE';
    case 'CLAIMED':
      return next === 'DISPATCHED' || next === 'AVAILABLE' || next === 'CONFLICT' || next === 'HUMAN_REVIEW';
    case 'DISPATCHED':
      return next === 'IN_USE' || next === 'AVAILABLE';
    case 'IN_USE':
      return next === 'AVAILABLE';
    case 'CONFLICT':
      return next === 'HUMAN_REVIEW' || next === 'RESOLVED';
    case 'HUMAN_REVIEW':
      return next === 'RESOLVED' || next === 'AVAILABLE';
    case 'RESOLVED':
      return next === 'CLAIMED' || next === 'AVAILABLE';
    default:
      return false;
  }
}

/**
 * Create a deterministic claim event representation.
 */
export function createClaimEvent(
  claim: Omit<Claim, 'claim_id'>,
  claimIdGenerator: () => string = () => `claim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
): Claim {
  return {
    ...claim,
    claim_id: claimIdGenerator(),
  };
}

/**
 * Create a new conflict instance with complete preserved evidence.
 * NEVER deletes or silences losing evidence.
 */
export function createConflict(
  resourceId: string,
  competingEvidence: ConflictEvidence[],
  detectedAt: string = new Date().toISOString(),
  conflictIdGenerator: () => string = () => `conf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
): Conflict {
  return {
    conflict_id: conflictIdGenerator(),
    resource_id: resourceId,
    claim_ids: competingEvidence.map(e => e.claim_id),
    detected_at: detectedAt,
    status: 'DETECTED',
    evidence: [...competingEvidence],
  };
}

/**
 * Deterministically resolve a conflict, assigning the winning claim and moving resource to resolved.
 */
export function resolveConflict(
  conflict: Conflict,
  winningClaimId: string,
  resolverActorId: string,
  notes: string,
  targetState: ResourceStatus = 'CLAIMED',
  resolvedAt: string = new Date().toISOString(),
): Conflict {
  const winnerExists = conflict.evidence.some(e => e.claim_id === winningClaimId);
  if (!winnerExists) {
    throw new Error(
      `Winning claim ${winningClaimId} does not match any evidence in conflict ${conflict.conflict_id}`,
    );
  }

  return {
    ...conflict,
    status: 'RESOLVED',
    resolution: {
      winning_claim_id: winningClaimId,
      resolved_by: resolverActorId,
      resolved_at: resolvedAt,
      notes,
      target_state: targetState,
    },
  };
}

export type ResourceStatus = 'AVAILABLE' | 'CLAIMED' | 'DISPATCHED' | 'IN_USE' | 'PENDING_SYNC' | 'CONFLICT' | 'HUMAN_REVIEW' | 'RESOLVED';
export type SyncStatus = 'ONLINE' | 'OFFLINE' | 'PENDING_SYNC' | 'SYNCING' | 'ACCEPTED' | 'CONFLICT' | 'REJECTED' | 'SYNCHRONIZED';
export type Channel = 'WEB' | 'SMS' | 'API';
export type UserRole = 'RESPONDER' | 'DISPATCHER' | 'SUPERVISOR' | 'ADMINISTRATOR';
export type AmbulanceType = 'AMBULANCE_BLS' | 'AMBULANCE_ALS' | 'AMBULANCE_MICU';
export type IncidentSeverity = 'CRITICAL' | 'URGENT' | 'STANDARD' | 'NON_EMERGENCY';
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
export type ConflictResolutionAction = 'ASSIGN_TO_ALPHA' | 'ASSIGN_TO_BRAVO' | 'REQUEST_INFORMATION';
export interface ConflictTimelineEvent {
    step: string;
    timestamp: string;
    actor_id?: string;
    description: string;
}
export interface ConflictEvidence {
    claim_id: string;
    actor_id: string;
    team_id?: string;
    device_id: string;
    client_event_id: string;
    created_at_client: string;
    received_at_server: string;
    channel: Channel;
    observed_version: number;
    connectivity_status?: 'ONLINE' | 'OFFLINE';
    request_id?: string;
    payload: Record<string, unknown>;
}
export interface Conflict {
    conflict_id: string;
    resource_id: string;
    claim_ids: string[];
    detected_at: string;
    status: 'DETECTED' | 'UNDER_REVIEW' | 'RESOLVED';
    evidence: ConflictEvidence[];
    timeline?: ConflictTimelineEvent[];
    resolution?: {
        action?: ConflictResolutionAction;
        winning_claim_id?: string;
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
export interface CanClaimResult {
    allowed: boolean;
    reason?: string;
}
/**
 * Pure evaluation of whether a resource can be claimed.
 * Online or offline: resource must be in AVAILABLE status.
 */
export declare function canClaim(resource: Resource): CanClaimResult;
/**
 * Pure evaluation of whether a resource can be dispatched.
 * Only CLAIMED resources can transition to DISPATCHED.
 */
export declare function canDispatch(resource: Resource): boolean;
/**
 * Pure evaluation of whether a resource can be released back to AVAILABLE.
 * CLAIMED, DISPATCHED, or IN_USE resources can be released.
 */
export declare function canRelease(resource: Resource): boolean;
/**
 * Pure evaluation of whether an actor can resolve a conflict.
 * Requires SUPERVISOR or ADMINISTRATOR role, and resource must be in CONFLICT or HUMAN_REVIEW.
 */
export declare function canResolveConflict(resource: Resource, conflict: Conflict, actorRole: UserRole): {
    allowed: boolean;
    reason?: string;
};
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
export declare function transitionResourceState(resource: Resource, nextState: ResourceStatus, options?: TransitionOptions): Resource;
/**
 * Matrix of allowed resource state transitions.
 */
export declare function isTransitionAllowed(current: ResourceStatus, next: ResourceStatus): boolean;
/**
 * Create a deterministic claim event representation.
 */
export declare function createClaimEvent(claim: Omit<Claim, 'claim_id'>, claimIdGenerator?: () => string): Claim;
/**
 * Create a new conflict instance with complete preserved evidence.
 * NEVER deletes or silences losing evidence.
 */
export declare function createConflict(resourceId: string, competingEvidence: ConflictEvidence[], detectedAt?: string, conflictIdGenerator?: () => string): Conflict;
/**
 * Deterministically resolve a conflict, assigning the winning claim and moving resource to resolved.
 */
export declare function resolveConflict(conflict: Conflict, winningClaimId: string, resolverActorId: string, notes: string, targetState?: ResourceStatus, resolvedAt?: string): Conflict;
/**
 * Pure conflict detection engine.
 * Evaluates whether an incoming offline sync event or online claim conflicts with authoritative state.
 * Never silences or discards losing evidence.
 */
export declare function detectConflict(authoritativeResource: Resource, incomingEvent: OfflineEvent, serverReceivedAt?: string, existingConflict?: Conflict): {
    isConflict: boolean;
    reason?: string;
    conflict?: Conflict;
};
/**
 * Deterministically apply conflict resolution with complete RBAC and conditional update semantics.
 */
export declare function applyConflictResolution(resource: Resource, conflict: Conflict, action: ConflictResolutionAction, resolverActorId: string, resolverRole: UserRole, notes: string, targetClaimId?: string, resolvedAt?: string): {
    updatedResource: Resource;
    updatedConflict: Conflict;
    auditEvent: DomainEvent;
};
//# sourceMappingURL=index.d.ts.map
// ResQSync Domain - Authoritative Domain Models and Deterministic State Machine
/**
 * Pure evaluation of whether a resource can be claimed.
 * Online or offline: resource must be in AVAILABLE status.
 */
export function canClaim(resource) {
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
export function canDispatch(resource) {
    return resource.status === 'CLAIMED';
}
/**
 * Pure evaluation of whether a resource can be released back to AVAILABLE.
 * CLAIMED, DISPATCHED, or IN_USE resources can be released.
 */
export function canRelease(resource) {
    return ['CLAIMED', 'DISPATCHED', 'IN_USE'].includes(resource.status);
}
/**
 * Pure evaluation of whether an actor can resolve a conflict.
 * Requires SUPERVISOR or ADMINISTRATOR role, and resource must be in CONFLICT or HUMAN_REVIEW.
 */
export function canResolveConflict(resource, conflict, actorRole) {
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
/**
 * Deterministic state transition function.
 * Validates transition legality and returns a NEW immutable Resource copy.
 */
export function transitionResourceState(resource, nextState, options = {}) {
    const current = resource.status;
    const valid = isTransitionAllowed(current, nextState);
    if (!valid) {
        throw new Error(`Illegal state transition: Cannot transition resource ${resource.resource_id} from ${current} to ${nextState}`);
    }
    const shouldIncrement = options.incrementVersion ?? (nextState !== 'PENDING_SYNC');
    return {
        ...resource,
        status: nextState,
        version: shouldIncrement ? resource.version + 1 : resource.version,
        assigned_incident_id: options.incident_id !== undefined ? options.incident_id : resource.assigned_incident_id,
        assigned_actor_id: options.actor_id !== undefined ? options.actor_id : resource.assigned_actor_id,
        updated_at: options.timestamp || new Date().toISOString(),
    };
}
/**
 * Matrix of allowed resource state transitions.
 */
export function isTransitionAllowed(current, next) {
    if (current === next)
        return true;
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
export function createClaimEvent(claim, claimIdGenerator = () => `claim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`) {
    return {
        ...claim,
        claim_id: claimIdGenerator(),
    };
}
/**
 * Create a new conflict instance with complete preserved evidence.
 * NEVER deletes or silences losing evidence.
 */
export function createConflict(resourceId, competingEvidence, detectedAt = new Date().toISOString(), conflictIdGenerator = () => `conf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`) {
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
export function resolveConflict(conflict, winningClaimId, resolverActorId, notes, targetState = 'CLAIMED', resolvedAt = new Date().toISOString()) {
    const winnerExists = conflict.evidence.some(e => e.claim_id === winningClaimId);
    if (!winnerExists) {
        throw new Error(`Winning claim ${winningClaimId} does not match any evidence in conflict ${conflict.conflict_id}`);
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
//# sourceMappingURL=index.js.map
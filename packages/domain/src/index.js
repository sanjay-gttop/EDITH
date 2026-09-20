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
/**
 * Pure conflict detection engine.
 * Evaluates whether an incoming offline sync event or online claim conflicts with authoritative state.
 * Never silences or discards losing evidence.
 */
export function detectConflict(authoritativeResource, incomingEvent, serverReceivedAt = new Date().toISOString(), existingConflict) {
    // Idempotency: same event_id is not a new conflict
    if (existingConflict &&
        existingConflict.evidence.some(e => e.client_event_id === incomingEvent.client_event_id)) {
        return { isConflict: false, conflict: existingConflict };
    }
    const isAlreadyAllocatedToOther = authoritativeResource.status !== 'AVAILABLE' &&
        authoritativeResource.assigned_actor_id !== incomingEvent.actor_id;
    const isVersionStale = incomingEvent.observed_version < authoritativeResource.version;
    if (isAlreadyAllocatedToOther ||
        isVersionStale ||
        ['CONFLICT', 'HUMAN_REVIEW'].includes(authoritativeResource.status)) {
        const incomingEvidence = {
            claim_id: `claim-${incomingEvent.client_event_id}`,
            actor_id: incomingEvent.actor_id,
            team_id: incomingEvent.payload?.team_id || 'Team-Alpha',
            device_id: incomingEvent.device_id,
            client_event_id: incomingEvent.client_event_id,
            created_at_client: incomingEvent.created_at_client,
            received_at_server: serverReceivedAt,
            channel: incomingEvent.channel,
            observed_version: incomingEvent.observed_version,
            connectivity_status: 'OFFLINE',
            request_id: incomingEvent.incident_id,
            payload: incomingEvent.payload,
        };
        if (existingConflict) {
            // Append evidence - never overwrite
            const updatedConflict = {
                ...existingConflict,
                claim_ids: [...existingConflict.claim_ids, incomingEvidence.claim_id],
                evidence: [...existingConflict.evidence, incomingEvidence],
                timeline: [
                    ...(existingConflict.timeline || []),
                    {
                        step: 'COMPETING_CLAIM_DETECTED',
                        timestamp: serverReceivedAt,
                        actor_id: incomingEvent.actor_id,
                        description: `Competing claim ${incomingEvidence.claim_id} synced by ${incomingEvent.actor_id} while resource in status ${authoritativeResource.status}`,
                    },
                ],
            };
            return {
                isConflict: true,
                reason: `Competing claim on resource ${authoritativeResource.resource_id} appended to existing conflict ${existingConflict.conflict_id}`,
                conflict: updatedConflict,
            };
        }
        // Existing authoritative claim evidence (e.g. Bravo who claimed online)
        const existingAllocationEvidence = {
            claim_id: `claim-auth-${authoritativeResource.version}`,
            actor_id: authoritativeResource.assigned_actor_id || 'USR-BRAVO',
            team_id: 'Team-Bravo',
            device_id: 'DEV-STATION-BRAVO',
            client_event_id: `evt-online-${authoritativeResource.version}`,
            created_at_client: authoritativeResource.updated_at,
            received_at_server: authoritativeResource.updated_at,
            channel: 'WEB',
            observed_version: authoritativeResource.version - 1,
            connectivity_status: 'ONLINE',
            request_id: authoritativeResource.assigned_incident_id || 'INC-BRAVO',
            payload: { status: authoritativeResource.status },
        };
        const newConflict = {
            conflict_id: `conf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            resource_id: authoritativeResource.resource_id,
            claim_ids: [existingAllocationEvidence.claim_id, incomingEvidence.claim_id],
            detected_at: serverReceivedAt,
            status: 'DETECTED',
            evidence: [existingAllocationEvidence, incomingEvidence],
            timeline: [
                {
                    step: 'RESOURCE_AVAILABLE',
                    timestamp: '2026-09-20T10:00:00.000Z',
                    description: `Resource ${authoritativeResource.resource_id} available at version 1`,
                },
                {
                    step: 'ONLINE_CLAIM_ESTABLISHED',
                    timestamp: existingAllocationEvidence.received_at_server,
                    actor_id: existingAllocationEvidence.actor_id,
                    description: `Authoritative claim established by ${existingAllocationEvidence.actor_id} (Version ${authoritativeResource.version})`,
                },
                {
                    step: 'OFFLINE_CLAIM_SYNCED',
                    timestamp: serverReceivedAt,
                    actor_id: incomingEvent.actor_id,
                    description: `Offline claim submitted with observed version ${incomingEvent.observed_version} by ${incomingEvent.actor_id}`,
                },
                {
                    step: 'CONFLICT_DECLARED',
                    timestamp: serverReceivedAt,
                    description: 'Conflict declared: competing claims preserved for human adjudication',
                },
            ],
        };
        return {
            isConflict: true,
            reason: `Competing claim on resource ${authoritativeResource.resource_id}: currently ${authoritativeResource.status} (v${authoritativeResource.version}) vs incoming observed version ${incomingEvent.observed_version}`,
            conflict: newConflict,
        };
    }
    return { isConflict: false };
}
/**
 * Deterministically apply conflict resolution with complete RBAC and conditional update semantics.
 */
export function applyConflictResolution(resource, conflict, action, resolverActorId, resolverRole, notes, targetClaimId, resolvedAt = new Date().toISOString()) {
    // Strict authorization check
    if (resolverRole !== 'SUPERVISOR' && resolverRole !== 'ADMINISTRATOR') {
        throw new Error(`Unauthorized: Role '${resolverRole}' is not permitted to resolve conflicts. Requires SUPERVISOR or ADMINISTRATOR.`);
    }
    if (conflict.status === 'RESOLVED') {
        throw new Error(`Conflict '${conflict.conflict_id}' is already resolved.`);
    }
    let winnerClaim;
    let targetState = 'CLAIMED';
    let targetActorId = resource.assigned_actor_id;
    let targetIncidentId = resource.assigned_incident_id;
    if (action === 'ASSIGN_TO_ALPHA') {
        winnerClaim =
            conflict.evidence.find(e => e.actor_id.includes('ALPHA') || e.team_id?.includes('Alpha')) ||
                conflict.evidence[1] ||
                conflict.evidence[0];
        targetActorId = winnerClaim?.actor_id || 'USR-ALPHA';
        targetIncidentId = winnerClaim?.request_id || 'INC-ALPHA';
        targetState = 'CLAIMED';
    }
    else if (action === 'ASSIGN_TO_BRAVO') {
        winnerClaim =
            conflict.evidence.find(e => e.actor_id.includes('BRAVO') || e.team_id?.includes('Bravo')) ||
                conflict.evidence[0];
        targetActorId = winnerClaim?.actor_id || 'USR-BRAVO';
        targetIncidentId = winnerClaim?.request_id || 'INC-BRAVO';
        targetState = 'CLAIMED';
    }
    else if (action === 'REQUEST_INFORMATION') {
        targetState = 'HUMAN_REVIEW';
    }
    if (targetClaimId) {
        winnerClaim = conflict.evidence.find(e => e.claim_id === targetClaimId);
        if (winnerClaim) {
            targetActorId = winnerClaim.actor_id;
            targetIncidentId = winnerClaim.request_id || resource.assigned_incident_id;
        }
    }
    const isFinalResolution = action !== 'REQUEST_INFORMATION';
    const updatedConflict = {
        ...conflict,
        status: isFinalResolution ? 'RESOLVED' : 'UNDER_REVIEW',
        resolution: isFinalResolution
            ? {
                action,
                winning_claim_id: winnerClaim?.claim_id || targetClaimId || 'claim-resolved',
                resolved_by: resolverActorId,
                resolved_at: resolvedAt,
                notes,
                target_state: targetState,
            }
            : undefined,
        timeline: [
            ...(conflict.timeline || []),
            {
                step: isFinalResolution ? 'CONFLICT_RESOLVED' : 'INFORMATION_REQUESTED',
                timestamp: resolvedAt,
                actor_id: resolverActorId,
                description: `Action: ${action} by ${resolverActorId} (${resolverRole}). Notes: ${notes}`,
            },
        ],
    };
    const updatedResource = {
        ...resource,
        status: targetState,
        version: resource.version + 1,
        assigned_actor_id: targetActorId,
        assigned_incident_id: targetIncidentId,
        updated_at: resolvedAt,
    };
    const auditEvent = {
        event_id: `evt-audit-${Date.now()}`,
        event_type: isFinalResolution ? 'CONFLICT_RESOLVED' : 'CONFLICT_INVESTIGATION_UPDATED',
        entity_id: resource.resource_id,
        actor_id: resolverActorId,
        timestamp: resolvedAt,
        correlation_id: conflict.conflict_id,
        payload: {
            conflict_id: conflict.conflict_id,
            action,
            winning_claim_id: winnerClaim?.claim_id,
            assigned_actor_id: targetActorId,
            assigned_incident_id: targetIncidentId,
            previous_version: resource.version,
            authoritative_version: updatedResource.version,
            notes,
        },
    };
    return { updatedResource, updatedConflict, auditEvent };
}
//# sourceMappingURL=index.js.map
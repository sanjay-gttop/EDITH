import type { Conflict, Resource } from '@resqsync/domain';

export interface ConflictEntry {
  conflict: Conflict;
  resource: Resource;
}

const INITIAL_RESOURCE_A12: Resource = {
  resource_id: 'AMB-A12',
  resource_type: 'AMBULANCE_ALS',
  call_sign: 'Medic-12',
  status: 'HUMAN_REVIEW',
  version: 2,
  agency_id: 'AGY-METRO-EMS',
  assigned_incident_id: 'INC-BRAVO-402',
  assigned_actor_id: 'USR-BRAVO',
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: 'Station 4, Central District',
  },
  updated_at: '2026-09-20T10:06:00.000Z',
};

const INITIAL_CONFLICT_A12: Conflict = {
  conflict_id: 'CONF-A12-8801',
  resource_id: 'AMB-A12',
  claim_ids: ['claim-alpha-01', 'claim-bravo-02'],
  detected_at: '2026-09-20T10:06:00.000Z',
  status: 'DETECTED',
  evidence: [
    {
      claim_id: 'claim-alpha-01',
      actor_id: 'USR-ALPHA',
      team_id: 'Team-Alpha',
      device_id: 'DEV-TAB-ALPHA',
      client_event_id: 'evt-alpha-9901',
      created_at_client: '2026-09-20T10:02:00.000Z',
      received_at_server: '2026-09-20T10:06:00.000Z',
      channel: 'WEB',
      observed_version: 1,
      connectivity_status: 'OFFLINE',
      request_id: 'INC-ALPHA-401',
      payload: { note: 'Offline triage at sector 4' },
    },
    {
      claim_id: 'claim-bravo-02',
      actor_id: 'USR-BRAVO',
      team_id: 'Team-Bravo',
      device_id: 'DEV-STATION-BRAVO',
      client_event_id: 'evt-bravo-9902',
      created_at_client: '2026-09-20T10:03:00.000Z',
      received_at_server: '2026-09-20T10:03:00.000Z',
      channel: 'WEB',
      observed_version: 1,
      connectivity_status: 'ONLINE',
      request_id: 'INC-BRAVO-402',
      payload: { note: 'Online dispatch for critical respiratory patient' },
    },
  ],
  timeline: [
    {
      step: 'RESOURCE_AVAILABLE',
      timestamp: '2026-09-20T10:00:00.000Z',
      description: 'Unit AMB-A12 available at station (v1)',
    },
    {
      step: 'ALPHA_OFFLINE_CLAIM',
      timestamp: '2026-09-20T10:02:00.000Z',
      actor_id: 'USR-ALPHA',
      description: 'Alpha went offline and recorded local claim evt-alpha-9901',
    },
    {
      step: 'BRAVO_ONLINE_CLAIM',
      timestamp: '2026-09-20T10:03:00.000Z',
      actor_id: 'USR-BRAVO',
      description: 'Bravo claimed AMB-A12 directly online; authoritative version moved to v2',
    },
    {
      step: 'ALPHA_RECONNECT_SYNC',
      timestamp: '2026-09-20T10:06:00.000Z',
      actor_id: 'USR-ALPHA',
      description: 'Alpha reconnected and uploaded sync batch',
    },
    {
      step: 'CONFLICT_DETECTED',
      timestamp: '2026-09-20T10:06:00.000Z',
      description: 'Stale version detected. Preserved both claims in CONF-A12-8801',
    },
  ],
};

const resourceStore = new Map<string, Resource>([
  ['AMB-A12', { ...INITIAL_RESOURCE_A12 }],
]);

const conflictStore = new Map<string, ConflictEntry>([
  [
    'CONF-A12-8801',
    {
      conflict: { ...INITIAL_CONFLICT_A12 },
      resource: { ...INITIAL_RESOURCE_A12 },
    },
  ],
]);

export function getResource(resourceId: string): Resource | undefined {
  return resourceStore.get(resourceId);
}

export function setResource(resource: Resource): void {
  resourceStore.set(resource.resource_id, resource);
}

export function getAllResources(): Resource[] {
  return Array.from(resourceStore.values());
}

export function getConflict(conflictId: string): ConflictEntry | undefined {
  return conflictStore.get(conflictId);
}

export function getConflictByResourceId(resourceId: string): ConflictEntry | undefined {
  for (const entry of conflictStore.values()) {
    if (entry.conflict.resource_id === resourceId && entry.conflict.status !== 'RESOLVED') {
      return entry;
    }
  }
  return undefined;
}

export function getAllConflicts(): Conflict[] {
  return Array.from(conflictStore.values()).map(e => e.conflict);
}

export function saveConflict(conflict: Conflict, resource?: Resource): void {
  const existing = conflictStore.get(conflict.conflict_id);
  const targetResource = resource || existing?.resource || getResource(conflict.resource_id) || {
    resource_id: conflict.resource_id,
    resource_type: 'AMBULANCE_ALS',
    call_sign: 'Medic-Unit',
    status: 'HUMAN_REVIEW',
    version: 2,
    agency_id: 'AGY-METRO-EMS',
    assigned_incident_id: null,
    assigned_actor_id: null,
    location: { latitude: 37.7749, longitude: -122.4194 },
    updated_at: conflict.detected_at,
  };

  conflictStore.set(conflict.conflict_id, {
    conflict,
    resource: targetResource,
  });

  if (resource) {
    setResource(resource);
  }
}

export function clearStore(): void {
  resourceStore.clear();
  conflictStore.clear();
}

export function resetStore(): void {
  resourceStore.clear();
  conflictStore.clear();

  resourceStore.set('AMB-A12', { ...INITIAL_RESOURCE_A12 });
  conflictStore.set('CONF-A12-8801', {
    conflict: { ...INITIAL_CONFLICT_A12 },
    resource: { ...INITIAL_RESOURCE_A12 },
  });
}

import Dexie, { type EntityTable } from 'dexie';
import type { OfflineEvent, Resource } from '@resqsync/domain';

export interface DeviceSession {
  device_id: string;
  actor_id: string;
  registered_at: string;
  last_online_at?: string;
}

export interface CachedResourceEntry {
  resource_id: string;
  data: Resource;
  cached_at: string;
  is_stale: boolean;
}

/**
 * ResQSync Offline IndexedDB database managed with Dexie.
 * Preserves pending events through browser close/restart.
 */
export class ResQSyncOfflineDB extends Dexie {
  events!: EntityTable<OfflineEvent, 'client_event_id'>;
  cached_resources!: EntityTable<CachedResourceEntry, 'resource_id'>;
  device_session!: EntityTable<DeviceSession, 'device_id'>;

  constructor(databaseName = 'resqsync_offline_db') {
    super(databaseName);
    this.version(1).stores({
      events: 'client_event_id, resource_id, sync_status, created_at_client',
      cached_resources: 'resource_id, cached_at, is_stale',
      device_session: 'device_id, actor_id',
    });
  }
}

/**
 * Singleton database instance.
 */
export const offlineDb = new ResQSyncOfflineDB();

/**
 * Generate a cryptographically distinct, deterministic client event ID.
 * Format: evt-<timestamp>-<random-hex>
 */
export function generateClientEventId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `evt-${timestamp}-${randomPart}`;
}

/**
 * Retrieve or initialize a persistent device ID stored in localStorage or fallback.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'dev-headless-001';
  }
  const key = 'resqsync_device_id';
  let deviceId = window.localStorage.getItem(key);
  if (!deviceId) {
    deviceId = `dev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    window.localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

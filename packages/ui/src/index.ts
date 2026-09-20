import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ResourceStatus, SyncStatus } from '@resqsync/domain';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export interface StateDisplayMeta {
  code: string;
  label: string;
  semanticAriaLabel: string;
  iconName: string;
  badgeClassName: string;
  textClassName: string;
  description: string;
}

export const RESOURCE_STATE_META: Record<ResourceStatus, StateDisplayMeta> = {
  AVAILABLE: {
    code: 'AVAILABLE',
    label: 'Available',
    semanticAriaLabel: 'Resource is available for dispatch',
    iconName: 'CheckCircle2',
    badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    textClassName: 'text-emerald-700 dark:text-emerald-400',
    description: 'Unit is operational, unassigned, and ready to be claimed immediately.',
  },
  CLAIMED: {
    code: 'CLAIMED',
    label: 'Claimed',
    semanticAriaLabel: 'Resource is claimed by an active team',
    iconName: 'Lock',
    badgeClassName: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    textClassName: 'text-blue-700 dark:text-blue-400',
    description: 'Unit is securely allocated to an active responder team awaiting dispatch.',
  },
  DISPATCHED: {
    code: 'DISPATCHED',
    label: 'Dispatched',
    semanticAriaLabel: 'Resource is en route to scene',
    iconName: 'Navigation',
    badgeClassName: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    textClassName: 'text-indigo-700 dark:text-indigo-400',
    description: 'Unit is actively driving en route to the incident location.',
  },
  IN_USE: {
    code: 'IN_USE',
    label: 'On Scene / In Use',
    semanticAriaLabel: 'Resource is actively engaged on scene',
    iconName: 'Activity',
    badgeClassName: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    textClassName: 'text-purple-700 dark:text-purple-400',
    description: 'Unit is on-scene providing patient triage, treatment, or transport.',
  },
  PENDING_SYNC: {
    code: 'PENDING_SYNC',
    label: 'Pending Sync',
    semanticAriaLabel: 'Offline claim awaiting server synchronization',
    iconName: 'Clock',
    badgeClassName: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700',
    textClassName: 'text-amber-800 dark:text-amber-400',
    description: 'Claimed locally while offline. Queued for server reconciliation upon reconnect.',
  },
  CONFLICT: {
    code: 'CONFLICT',
    label: 'Conflict Detected',
    semanticAriaLabel: 'Conflicting concurrent claims detected',
    iconName: 'AlertTriangle',
    badgeClassName: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700',
    textClassName: 'text-rose-700 dark:text-rose-400',
    description: 'Multiple partitioned responders claimed this unit concurrently.',
  },
  HUMAN_REVIEW: {
    code: 'HUMAN_REVIEW',
    label: 'Human Review Required',
    semanticAriaLabel: 'Requires supervisor manual review and adjudication',
    iconName: 'ShieldAlert',
    badgeClassName: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-700',
    textClassName: 'text-orange-800 dark:text-orange-400',
    description: 'Escalated to Supervisor queue for triage decision and evidence adjudication.',
  },
  RESOLVED: {
    code: 'RESOLVED',
    label: 'Conflict Resolved',
    semanticAriaLabel: 'Conflict resolved by supervisor',
    iconName: 'CheckCheck',
    badgeClassName: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    textClassName: 'text-teal-700 dark:text-teal-400',
    description: 'Supervisor has designated the authoritative claimant.',
  },
};

export const SYNC_STATE_META: Record<SyncStatus, StateDisplayMeta> = {
  ONLINE: {
    code: 'ONLINE',
    label: 'Online',
    semanticAriaLabel: 'Connected to central server with low latency',
    iconName: 'Wifi',
    badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClassName: 'text-emerald-700',
    description: 'Real-time WebSocket and HTTP connection established.',
  },
  OFFLINE: {
    code: 'OFFLINE',
    label: 'Offline Mode',
    semanticAriaLabel: 'No network connection. Operating from local cache.',
    iconName: 'WifiOff',
    badgeClassName: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200',
    textClassName: 'text-zinc-800 dark:text-zinc-200',
    description: 'Network disconnected. Local actions are safely queued in IndexedDB.',
  },
  PENDING_SYNC: {
    code: 'PENDING_SYNC',
    label: 'Pending Sync',
    semanticAriaLabel: 'Unsynced local actions waiting for connection',
    iconName: 'CloudAlert',
    badgeClassName: 'bg-amber-50 text-amber-800 border-amber-300',
    textClassName: 'text-amber-800',
    description: 'Offline mutations queued and waiting for network resumption.',
  },
  SYNCING: {
    code: 'SYNCING',
    label: 'Syncing',
    semanticAriaLabel: 'Reconciling offline queue with authoritative server',
    iconName: 'RefreshCw',
    badgeClassName: 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse',
    textClassName: 'text-blue-700',
    description: 'Uploading batches and resolving optimistic updates.',
  },
  ACCEPTED: {
    code: 'ACCEPTED',
    label: 'Accepted',
    semanticAriaLabel: 'Server accepted offline update',
    iconName: 'CheckCircle',
    badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClassName: 'text-emerald-700',
    description: 'Authoritative server successfully committed offline change.',
  },
  CONFLICT: {
    code: 'CONFLICT',
    label: 'Reconciliation Conflict',
    semanticAriaLabel: 'Conflict occurred during synchronization',
    iconName: 'AlertCircle',
    badgeClassName: 'bg-rose-50 text-rose-700 border-rose-300',
    textClassName: 'text-rose-700',
    description: 'Server state differed from local assumption during disconnect.',
  },
  REJECTED: {
    code: 'REJECTED',
    label: 'Rejected',
    semanticAriaLabel: 'Server rejected offline update',
    iconName: 'XCircle',
    badgeClassName: 'bg-red-50 text-red-700 border-red-300',
    textClassName: 'text-red-700',
    description: 'Event was invalid or stale and could not be reconciled.',
  },
  SYNCHRONIZED: {
    code: 'SYNCHRONIZED',
    label: 'Synchronized',
    semanticAriaLabel: 'All offline queues cleared and verified',
    iconName: 'CloudCheck',
    badgeClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClassName: 'text-emerald-700',
    description: 'Local device is 100% up-to-date with authoritative DynamoDB state.',
  },
};

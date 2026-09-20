import type React from 'react';
import type { ResourceStatus, SyncStatus } from '@resqsync/domain';
import { RESOURCE_STATE_META, SYNC_STATE_META, cn } from '@resqsync/ui';
import {
  CheckCircle2,
  Lock,
  Navigation,
  Activity,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCheck,
  Wifi,
  WifiOff,
  CloudAlert,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Cloud,
} from 'lucide-react';

interface ResourceStateBadgeProps {
  status: ResourceStatus;
  className?: string;
}

const RESOURCE_ICONS: Record<ResourceStatus, React.ComponentType<{ className?: string }>> = {
  AVAILABLE: CheckCircle2,
  CLAIMED: Lock,
  DISPATCHED: Navigation,
  IN_USE: Activity,
  PENDING_SYNC: Clock,
  CONFLICT: AlertTriangle,
  HUMAN_REVIEW: ShieldAlert,
  RESOLVED: CheckCheck,
};

export const ResourceStateBadge: React.FC<ResourceStateBadgeProps> = ({ status, className }) => {
  const meta = RESOURCE_STATE_META[status] || RESOURCE_STATE_META.AVAILABLE;
  const IconComponent = RESOURCE_ICONS[status] || CheckCircle2;

  return (
    <span
      role="status"
      aria-label={`Resource State: ${meta.semanticAriaLabel}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
        meta.badgeClassName,
        className,
      )}
      title={meta.description}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
      <span className="sr-only">({meta.semanticAriaLabel})</span>
    </span>
  );
};

interface SyncStateBadgeProps {
  status: SyncStatus;
  className?: string;
}

const SYNC_ICONS: Record<SyncStatus, React.ComponentType<{ className?: string }>> = {
  ONLINE: Wifi,
  OFFLINE: WifiOff,
  PENDING_SYNC: CloudAlert,
  SYNCING: RefreshCw,
  ACCEPTED: CheckCircle,
  CONFLICT: AlertCircle,
  REJECTED: XCircle,
  SYNCHRONIZED: Cloud,
};

export const SyncStateBadge: React.FC<SyncStateBadgeProps> = ({ status, className }) => {
  const meta = SYNC_STATE_META[status] || SYNC_STATE_META.ONLINE;
  const IconComponent = SYNC_ICONS[status] || Wifi;

  return (
    <span
      role="status"
      aria-label={`Sync State: ${meta.semanticAriaLabel}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
        meta.badgeClassName,
        className,
      )}
      title={meta.description}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
      <span className="sr-only">({meta.semanticAriaLabel})</span>
    </span>
  );
};

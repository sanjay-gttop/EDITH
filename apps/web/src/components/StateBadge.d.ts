import type React from 'react';
import type { ResourceStatus, SyncStatus } from '@resqsync/domain';
interface ResourceStateBadgeProps {
    status: ResourceStatus;
    className?: string;
}
export declare const ResourceStateBadge: React.FC<ResourceStateBadgeProps>;
interface SyncStateBadgeProps {
    status: SyncStatus;
    className?: string;
}
export declare const SyncStateBadge: React.FC<SyncStateBadgeProps>;
export {};
//# sourceMappingURL=StateBadge.d.ts.map
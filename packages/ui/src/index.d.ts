import { type ClassValue } from 'clsx';
import type { ResourceStatus, SyncStatus } from '@resqsync/domain';
export declare function cn(...inputs: ClassValue[]): string;
export interface StateDisplayMeta {
    code: string;
    label: string;
    semanticAriaLabel: string;
    iconName: string;
    badgeClassName: string;
    textClassName: string;
    description: string;
}
export declare const RESOURCE_STATE_META: Record<ResourceStatus, StateDisplayMeta>;
export declare const SYNC_STATE_META: Record<SyncStatus, StateDisplayMeta>;
//# sourceMappingURL=index.d.ts.map
import type { SyncStatus, UserRole, Resource } from '@resqsync/domain';
export type NavTab = 'dispatch' | 'resources' | 'conflicts' | 'sync_center' | 'audit' | 'system_health' | 'requests' | 'settings';
interface AppState {
    currentTab: NavTab;
    syncStatus: SyncStatus;
    userRole: UserRole;
    pendingEventCount: number;
    selectedResourceId: string | null;
    resources: Resource[];
    setCurrentTab: (tab: NavTab) => void;
    setSyncStatus: (status: SyncStatus) => void;
    setUserRole: (role: UserRole) => void;
    setPendingEventCount: (count: number) => void;
    setSelectedResourceId: (id: string | null) => void;
    setResources: (resources: Resource[]) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
export {};
//# sourceMappingURL=useAppStore.d.ts.map
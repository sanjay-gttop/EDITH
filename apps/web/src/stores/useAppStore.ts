import { create } from 'zustand';
import type { SyncStatus, UserRole, Resource } from '@resqsync/domain';

export type NavTab = 'dispatch' | 'resources' | 'conflicts' | 'sync_center' | 'audit';

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

export const useAppStore = create<AppState>(set => ({
  currentTab: 'dispatch',
  syncStatus: 'ONLINE',
  userRole: 'DISPATCHER',
  pendingEventCount: 0,
  selectedResourceId: null,
  resources: [],
  setCurrentTab: tab => set({ currentTab: tab }),
  setSyncStatus: status => set({ syncStatus: status }),
  setUserRole: role => set({ userRole: role }),
  setPendingEventCount: count => set({ pendingEventCount: count }),
  setSelectedResourceId: id => set({ selectedResourceId: id }),
  setResources: resources => set({ resources }),
}));

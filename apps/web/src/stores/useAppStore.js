import { create } from 'zustand';
export const useAppStore = create(set => ({
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
//# sourceMappingURL=useAppStore.js.map
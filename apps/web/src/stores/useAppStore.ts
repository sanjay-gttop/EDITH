import { create } from 'zustand';
import type { SyncStatus, UserRole, Resource } from '@resqsync/domain';

export type NavTab =
  | 'dispatch'
  | 'operations'
  | 'crisis_map'
  | 'resources'
  | 'conflicts'
  | 'sync_center'
  | 'audit'
  | 'system_health'
  | 'requests'
  | 'settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'critical' | 'dispatch';
  timestamp: string;
  read?: boolean;
}

export interface VehicleSimulationState {
  unitId: string;
  status: 'IDLE' | 'DISPATCHING' | 'EN_ROUTE' | 'ARRIVING' | 'ON_SCENE';
  progress: number; // 0.0 to 1.0
  speedKmH: number;
  distanceRemainingKm: number;
  etaMinutes: number;
  assignedIncidentId: string;
}

export interface DynamicTimelineEvent {
  id: string;
  time: string;
  title: string;
  unitId: string;
  incidentId: string;
  type: 'DISPATCH' | 'CLAIM' | 'TRANSIT' | 'ARRIVAL' | 'OPERATION';
  description: string;
}

export interface DisasterOperation {
  id: string;
  name: string;
  incidentType: string;
  priority: 'CRITICAL' | 'URGENT' | 'STANDARD';
  location: string;
  assignedResources: string[];
  startTime: string;
  status: 'ACTIVE' | 'PREPARING' | 'RESOLVED';
}

interface AppState {
  // Navigation & Identity
  currentTab: NavTab;
  syncStatus: SyncStatus;
  userRole: UserRole;
  pendingEventCount: number;
  selectedResourceId: string | null;
  resources: Resource[];

  // Interactive Selection & Search
  selectedVehicleId: string;
  selectedIncidentId: string | null;
  activeFilter: string;
  searchQuery: string;

  // Real-time Vehicle Simulations
  activeSimulations: Record<string, VehicleSimulationState>;

  // Notification Queue
  notifications: AppNotification[];
  isNotificationsPanelOpen: boolean;

  // Mission Timeline & Operations Registry
  timelineEvents: DynamicTimelineEvent[];
  operations: DisasterOperation[];
  isCreateOpModalOpen: boolean;

  // Actions
  setCurrentTab: (tab: NavTab) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setUserRole: (role: UserRole) => void;
  setPendingEventCount: (count: number) => void;
  setSelectedResourceId: (id: string | null) => void;
  setResources: (resources: Resource[]) => void;

  setSelectedVehicleId: (id: string) => void;
  setSelectedIncidentId: (id: string | null) => void;
  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;

  // Notifications
  addNotification: (notif: {
    title: string;
    message: string;
    type?: AppNotification['type'];
  }) => string;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;

  // Vehicle Simulation Actions
  dispatchVehicle: (unitId: string, incidentId?: string) => void;
  updateVehicleSimulation: (unitId: string, updates: Partial<VehicleSimulationState>) => void;
  completeVehicleArrival: (unitId: string) => void;
  resetVehicleSimulation: (unitId: string) => void;

  // Dynamic Timeline & Operations
  addTimelineEvent: (event: Omit<DynamicTimelineEvent, 'id' | 'time'>) => void;
  createOperation: (op: Omit<DisasterOperation, 'id' | 'status'>) => void;
  setCreateOpModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  currentTab: 'dispatch',
  syncStatus: 'ONLINE',
  userRole: 'DISPATCHER',
  pendingEventCount: 0,
  selectedResourceId: null,
  resources: [],

  selectedVehicleId: 'ENG-03',
  selectedIncidentId: null,
  activeFilter: 'All',
  searchQuery: '',

  // Active Vehicle Simulations: Engine-03, Unit-12, Rescue-08
  activeSimulations: {
    'ENG-03': {
      unitId: 'ENG-03',
      status: 'IDLE',
      progress: 0.0,
      speedKmH: 0,
      distanceRemainingKm: 3.4,
      etaMinutes: 6,
      assignedIncidentId: 'INC-408',
    },
    'AMB-A12': {
      unitId: 'AMB-A12',
      status: 'EN_ROUTE',
      progress: 0.58,
      speedKmH: 62,
      distanceRemainingKm: 2.4,
      etaMinutes: 4,
      assignedIncidentId: 'INC-882',
    },
    'AMB-C08': {
      unitId: 'AMB-C08',
      status: 'ON_SCENE',
      progress: 1.0,
      speedKmH: 0,
      distanceRemainingKm: 0.0,
      etaMinutes: 0,
      assignedIncidentId: 'INC-882',
    },
  },

  // Initial Notifications
  notifications: [
    {
      id: 'notif-1',
      title: 'COMMAND CENTER ONLINE',
      message: 'Disaster telemetry sync active on US-East-1. Authoritative DynamoDB online.',
      type: 'info',
      timestamp: '15:10 UTC',
      read: true,
    },
  ],
  isNotificationsPanelOpen: false,

  // Initial Timeline
  timelineEvents: [
    {
      id: 'tl-1',
      time: '14:28 UTC',
      title: 'Incident INC-882 Detected',
      unitId: 'AMB-C08',
      incidentId: 'INC-882',
      type: 'DISPATCH',
      description: 'Seismic collapse registered. Rescue-08 dispatched with heavy shoring gear.',
    },
    {
      id: 'tl-2',
      time: '14:41 UTC',
      title: 'Incident INC-408 Chemical Leak',
      unitId: 'ENG-03',
      incidentId: 'INC-408',
      type: 'DISPATCH',
      description: 'Depot toxic vapor detected. ENGINE-03 assigned for vapor foam suppression.',
    },
  ],

  // Operations Registry
  operations: [
    {
      id: 'OP-CORE-4',
      name: 'Downtown Core Shoring & Extraction',
      incidentType: 'Structural Collapse',
      priority: 'CRITICAL',
      location: 'Sector 4 · Market & 4th Ave',
      assignedResources: ['AMB-A12', 'AMB-C08'],
      startTime: '14:30 UTC',
      status: 'ACTIVE',
    },
    {
      id: 'OP-DEPOT-2',
      name: 'Industrial Depot Vapor Barrier',
      incidentType: 'Chemical Hazmat',
      priority: 'URGENT',
      location: 'Sector 2 · 1200 Industrial Pkwy',
      assignedResources: ['ENG-03'],
      startTime: '14:45 UTC',
      status: 'ACTIVE',
    },
  ],
  isCreateOpModalOpen: false,

  // Base Setters
  setCurrentTab: tab => set({ currentTab: tab }),
  setSyncStatus: status => set({ syncStatus: status }),
  setUserRole: role => set({ userRole: role }),
  setPendingEventCount: count => set({ pendingEventCount: count }),
  setSelectedResourceId: id => set({ selectedResourceId: id }),
  setResources: resources => set({ resources }),

  setSelectedVehicleId: id => set({ selectedVehicleId: id }),
  setSelectedIncidentId: id => set({ selectedIncidentId: id }),
  setActiveFilter: filter => set({ activeFilter: filter }),
  setSearchQuery: query => set({ searchQuery: query }),

  // Notification actions
  addNotification: notif => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC`;
    const newNotif: AppNotification = {
      id,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      timestamp: timeStr,
      read: false,
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications].slice(0, 25),
    }));
    return id;
  },

  dismissNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),

  clearNotifications: () =>
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    })),

  setNotificationsPanelOpen: open => set({ isNotificationsPanelOpen: open }),

  // Vehicle Simulation Actions
  dispatchVehicle: (unitId: string, incidentId?: string) => {
    const state = get();
    const currentSim = state.activeSimulations[unitId] || {
      unitId,
      status: 'IDLE',
      progress: 0.0,
      speedKmH: 0,
      distanceRemainingKm: 3.4,
      etaMinutes: 6,
      assignedIncidentId: incidentId || 'INC-408',
    };

    const targetIncident = incidentId || currentSim.assignedIncidentId || 'INC-408';

    // 1. Update simulation state to DISPATCHING -> EN_ROUTE
    set(s => ({
      selectedVehicleId: unitId,
      selectedIncidentId: targetIncident,
      activeSimulations: {
        ...s.activeSimulations,
        [unitId]: {
          ...currentSim,
          status: 'EN_ROUTE',
          progress: 0.02,
          speedKmH: 58,
          distanceRemainingKm: 3.4,
          etaMinutes: 6,
          assignedIncidentId: targetIncident,
        },
      },
    }));

    // 2. Add in-app notification toast
    get().addNotification({
      title: 'RESOURCE DISPATCHED // OPTIMISTIC LOCK',
      message: `${unitId} deployed to ${targetIncident}. Route cleared with priority Code-3 beacons.`,
      type: 'dispatch',
    });

    // 3. Add to timeline
    get().addTimelineEvent({
      title: `${unitId} Dispatched`,
      unitId,
      incidentId: targetIncident,
      type: 'DISPATCH',
      description: `Optimistic conditional claim verified in DynamoDB. Inbound to ${targetIncident}.`,
    });
  },

  updateVehicleSimulation: (unitId, updates) => {
    set(state => {
      const existing = state.activeSimulations[unitId];
      if (!existing) return state;
      return {
        activeSimulations: {
          ...state.activeSimulations,
          [unitId]: { ...existing, ...updates },
        },
      };
    });
  },

  completeVehicleArrival: (unitId: string) => {
    const sim = get().activeSimulations[unitId];
    if (!sim) return;

    set(state => ({
      activeSimulations: {
        ...state.activeSimulations,
        [unitId]: {
          ...sim,
          status: 'ON_SCENE',
          progress: 1.0,
          speedKmH: 0,
          distanceRemainingKm: 0.0,
          etaMinutes: 0,
        },
      },
    }));

    // Trigger arrival celebration toast
    get().addNotification({
      title: `✓ ${unitId} ON SCENE`,
      message: `Unit reached ${sim.assignedIncidentId}. Primary containment & victim stabilization initiated.`,
      type: 'success',
    });

    // Add to timeline
    get().addTimelineEvent({
      title: `${unitId} Arrived On Scene`,
      unitId,
      incidentId: sim.assignedIncidentId,
      type: 'ARRIVAL',
      description: `Arrival verified via GPS telemetry beacon. Status transitioned to ON_SCENE.`,
    });
  },

  resetVehicleSimulation: (unitId: string) => {
    set(state => {
      const existing = state.activeSimulations[unitId];
      if (!existing) return state;
      return {
        activeSimulations: {
          ...state.activeSimulations,
          [unitId]: {
            ...existing,
            status: 'IDLE',
            progress: 0.0,
            speedKmH: 0,
            distanceRemainingKm: 3.4,
            etaMinutes: 6,
          },
        },
      };
    });
  },

  // Dynamic Timeline & Operations
  addTimelineEvent: event => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC`;
    const newEvent: DynamicTimelineEvent = {
      id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: timeStr,
      ...event,
    };
    set(state => ({
      timelineEvents: [newEvent, ...state.timelineEvents].slice(0, 30),
    }));
  },

  createOperation: opData => {
    const newOp: DisasterOperation = {
      id: `OP-${Date.now().toString().slice(-4)}`,
      ...opData,
      status: 'ACTIVE',
    };

    set(state => ({
      operations: [newOp, ...state.operations],
      isCreateOpModalOpen: false,
    }));

    // Notification toast
    get().addNotification({
      title: 'NEW DISASTER OPERATION CREATED',
      message: `Operation "${opData.name}" activated for ${opData.location}. Assigned: ${opData.assignedResources.join(', ')}.`,
      type: 'success',
    });

    // Timeline event
    get().addTimelineEvent({
      title: `Operation Activated: ${opData.name}`,
      unitId: opData.assignedResources[0] || 'COMMAND',
      incidentId: opData.incidentType,
      type: 'OPERATION',
      description: `Multi-agency coordination initiated. Location: ${opData.location}. Priority: ${opData.priority}.`,
    });
  },

  setCreateOpModalOpen: open => set({ isCreateOpModalOpen: open }),
}));

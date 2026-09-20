import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore, type NavTab } from './stores/useAppStore';
import { SyncStateBadge, ResourceStateBadge } from './components/StateBadge';
import { SidebarDock } from './components/SidebarDock';
import { MapPlaceholder } from './components/MapPlaceholder';
import { VehicleTelemetryCard, type VehicleTelemetryData } from './components/VehicleTelemetryCard';
import { VehicleSchematicCard } from './components/VehicleSchematicCard';
import { LoadPlanningCard } from './components/LoadPlanningCard';
import { DispatchQueue } from './components/DispatchQueue';
import { FreightScheduleTimeline } from './components/FreightScheduleTimeline';
import { EmergencyIntakeDrawer } from './components/EmergencyIntakeDrawer';
import { RequestsCenterView } from './components/RequestsCenterView';
import { AnalyticsToolsView } from './components/AnalyticsToolsView';
import { SystemHealthView } from './components/SystemHealthView';
import { ConflictAdjudicationView } from './components/ConflictAdjudicationView';
import { SyncCenterView } from './components/SyncCenterView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { ResourceDetailsModal, type ResourceDetailsData } from './components/ResourceDetailsModal';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { CreateOperationModal } from './components/CreateOperationModal';
import type { ResourceStatus, UserRole } from '@resqsync/domain';
import {
  Bell,
  ChevronDown,
  Filter,
  Search,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

const queryClient = new QueryClient();

// Initial demo ambulance representation conforming to domain specification
const INITIAL_AMBULANCES: Array<{
  id: string;
  callSign: string;
  type: string;
  status: ResourceStatus;
  location: string;
  version: number;
  agencyId?: string;
  assignedActorId?: string | null;
  assignedIncidentId?: string | null;
}> = [
  {
    id: 'AMB-A12',
    callSign: 'Medic-12',
    type: 'ALS Ambulance',
    status: 'HUMAN_REVIEW',
    location: 'Station 4, Central District',
    version: 2,
    agencyId: 'AGY-METRO-EMS',
  },
  {
    id: 'AMB-A07',
    callSign: 'Medic-07',
    type: 'BLS Ambulance',
    status: 'PENDING_SYNC',
    location: 'Staging Sector North',
    version: 2,
    agencyId: 'AGY-METRO-EMS',
  },
  {
    id: 'AMB-A19',
    callSign: 'Rescue-19',
    type: 'MICU Ambulance',
    status: 'CONFLICT',
    location: 'Trauma Center Bay 3',
    version: 3,
    agencyId: 'AGY-COUNTY-FIRE',
  },
  {
    id: 'AMB-B03',
    callSign: 'Medic-03',
    type: 'ALS Ambulance',
    status: 'CLAIMED',
    location: 'District 2 Hospital Route',
    version: 4,
    agencyId: 'AGY-METRO-EMS',
    assignedActorId: 'USR-DISPATCHER-01',
  },
  {
    id: 'AMB-C08',
    callSign: 'Rescue-08',
    type: 'ALS Ambulance',
    status: 'DISPATCHED',
    location: 'En route - Incident #408',
    version: 5,
    agencyId: 'AGY-COUNTY-FIRE',
    assignedIncidentId: 'INC-SFO-882',
  },
  {
    id: 'AMB-D15',
    callSign: 'Medic-15',
    type: 'BLS Ambulance',
    status: 'AVAILABLE',
    location: 'Staging Zone West',
    version: 1,
    agencyId: 'AGY-METRO-EMS',
  },
];

// Telemetry profiles for selected emergency response units
const UNIT_TELEMETRY: Record<string, VehicleTelemetryData> = {
  'AMB-A12': {
    id: 'AMB-A12',
    callSign: 'Unit-12',
    model: 'Type-1 Heavy ALS Trauma Unit · 2024',
    status: 'En Route',
    origin: 'Station 4, Central District',
    destination: 'Market St. Collapse (INC-882)',
    totalDistance: '6.4 km',
    progressPct: 72,
    eta: '~4 min',
    distanceRemaining: '1.8 km',
    speed: 62,
    speedStatus: 'High Priority',
    fuelPct: 78,
    fuelVolume: '18.2 gal',
    temperature: '68°F',
    alertMessage: 'Code-3 Priority Response: Lights & Sirens Authorized',
  },
  'AMB-C08': {
    id: 'AMB-C08',
    callSign: 'Rescue-08',
    model: 'Heavy Rescue Extraction Vehicle · ALS',
    status: 'On Scene',
    origin: 'Central Fire HQ',
    destination: 'Market St. Collapse (INC-882)',
    totalDistance: '8.2 km',
    progressPct: 92,
    eta: 'On Scene',
    distanceRemaining: '0.2 km',
    speed: 0,
    speedStatus: 'On Scene',
    fuelPct: 84,
    fuelVolume: '22.0 gal',
    temperature: '70°F',
    alertMessage: 'Active Victim Extraction in Progress',
  },
  'ENG-03': {
    id: 'ENG-03',
    callSign: 'Engine-03',
    model: 'Pierce Enforcer Hazmat Pumper · 2023',
    status: 'En Route',
    origin: 'Station 9, Industrial',
    destination: 'Chemical Depot (INC-408)',
    totalDistance: '12.0 km',
    progressPct: 58,
    eta: '~6 min',
    distanceRemaining: '3.4 km',
    speed: 54,
    speedStatus: 'High Priority',
    fuelPct: 68,
    fuelVolume: '34.5 gal',
    temperature: '72°F',
    alertMessage: 'Level-2 Hazmat Containment Gear Deployed',
  },
  'AMB-A07': {
    id: 'AMB-A07',
    callSign: 'Medic-07',
    model: 'Ford F-350 Super Duty BLS Medical Transport',
    status: 'Staging',
    origin: 'Trauma Bay',
    destination: 'Staging North (INC-204)',
    totalDistance: '14.5 km',
    progressPct: 35,
    eta: '~8 min',
    distanceRemaining: '4.1 km',
    speed: 45,
    speedStatus: 'Standard',
    fuelPct: 91,
    fuelVolume: '24.2 gal',
    temperature: '66°F',
  },
};

// Incident intelligence definitions
interface IncidentDetail {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'URGENT' | 'STANDARD';
  location: string;
  detectedTime: string;
  affectedPopulation: string;
  assignedUnits: string[];
  threatAssessment: string;
  status: string;
}

const INCIDENT_DETAILS: Record<string, IncidentDetail> = {
  'INC-882': {
    id: 'INC-882',
    title: 'Market St. Structural Collapse',
    severity: 'CRITICAL',
    location: 'Sector 4 Core · Market St. & 4th Ave',
    detectedTime: '14:28:12 UTC (16m ago)',
    affectedPopulation: '6 Victims Reported (2 Extracted, 4 Trapped)',
    assignedUnits: ['MEDIC-12 (AMB-A12)', 'RESCUE-08 (AMB-C08)', 'RESCUE-19 (AMB-A19)'],
    threatAssessment: 'Catastrophic Shoring Collapse Risk · High Secondary Shift Danger',
    status: 'ACTIVE EXTRACTION',
  },
  'INC-408': {
    id: 'INC-408',
    title: 'Industrial Chemical Depot Vapor Leak',
    severity: 'URGENT',
    location: 'Sector 2 Depot · 1200 Industrial Parkway',
    detectedTime: '14:41:05 UTC (21m ago)',
    affectedPopulation: 'Depot Staff Evacuated · 500m Perimeter Secured',
    assignedUnits: ['ENGINE-03 (ENG-03)'],
    threatAssessment: 'Toxic Vapor Plume Dispersion · Containment Foam Inbound',
    status: 'CONTAINMENT IN PROGRESS',
  },
  'INC-204': {
    id: 'INC-204',
    title: 'Flash Flood Evacuation & River Crest',
    severity: 'STANDARD',
    location: 'Sector 1 Lowland River Basin',
    detectedTime: '13:55:00 UTC (1h ago)',
    affectedPopulation: '45 Residents Staged for Transport to Shelter',
    assignedUnits: ['MEDIC-07 (AMB-A07)'],
    threatAssessment: 'Water Level Rising 0.4m/hr · Levee Intact',
    status: 'EVACUATION STAGING',
  },
};

function AppContent() {
  const {
    currentTab,
    setCurrentTab,
    syncStatus,
    setSyncStatus,
    userRole,
    setUserRole,
    addNotification,
    dispatchVehicle,
    activeSimulations,
    notifications,
    isNotificationsPanelOpen,
    setNotificationsPanelOpen,
    setActiveFilter,
    setSearchQuery: setStoreSearchQuery,
  } = useAppStore();

  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ENG-03');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceDetailsData | null>(null);

  // Filter and Toggle states from Haulix Reference
  const [activeFilterPill, setActiveFilterPill] = useState<string>('All');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [showTelemetryOverlay, setShowTelemetryOverlay] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rightPanelMode, setRightPanelMode] = useState<'unit' | 'incident'>('unit');

  // Interactive 10-Step Choreography Handler for Selecting Incident
  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setRightPanelMode('incident');
    const inc = INCIDENT_DETAILS[incidentId];
    if (inc && inc.assignedUnits.length > 0) {
      if (incidentId === 'INC-882') setSelectedUnitId('AMB-A12');
      if (incidentId === 'INC-408') setSelectedUnitId('ENG-03');
      if (incidentId === 'INC-204') setSelectedUnitId('AMB-A07');
    }
  };

  // Interactive 10-Step Choreography Handler for Selecting Response Unit
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setRightPanelMode('unit');
    if (unitId === 'AMB-A12' || unitId === 'AMB-C08' || unitId === 'AMB-A19') {
      setSelectedIncidentId('INC-882');
    } else if (unitId === 'ENG-03') {
      setSelectedIncidentId('INC-408');
    } else if (unitId === 'AMB-A07') {
      setSelectedIncidentId('INC-204');
    }
  };

  const handleConflictResolved = (winner: 'ALPHA' | 'BRAVO') => {
    setAmbulances(prev =>
      prev.map(amb => {
        if (amb.id === 'AMB-A12') {
          return {
            ...amb,
            status: 'CLAIMED',
            version: 3,
            location:
              winner === 'ALPHA'
                ? 'Sector 4 Triage Site (Assigned to Alpha)'
                : 'Central Hospital Route (Assigned to Bravo)',
          };
        }
        return amb;
      })
    );
  };

  const handleClaimResource = (resourceId: string) => {
    setAmbulances(prev =>
      prev.map(amb =>
        amb.id === resourceId
          ? {
              ...amb,
              status: syncStatus === 'ONLINE' ? 'CLAIMED' : 'PENDING_SYNC',
              version: amb.version + 1,
            }
          : amb
      )
    );
    setSelectedResource(null);
    const targetInc = selectedIncidentId || (resourceId === 'ENG-03' ? 'INC-408' : 'INC-882');
    dispatchVehicle(resourceId, targetInc);
  };

  const handleDispatchFromIntake = (data: {
    unitType: string;
    incidentType: string;
    problemNotes: string;
  }) => {
    const target = ambulances.find(a => a.status === 'AVAILABLE') || ambulances[0];
    if (target) {
      setAmbulances(prev =>
        prev.map(amb =>
          amb.id === target.id
            ? {
                ...amb,
                status: 'DISPATCHED',
                version: amb.version + 1,
                location: `Dispatched to ${data.incidentType}: ${data.problemNotes.slice(0, 24)}...`,
              }
            : amb
        )
      );
      dispatchVehicle(target.id, 'INC-882');
      addNotification({
        title: 'INTAKE DISPATCH COMMITTED',
        message: `Dispatched ${data.unitType} unit (${target.callSign}) to ${data.incidentType}. Conditional claim committed to DynamoDB!`,
        type: 'dispatch',
      });
    }
  };

  // Real-time dynamic telemetry linked to active simulation
  const sim = activeSimulations[selectedUnitId];
  const baseTelemetry = UNIT_TELEMETRY[selectedUnitId] || UNIT_TELEMETRY['ENG-03'] || UNIT_TELEMETRY['AMB-A12'];
  const currentTelemetry: VehicleTelemetryData = sim
    ? {
        ...baseTelemetry,
        status:
          sim.status === 'ON_SCENE'
            ? 'On Scene'
            : sim.status === 'ARRIVING'
            ? 'Arriving'
            : sim.status === 'EN_ROUTE'
            ? 'En Route'
            : baseTelemetry.status,
        progressPct: Math.round(sim.progress * 100),
        eta: sim.status === 'ON_SCENE' ? 'Arrived' : `~${sim.etaMinutes} min`,
        distanceRemaining: `${sim.distanceRemainingKm} km`,
        speed: sim.speedKmH,
      }
    : baseTelemetry;

  const isUnitDispatched = sim
    ? sim.status === 'EN_ROUTE' || sim.status === 'ARRIVING' || sim.status === 'ON_SCENE'
    : false;

  const activeIncident = selectedIncidentId ? INCIDENT_DETAILS[selectedIncidentId] : INCIDENT_DETAILS['INC-882'];

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* 1. Universal Floating Left Pill Dock (Haulix Aesthetic, ResQSync Brand) */}
      <SidebarDock
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab as NavTab)}
        activeConflictCount={ambulances.filter(a => a.status === 'HUMAN_REVIEW' || a.status === 'CONFLICT').length}
        offlineCount={syncStatus === 'OFFLINE' ? 2 : 0}
      />

      {/* Main Layout Container offset by the left dock */}
      <div className="flex-1 flex flex-col pl-20 pr-4 py-3 max-w-[1740px] w-full mx-auto space-y-4">
        {/* 2. Top Universal Operations Header (ResQSync Command Authority) */}
        <header className="flex flex-wrap items-center justify-between gap-4 py-2 px-1">
          {/* Left Title & Brand */}
          <div className="flex items-center gap-3">
            {/* ResQSync Stylized Monogram */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 border border-cyan-400/50 flex items-center justify-center font-black text-black text-base shadow-[0_0_18px_rgba(34,211,238,0.6)]">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-white uppercase font-sans">
                  ResQSync
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold">
                  COMMAND // CLOUD LIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Monday, April 8, 2026 · Offline-First Disaster Resource Coordination · Authoritative Consistency Guarantee
              </p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="relative w-80 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setStoreSearchQuery(e.target.value);
              }}
              placeholder="Search incidents, response units, triage sectors, dispatches..."
              className="w-full bg-[#14161b] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-500 shadow-inner"
            />
          </div>

          {/* Right Controls: Filters, Switches, RBAC, Sync State */}
          <div className="flex items-center gap-3">
            {/* Quick toggles */}
            <div className="hidden lg:flex items-center gap-4 bg-[#141518]/90 border border-white/10 px-3 py-1.5 rounded-2xl text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-zinc-300 font-medium">Show routes</span>
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={e => setShowRoutes(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-zinc-300 font-medium">Show alerts</span>
                <input
                  type="checkbox"
                  checked={showAlerts}
                  onChange={e => setShowAlerts(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer rounded"
                />
              </label>
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-1 bg-[#16171b] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-zinc-300 cursor-pointer hover:bg-white/5 transition-colors">
              <span>All Sectors (Metro)</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-[#16171b] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-zinc-300 cursor-pointer hover:bg-white/5 transition-colors">
              <span>Active Shift (12h)</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>

            {/* Network Sync Toggle */}
            <div className="flex items-center gap-2 bg-[#16171b] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-zinc-400">Sync:</span>
              <SyncStateBadge status={syncStatus} />
              <button
                onClick={() => setSyncStatus(syncStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
                className="text-[11px] underline text-cyan-400 hover:text-cyan-300 ml-1 font-mono"
                title="Toggle simulated network connectivity state"
              >
                (toggle)
              </button>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 bg-[#16171b] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-zinc-400">Role:</span>
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-cyan-400 outline-none cursor-pointer"
              >
                <option value="DISPATCHER" className="bg-zinc-900 text-white">DISPATCHER</option>
                <option value="RESPONDER" className="bg-zinc-900 text-white">RESPONDER</option>
                <option value="SUPERVISOR" className="bg-zinc-900 text-white">SUPERVISOR</option>
                <option value="ADMINISTRATOR" className="bg-zinc-900 text-white">ADMINISTRATOR</option>
              </select>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsPanelOpen(!isNotificationsPanelOpen)}
              className="relative w-9 h-9 rounded-xl bg-[#16171b] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Notifications & Live Dispatch Feed"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" />
              )}
            </button>

            {/* Dispatch Commander Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 border border-white/20 flex items-center justify-center font-bold text-xs text-white shadow-md cursor-pointer" title="Commander Rivera (CR)">
              CR
            </div>
          </div>
        </header>

        {/* 3. Filter Pills Sub-Bar (Haulix Style) */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {[
              { id: 'All', label: 'All Incidents', count: 6 },
              { id: 'Critical', label: 'Critical', count: 2 },
              { id: 'Urgent', label: 'Urgent', count: 2 },
              { id: 'En Route', label: 'En Route', count: 3 },
              { id: 'On Scene', label: 'On Scene', count: 1 },
              { id: 'Staging', label: 'Staging', count: 1 },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveFilterPill(pill.id);
                  setActiveFilter(pill.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilterPill === pill.id
                    ? 'bg-zinc-700/90 text-white shadow-md font-semibold'
                    : 'bg-[#141518]/90 text-zinc-400 border border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeFilterPill === pill.id
                      ? 'bg-black/40 text-white'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            ))}

            <button className="w-8 h-8 rounded-full bg-[#141518]/90 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>State Engine:</span>
            <span className="text-cyan-300 font-bold">ResQSync-Deterministic v6</span>
          </div>
        </div>

        {/* 4. Main Body Content Based on Active Tab */}
        <main className="flex-1 w-full">
          {/* TAB 1: Command Dashboard (3-Column Spatial Grid + Bottom Mission Timeline) */}
          {currentTab === 'dispatch' && (
            <div className="space-y-4">
              {/* 3-Column Spatial Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column: Emergency Response & Incident Queue (Haulix Style) */}
                <div className="lg:col-span-3 h-[530px]">
                  <DispatchQueue
                    selectedUnitId={selectedUnitId}
                    onSelectUnit={handleSelectUnit}
                    onSelectIncident={handleSelectIncident}
                  />
                </div>

                {/* Center Column: Tactical Command Map (Haulix Style with Emergency Grammar) */}
                <div className="lg:col-span-6 h-[530px] relative rounded-3xl overflow-hidden group">
                  <MapPlaceholder
                    className="h-full"
                    selectedVehicleId={selectedUnitId}
                    selectedIncidentId={selectedIncidentId}
                    onSelectVehicle={handleSelectUnit}
                    onSelectIncident={handleSelectIncident}
                    showRoutes={showRoutes}
                    showAlerts={showAlerts}
                  />

                  {/* Toggle Telemetry Dials HUD Button */}
                  <div className="absolute bottom-4 left-4 z-30">
                    <button
                      onClick={() => setShowTelemetryOverlay(v => !v)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#141518]/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold shadow-lg shadow-cyan-500/10 flex items-center gap-1.5 transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{showTelemetryOverlay ? 'Hide Telemetry Dials' : 'Live Speed & Fuel Dials'}</span>
                    </button>
                  </div>

                  {/* Floating Vehicle Telemetry Dials HUD */}
                  {showTelemetryOverlay && (
                    <div className="absolute top-4 left-4 z-40 max-w-[390px] animate-in fade-in zoom-in-95 duration-200">
                      <VehicleTelemetryCard
                        vehicle={currentTelemetry}
                        onClose={() => setShowTelemetryOverlay(false)}
                        canClaim={true}
                        onClaim={handleClaimResource}
                        isDispatched={isUnitDispatched}
                      />
                    </div>
                  )}
                </div>

                {/* Right Column: Contextual Emergency Detail & Unit Blueprint */}
                <div className="lg:col-span-3 h-[530px] flex flex-col gap-3 overflow-y-auto pr-0.5">
                  {/* Mode Toggle Header: Unit vs Incident */}
                  <div className="flex items-center bg-[#141518]/90 p-1 rounded-2xl border border-white/10 text-xs">
                    <button
                      onClick={() => setRightPanelMode('unit')}
                      className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                        rightPanelMode === 'unit'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Unit Blueprint
                    </button>
                    <button
                      onClick={() => setRightPanelMode('incident')}
                      className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                        rightPanelMode === 'incident'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Incident Intel
                    </button>
                  </div>

                  {/* Panel Content based on RightPanelMode */}
                  {rightPanelMode === 'unit' ? (
                    <VehicleSchematicCard
                      unitId={currentTelemetry.id}
                      callSign={currentTelemetry.callSign}
                      unitType={currentTelemetry.model}
                      crewCapacity="3 Paramedics (ALS)"
                      equipmentTier="ALS Tier-1 Intensive"
                      fuelRange={`${currentTelemetry.fuelPct}% Fuel (${currentTelemetry.fuelVolume})`}
                      onDispatch={() => handleClaimResource(currentTelemetry.id)}
                      isDispatched={isUnitDispatched}
                    />
                  ) : (
                    /* Incident Intelligence Card */
                    <div className="bg-[#141518]/95 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-4 text-white shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <h4 className="font-bold text-sm text-zinc-100 font-mono">
                            {activeIncident.id}
                          </h4>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {activeIncident.severity}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-semibold text-zinc-100">{activeIncident.title}</h5>
                        <p className="text-[11px] text-zinc-400 font-mono">{activeIncident.location}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                          Affected Population
                        </div>
                        <div className="text-zinc-200 font-medium text-[11px]">
                          {activeIncident.affectedPopulation}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                          Threat Assessment
                        </div>
                        <div className="text-rose-300 font-medium text-[11px]">
                          {activeIncident.threatAssessment}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] text-zinc-400 font-semibold uppercase">
                          Assigned Responders
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeIncident.assignedUnits.map((u, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            addNotification({
                              title: `ESCALATION: ${activeIncident.id}`,
                              message: `Mass casualty protocol escalated for ${activeIncident.title}. Regional trauma centers and HAZMAT teams placed on high standby.`,
                              type: 'critical',
                            });
                          }}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                        >
                          Escalate Protocol
                        </button>
                        <button
                          onClick={() => {
                            addNotification({
                              title: `MUTUAL-AID REQUESTED: ${activeIncident.id}`,
                              message: `Additional mutual-aid ALS units and heavy rescue assigned to ${activeIncident.location}. Inter-agency coordination engaged.`,
                              type: 'dispatch',
                            });
                          }}
                          className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
                        >
                          Request Units
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Medical Equipment Readiness Manifest */}
                  <LoadPlanningCard />
                </div>
              </div>

              {/* Bottom Row: Operational Mission Schedule Gantt Timeline (Haulix Reference 2) */}
              <FreightScheduleTimeline />

              {/* 5. Authoritative Ambulance Allocation Fleet & Unit Registry (Accessible Fleet Section) */}
              <section aria-label="Ambulance Allocation Fleet" className="bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
                      Ambulance Allocation Fleet
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Deterministic resource registry with optimistic concurrency locking & multi-agency sync
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-semibold">
                    {ambulances.length} Units Online
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  {ambulances.map(unit => (
                    <div
                      key={unit.id}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-3.5 space-y-3 transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.01]"
                      onClick={() => setSelectedResource(unit)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedResource(unit);
                        }
                      }}
                      aria-label={`View unit details for ${unit.callSign}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-sm text-white font-mono block">
                            {unit.callSign}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {unit.id} · {unit.type}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          v{unit.version}
                        </span>
                      </div>

                      <div>
                        <ResourceStateBadge status={unit.status} />
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        {unit.location}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <button
                          disabled={unit.status !== 'AVAILABLE'}
                          onClick={e => {
                            e.stopPropagation();
                            handleClaimResource(unit.id);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            unit.status === 'AVAILABLE'
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {unit.status === 'AVAILABLE' ? 'Claim Resource' : 'Unavailable'}
                        </button>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: Tactical Operations Unit HUD */}
          {currentTab === 'operations' && (
            <div className="relative h-[680px] w-full rounded-3xl overflow-hidden">
              <MapPlaceholder
                className="h-full w-full"
                selectedVehicleId={selectedUnitId}
                selectedIncidentId={selectedIncidentId}
                onSelectVehicle={handleSelectUnit}
                onSelectIncident={handleSelectIncident}
                showRoutes={showRoutes}
                showAlerts={showAlerts}
              />

              {/* Floating Emergency Telemetry Card with Speedometer & Liquid Fuel Wave Gauges */}
              <div className="absolute top-6 left-6 z-30">
                <VehicleTelemetryCard
                  vehicle={currentTelemetry}
                  canClaim={true}
                  onClaim={handleClaimResource}
                  isDispatched={isUnitDispatched}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Emergency 911 Intake & Request Triage Center */}
          {currentTab === 'requests' && (
            <div className="space-y-6">
              <div className="relative h-[500px] w-full rounded-3xl overflow-hidden">
                <MapPlaceholder
                  className="h-full w-full"
                  selectedVehicleId={selectedUnitId}
                  selectedIncidentId={selectedIncidentId}
                  onSelectVehicle={handleSelectUnit}
                  onSelectIncident={handleSelectIncident}
                  showRoutes={showRoutes}
                  showAlerts={true}
                  showEmergencyCall={true}
                />

                {/* Right Slide-Over Emergency Intake Drawer (Haulix Reference 3) */}
                <div className="absolute top-6 right-6 z-30">
                  <EmergencyIntakeDrawer
                    onDispatch={handleDispatchFromIntake}
                  />
                </div>
              </div>

              {/* Authoritative Requests Center View with SageMaker AI Dispatch Assistant */}
              <section aria-label="Emergency Request Intake">
                <RequestsCenterView
                  onDispatchResource={(_requestId, resourceId) => {
                    handleClaimResource(resourceId);
                  }}
                />
              </section>
            </div>
          )}

          {/* TAB 4: Tactical Crisis Map */}
          {currentTab === 'crisis_map' && (
            <div className="relative h-[680px] w-full rounded-3xl overflow-hidden">
              <MapPlaceholder
                className="h-full w-full"
                selectedVehicleId={selectedUnitId}
                selectedIncidentId={selectedIncidentId}
                onSelectVehicle={handleSelectUnit}
                onSelectIncident={handleSelectIncident}
                showRoutes={true}
                showAlerts={true}
              />
            </div>
          )}

          {/* TAB 5: System Health & Analytical Tools (Haulix Reference 4 + AWS Telemetry) */}
          {currentTab === 'system_health' && (
            <div className="space-y-6">
              <AnalyticsToolsView />
              <section aria-label="System Health Telemetry">
                <SystemHealthView />
              </section>
            </div>
          )}

          {/* TAB 6: Conflict Adjudication Console */}
          {currentTab === 'conflicts' && (
            <section aria-label="Conflict Adjudication Console">
              <ConflictAdjudicationView
                userRole={userRole}
                onResolved={handleConflictResolved}
              />
            </section>
          )}

          {/* TAB 7: Offline Sync Engine & SQS Buffer */}
          {currentTab === 'sync_center' && (
            <section aria-label="Sync Center Engine">
              <SyncCenterView
                syncStatus={syncStatus}
                onToggleSync={setSyncStatus}
              />
            </section>
          )}

          {/* TAB 8: Audit Log & Incident Replay */}
          {currentTab === 'audit' && (
            <section aria-label="Audit and Replay">
              <AuditLogView />
            </section>
          )}

          {/* TAB 9: System Settings & RBAC */}
          {currentTab === 'settings' && (
            <section aria-label="System Settings">
              <SettingsView onResetDemo={() => setAmbulances(INITIAL_AMBULANCES)} />
            </section>
          )}
        </main>

        {/* Resource Details Modal */}
        {selectedResource && (
          <ResourceDetailsModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onClaim={handleClaimResource}
            isOnline={syncStatus === 'ONLINE'}
          />
        )}

        {/* Global Multi-Agency Operation Creation Modal */}
        <CreateOperationModal />

        {/* In-App Notifications Toast Stack & History Drawer */}
        <NotificationToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

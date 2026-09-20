import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './stores/useAppStore';
import { ResourceStateBadge, SyncStateBadge } from './components/StateBadge';
import { MapPlaceholder } from './components/MapPlaceholder';
import { ConflictAdjudicationView } from './components/ConflictAdjudicationView';
import { SystemHealthView } from './components/SystemHealthView';
import type { ResourceStatus, UserRole } from '@resqsync/domain';
import {
  Radio,
  Ambulance,
  AlertOctagon,
  RefreshCw,
  LayoutDashboard,
  Layers,
  History,
  Info,
  Activity,
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
}> = [
  {
    id: 'AMB-A12',
    callSign: 'Medic-12',
    type: 'ALS Ambulance',
    status: 'HUMAN_REVIEW',
    location: 'Station 4, Central District',
    version: 2,
  },
  {
    id: 'AMB-A07',
    callSign: 'Medic-07',
    type: 'BLS Ambulance',
    status: 'PENDING_SYNC',
    location: 'Staging Sector North',
    version: 2,
  },
  {
    id: 'AMB-A19',
    callSign: 'Rescue-19',
    type: 'MICU Ambulance',
    status: 'CONFLICT',
    location: 'Trauma Center Bay 3',
    version: 3,
  },
  {
    id: 'AMB-B03',
    callSign: 'Medic-03',
    type: 'ALS Ambulance',
    status: 'CLAIMED',
    location: 'District 2 Hospital Route',
    version: 4,
  },
  {
    id: 'AMB-C08',
    callSign: 'Rescue-08',
    type: 'ALS Ambulance',
    status: 'DISPATCHED',
    location: 'En route - Incident #408',
    version: 5,
  },
  {
    id: 'AMB-D15',
    callSign: 'Medic-15',
    type: 'BLS Ambulance',
    status: 'AVAILABLE',
    location: 'Staging Zone West',
    version: 1,
  },
];

function AppContent() {
  const { currentTab, setCurrentTab, syncStatus, setSyncStatus, userRole, setUserRole } =
    useAppStore();

  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);

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
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600/20 text-rose-400 p-2 rounded-lg border border-rose-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">ResQSync</h1>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  COMMAND // M1 - M6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                One resource. One shared state. Every responder.
              </p>
            </div>
          </div>

          {/* System Telemetry & Role Bar */}
          <div className="flex items-center gap-3">
            {/* Network Sync State */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400">Network:</span>
              <SyncStateBadge status={syncStatus} />
              <button
                onClick={() => setSyncStatus(syncStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
                className="text-xs underline text-slate-400 hover:text-slate-200 ml-1"
                title="Toggle simulated network state"
              >
                (toggle)
              </button>
            </div>

            {/* Role Selector for RBAC demonstration */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400">Role:</span>
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value as UserRole)}
                className="bg-slate-900 text-xs font-semibold text-rose-300 border border-slate-700 rounded px-2 py-0.5 outline-none"
              >
                <option value="DISPATCHER">DISPATCHER</option>
                <option value="RESPONDER">RESPONDER</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="ADMINISTRATOR">ADMINISTRATOR</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setCurrentTab('dispatch')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'dispatch'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dispatch Board</span>
          </button>
          <button
            onClick={() => setCurrentTab('resources')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'resources'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>Resource Registry</span>
          </button>
          <button
            onClick={() => setCurrentTab('conflicts')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'conflicts'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Conflicts & Adjudication</span>
            <span className="bg-rose-900 text-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              1 Active
            </span>
          </button>
          <button
            onClick={() => setCurrentTab('sync_center')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'sync_center'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Center</span>
          </button>
          <button
            onClick={() => setCurrentTab('audit')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'audit'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit & Replay</span>
          </button>
          <button
            onClick={() => setCurrentTab('system_health')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentTab === 'system_health'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Health</span>
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Offline Disclaimer Banner */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200 leading-relaxed space-y-1">
            <p className="font-semibold text-blue-100">
              Authoritative Consistency Guarantee:
            </p>
            <p>
              Offline browser state is <strong>never globally authoritative</strong>. Local claims are preserved in IndexedDB as verifiable evidence with <code>client_event_id</code> and synchronized deterministically with DynamoDB upon reconnect.
            </p>
          </div>
        </div>

        {currentTab === 'conflicts' ? (
          <section aria-label="Conflict Adjudication Console">
            <ConflictAdjudicationView
              userRole={userRole}
              onResolved={handleConflictResolved}
            />
          </section>
        ) : currentTab === 'system_health' ? (
          <section aria-label="System Health Telemetry">
            <SystemHealthView />
          </section>
        ) : (
          <>
            {/* Map Telemetry Component */}
            <section aria-label="Incident Grid Telemetry">
              <MapPlaceholder className="h-72 w-full" />
            </section>

            {/* Ambulance Allocation Grid */}
            <section aria-label="Ambulance Fleet Status" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Ambulance Allocation Fleet ({ambulances.length} Units Tracked)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  DynamoDB Table: ResQSync-Authoritative
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ambulances.map(unit => (
                  <div
                    key={unit.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 space-y-3 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                          <span>{unit.callSign}</span>
                          <span className="text-xs font-normal text-slate-400 font-mono">({unit.id})</span>
                        </h3>
                        <p className="text-xs text-slate-400">{unit.type}</p>
                      </div>
                      <ResourceStateBadge status={unit.status} />
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-medium text-right truncate ml-2">{unit.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Authoritative Version:</span>
                        <span className="font-mono text-slate-300">v{unit.version}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        disabled={unit.status !== 'AVAILABLE'}
                        className={`text-xs px-3 py-1.5 rounded font-semibold transition-colors ${
                          unit.status === 'AVAILABLE'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {unit.status === 'AVAILABLE' ? 'Claim Resource' : 'Unavailable'}
                      </button>
                      <span className="text-[11px] text-slate-500">
                        {unit.status === 'PENDING_SYNC' ? 'Queued in IndexedDB' : 'Synchronized'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-3 px-4 text-center text-xs text-slate-500">
        ResQSync // Command — Offline-First Disaster Resource Coordination — Milestone 1 - M6
      </footer>
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

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './stores/useAppStore';
import { ResourceStateBadge, SyncStateBadge } from './components/StateBadge';
import { MapPlaceholder } from './components/MapPlaceholder';
import { ConflictAdjudicationView } from './components/ConflictAdjudicationView';
import { Radio, Ambulance, AlertOctagon, RefreshCw, LayoutDashboard, Layers, History, Info, } from 'lucide-react';
const queryClient = new QueryClient();
// Initial demo ambulance representation conforming to domain specification
const INITIAL_AMBULANCES = [
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
    const { currentTab, setCurrentTab, syncStatus, setSyncStatus, userRole, setUserRole } = useAppStore();
    const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);
    const handleConflictResolved = (winner) => {
        setAmbulances(prev => prev.map(amb => {
            if (amb.id === 'AMB-A12') {
                return {
                    ...amb,
                    status: 'CLAIMED',
                    version: 3,
                    location: winner === 'ALPHA'
                        ? 'Sector 4 Triage Site (Assigned to Alpha)'
                        : 'Central Hospital Route (Assigned to Bravo)',
                };
            }
            return amb;
        }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans", children: [_jsx("header", { className: "border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3", children: _jsxs("div", { className: "max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-rose-600/20 text-rose-400 p-2 rounded-lg border border-rose-500/30", children: _jsx(Radio, { className: "w-5 h-5 animate-pulse" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "text-base font-bold tracking-tight text-white", children: "ResQSync" }), _jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono", children: "COMMAND // M1 - M6" })] }), _jsx("p", { className: "text-xs text-slate-400", children: "One resource. One shared state. Every responder." })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700", children: [_jsx("span", { className: "text-xs text-slate-400", children: "Network:" }), _jsx(SyncStateBadge, { status: syncStatus }), _jsx("button", { onClick: () => setSyncStatus(syncStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE'), className: "text-xs underline text-slate-400 hover:text-slate-200 ml-1", title: "Toggle simulated network state", children: "(toggle)" })] }), _jsxs("div", { className: "flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700", children: [_jsx("span", { className: "text-xs text-slate-400", children: "Role:" }), _jsxs("select", { value: userRole, onChange: e => setUserRole(e.target.value), className: "bg-slate-900 text-xs font-semibold text-rose-300 border border-slate-700 rounded px-2 py-0.5 outline-none", children: [_jsx("option", { value: "DISPATCHER", children: "DISPATCHER" }), _jsx("option", { value: "RESPONDER", children: "RESPONDER" }), _jsx("option", { value: "SUPERVISOR", children: "SUPERVISOR" }), _jsx("option", { value: "ADMINISTRATOR", children: "ADMINISTRATOR" })] })] })] })] }) }), _jsx("nav", { className: "border-b border-slate-800 bg-slate-900/50 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1", children: [_jsxs("button", { onClick: () => setCurrentTab('dispatch'), className: `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${currentTab === 'dispatch'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`, children: [_jsx(LayoutDashboard, { className: "w-4 h-4" }), _jsx("span", { children: "Dispatch Board" })] }), _jsxs("button", { onClick: () => setCurrentTab('resources'), className: `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${currentTab === 'resources'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`, children: [_jsx(Ambulance, { className: "w-4 h-4" }), _jsx("span", { children: "Resource Registry" })] }), _jsxs("button", { onClick: () => setCurrentTab('conflicts'), className: `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${currentTab === 'conflicts'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`, children: [_jsx(AlertOctagon, { className: "w-4 h-4" }), _jsx("span", { children: "Conflicts & Adjudication" }), _jsx("span", { className: "bg-rose-900 text-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold", children: "1 Active" })] }), _jsxs("button", { onClick: () => setCurrentTab('sync_center'), className: `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${currentTab === 'sync_center'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`, children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Sync Center" })] }), _jsxs("button", { onClick: () => setCurrentTab('audit'), className: `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${currentTab === 'audit'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`, children: [_jsx(History, { className: "w-4 h-4" }), _jsx("span", { children: "Audit & Replay" })] })] }) }), _jsxs("main", { className: "flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6", children: [_jsxs("div", { className: "bg-blue-950/40 border border-blue-800/50 rounded-lg p-4 flex items-start gap-3", children: [_jsx(Info, { className: "w-5 h-5 text-blue-400 shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs text-blue-200 leading-relaxed space-y-1", children: [_jsx("p", { className: "font-semibold text-blue-100", children: "Authoritative Consistency Guarantee:" }), _jsxs("p", { children: ["Offline browser state is ", _jsx("strong", { children: "never globally authoritative" }), ". Local claims are preserved in IndexedDB as verifiable evidence with ", _jsx("code", { children: "client_event_id" }), " and synchronized deterministically with DynamoDB upon reconnect."] })] })] }), currentTab === 'conflicts' ? (_jsx("section", { "aria-label": "Conflict Adjudication Console", children: _jsx(ConflictAdjudicationView, { userRole: userRole, onResolved: handleConflictResolved }) })) : (_jsxs(_Fragment, { children: [_jsx("section", { "aria-label": "Incident Grid Telemetry", children: _jsx(MapPlaceholder, { className: "h-72 w-full" }) }), _jsxs("section", { "aria-label": "Ambulance Fleet Status", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4 text-slate-400" }), _jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wider text-slate-300", children: ["Ambulance Allocation Fleet (", ambulances.length, " Units Tracked)"] })] }), _jsx("span", { className: "text-xs text-slate-500 font-mono", children: "DynamoDB Table: ResQSync-Authoritative" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: ambulances.map(unit => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 space-y-3 transition-colors shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-bold text-white text-base flex items-center gap-2", children: [_jsx("span", { children: unit.callSign }), _jsxs("span", { className: "text-xs font-normal text-slate-400 font-mono", children: ["(", unit.id, ")"] })] }), _jsx("p", { className: "text-xs text-slate-400", children: unit.type })] }), _jsx(ResourceStateBadge, { status: unit.status })] }), _jsxs("div", { className: "text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800/80", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Location:" }), _jsx("span", { className: "font-medium text-right truncate ml-2", children: unit.location })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-500", children: "Authoritative Version:" }), _jsxs("span", { className: "font-mono text-slate-300", children: ["v", unit.version] })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-1", children: [_jsx("button", { disabled: unit.status !== 'AVAILABLE', className: `text-xs px-3 py-1.5 rounded font-semibold transition-colors ${unit.status === 'AVAILABLE'
                                                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`, children: unit.status === 'AVAILABLE' ? 'Claim Resource' : 'Unavailable' }), _jsx("span", { className: "text-[11px] text-slate-500", children: unit.status === 'PENDING_SYNC' ? 'Queued in IndexedDB' : 'Synchronized' })] })] }, unit.id))) })] })] }))] }), _jsx("footer", { className: "border-t border-slate-800 bg-slate-900/60 py-3 px-4 text-center text-xs text-slate-500", children: "ResQSync // Command \u2014 Offline-First Disaster Resource Coordination \u2014 Milestone 1 - M6" })] }));
}
export default function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AppContent, {}) }));
}
//# sourceMappingURL=App.js.map
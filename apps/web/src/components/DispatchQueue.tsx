import React, { useState } from 'react';
import { Phone, MessageSquare, Clock, MapPin, Search, Radio } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export interface EmergencyDispatchItem {
  id: string;
  unitCode: string;
  callSign: string;
  unitType: string;
  incidentId: string;
  incidentTitle: string;
  status: 'En Route' | 'On Scene' | 'Staging' | 'Conflict' | 'Available';
  severity: 'CRITICAL' | 'URGENT' | 'STANDARD' | 'LOW';
  route: string;
  timeLeft: string;
  distance: string;
  responderLead: string;
  crewSize: number;
  progressPct: number;
  stripeColor: 'lime' | 'cyan' | 'amber' | 'rose';
}

export const DEFAULT_DISPATCH_ITEMS: EmergencyDispatchItem[] = [
  {
    id: 'AMB-A12',
    unitCode: 'UNIT-12',
    callSign: 'Ambulance-12 (AMB-A12)',
    unitType: 'ALS Trauma Ambulance',
    incidentId: 'INC-882',
    incidentTitle: 'Market St. Structural Collapse',
    status: 'En Route',
    severity: 'CRITICAL',
    route: 'Station 4 → Sector 4 Triage',
    timeLeft: '4 min ETA',
    distance: '1.8 km',
    responderLead: 'Capt. C. Rivera',
    crewSize: 3,
    progressPct: 72,
    stripeColor: 'lime',
  },
  {
    id: 'AMB-C08',
    unitCode: 'RESCUE-08',
    callSign: 'Rescue-08 (AMB-C08)',
    unitType: 'Heavy Rescue Extraction',
    incidentId: 'INC-882',
    incidentTitle: 'Market St. Collapse Perimeter',
    status: 'On Scene',
    severity: 'CRITICAL',
    route: 'Central Fire HQ → Sector 4',
    timeLeft: 'On Scene (18m active)',
    distance: '0.2 km',
    responderLead: 'Lt. L. Fernández',
    crewSize: 4,
    progressPct: 92,
    stripeColor: 'cyan',
  },
  {
    id: 'ENG-03',
    unitCode: 'ENGINE-03',
    callSign: 'Engine-03 (ENG-03)',
    unitType: 'Hazmat Suppression Pumper',
    incidentId: 'INC-408',
    incidentTitle: 'Industrial Chemical Depot Hazard',
    status: 'En Route',
    severity: 'URGENT',
    route: 'Station 9 → Sector 2 Depot',
    timeLeft: '6 min ETA',
    distance: '3.4 km',
    responderLead: 'Capt. M. Rossi',
    crewSize: 4,
    progressPct: 58,
    stripeColor: 'rose',
  },
  {
    id: 'AMB-A07',
    unitCode: 'UNIT-07',
    callSign: 'Ambulance-07 (AMB-A07)',
    unitType: 'BLS Medical Transport',
    incidentId: 'INC-204',
    incidentTitle: 'Flash Flood Staging North',
    status: 'Staging',
    severity: 'STANDARD',
    route: 'Trauma Bay → Staging North',
    timeLeft: '8 min ETA',
    distance: '4.1 km',
    responderLead: 'Paramedic E. Davis',
    crewSize: 2,
    progressPct: 35,
    stripeColor: 'amber',
  },
  {
    id: 'AMB-A19',
    unitCode: 'UNIT-19',
    callSign: 'Rescue-19 (AMB-A19)',
    unitType: 'Mobile Intensive Care Unit',
    incidentId: 'INC-882',
    incidentTitle: 'Trauma Center ICU Transfer',
    status: 'Conflict',
    severity: 'CRITICAL',
    route: 'Trauma Bay 3 → Sector 4',
    timeLeft: 'Under Supervisor Review',
    distance: '2.5 km',
    responderLead: 'Dr. K. Vance',
    crewSize: 3,
    progressPct: 80,
    stripeColor: 'rose',
  },
  {
    id: 'AMB-D15',
    unitCode: 'MEDIC-15',
    callSign: 'Medic-15 (AMB-D15)',
    unitType: 'BLS First Response',
    incidentId: 'STBY-01',
    incidentTitle: 'West Sector Patrol & Standby',
    status: 'Available',
    severity: 'STANDARD',
    route: 'Staging Zone West',
    timeLeft: 'Standby / Ready',
    distance: '0 km',
    responderLead: 'Paramedic J. Miller',
    crewSize: 2,
    progressPct: 15,
    stripeColor: 'cyan',
  },
];

interface DispatchQueueProps {
  onSelectUnit?: (unitId: string) => void;
  selectedUnitId?: string;
  onSelectIncident?: (incidentId: string) => void;
}

export const DispatchQueue: React.FC<DispatchQueueProps> = ({
  onSelectUnit,
  selectedUnitId = 'AMB-A12',
  onSelectIncident,
}) => {
  const { addNotification } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'En Route' | 'On Scene' | 'Staging'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: Array<'All' | 'Critical' | 'En Route' | 'On Scene' | 'Staging'> = [
    'All',
    'Critical',
    'En Route',
    'On Scene',
    'Staging',
  ];

  const filteredItems = DEFAULT_DISPATCH_ITEMS.filter(item => {
    if (activeFilter === 'Critical' && item.severity !== 'CRITICAL') return false;
    if (activeFilter === 'En Route' && item.status !== 'En Route') return false;
    if (activeFilter === 'On Scene' && item.status !== 'On Scene') return false;
    if (activeFilter === 'Staging' && item.status !== 'Staging') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.unitCode.toLowerCase().includes(q) ||
        item.callSign.toLowerCase().includes(q) ||
        item.responderLead.toLowerCase().includes(q) ||
        item.incidentTitle.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: EmergencyDispatchItem['status']) => {
    switch (status) {
      case 'On Scene':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'En Route':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'Staging':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Conflict':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse';
      case 'Available':
        return 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30';
    }
  };

  const getSeverityBadge = (severity: EmergencyDispatchItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      case 'URGENT':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-base tracking-tight text-white font-sans">
              Incident & Response Queue
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Active priority dispatches & triage units</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold">
          {DEFAULT_DISPATCH_ITEMS.length} ACTIVE
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search units, incidents, medics..."
          className="w-full bg-[#1b1c20] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500/40 placeholder:text-zinc-500 transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1b1c20] rounded-xl border border-white/5 overflow-x-auto">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === tab
                ? 'bg-zinc-700/80 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {filteredItems.map(item => {
          const isSelected = selectedUnitId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectUnit && onSelectUnit(item.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-[#1b1e24] border-cyan-500/50 shadow-lg shadow-cyan-500/15 scale-[1.01] ring-1 ring-cyan-500/30'
                  : 'bg-[#181a1f]/80 border-white/5 hover:border-white/15 hover:bg-[#1b1d22]'
              }`}
            >
              {/* Card Top: Unit Code + Severity + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs tracking-wider text-cyan-400">
                    {item.unitCode}
                  </span>
                  <span className="text-[10px] text-zinc-500">•</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Mission / Incident Title */}
              <div
                onClick={e => {
                  if (onSelectIncident) {
                    e.stopPropagation();
                    onSelectIncident(item.incidentId);
                  }
                }}
                className="group/title hover:text-cyan-300 transition-colors"
                title="View Incident Intelligence"
              >
                <div className="text-xs font-semibold text-zinc-100 group-hover/title:text-cyan-300 line-clamp-1">
                  {item.incidentTitle}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="text-cyan-300/90 font-bold underline">{item.incidentId}</span>
                  <span>·</span>
                  <span>{item.unitType}</span>
                </div>
              </div>

              {/* Route & Distance */}
              <div className="text-xs text-zinc-300 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-[11px] text-zinc-300">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.route}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-zinc-300 font-medium">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {item.timeLeft}
                  </span>
                  <span className="font-mono text-zinc-400 text-[10px]">{item.distance}</span>
                </div>
              </div>

              {/* Responder Lead & Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                    {item.responderLead
                      .split(' ')
                      .slice(-1)[0][0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {item.responderLead}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Crew: {item.crewSize} Medics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addNotification({
                        title: `RADIO CHANNEL ACTIVE: ${item.unitCode}`,
                        message: `Push-to-talk channel open with ${item.responderLead} (Crew: ${item.crewSize}).`,
                        type: 'info',
                      });
                    }}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 flex items-center justify-center transition-colors"
                    title="Radio Comms"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addNotification({
                        title: `DIRECT UPLINK: ${item.callSign}`,
                        message: `Telemetry packets streaming live from ${item.unitCode}.`,
                        type: 'info',
                      });
                    }}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 flex items-center justify-center transition-colors"
                    title="Direct Uplink"
                  >
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Haulix Iconic Animated Candy-Stripe Progress Bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden relative">
                {item.stripeColor === 'lime' && (
                  <div
                    className="h-full rounded-full candy-stripe-lime shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                    style={{ width: `${item.progressPct}%` }}
                  />
                )}
                {item.stripeColor === 'cyan' && (
                  <div
                    className="h-full rounded-full candy-stripe-cyan shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    style={{ width: `${item.progressPct}%` }}
                  />
                )}
                {item.stripeColor === 'rose' && (
                  <div
                    className="h-full rounded-full candy-stripe-rose shadow-[0_0_10px_rgba(251,113,133,0.5)]"
                    style={{ width: `${item.progressPct}%` }}
                  />
                )}
                {item.stripeColor === 'amber' && (
                  <div
                    className="h-full rounded-full candy-stripe-amber shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    style={{ width: `${item.progressPct}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

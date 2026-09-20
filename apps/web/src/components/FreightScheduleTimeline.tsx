import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface MissionScheduleBlock {
  id: string;
  label: string;
  incidentCode: string;
  startHour: number; // e.g. 8.5 for 8:30
  endHour: number; // e.g. 10.5 for 10:30
  color: 'blue' | 'lime' | 'amber' | 'cyan' | 'rose';
  details: string;
  location: string;
}

interface UnitSchedule {
  unitId: string;
  callSign: string;
  unitType: string;
  blocks: MissionScheduleBlock[];
}

const DEFAULT_SCHEDULES: UnitSchedule[] = [
  {
    unitId: 'AMB-A12',
    callSign: 'Alpha-12',
    unitType: 'ALS Ambulance',
    blocks: [
      {
        id: 'b1',
        label: 'TRIAGE-RELAY',
        incidentCode: 'INC-702',
        startHour: 8.75,
        endHour: 10.75,
        color: 'blue',
        details: 'Inter-Facility ICU Transfer · Patient Stable',
        location: 'Central Trauma Bay 2',
      },
      {
        id: 'b2',
        label: 'SEC4-COLLAPSE',
        incidentCode: 'INC-882',
        startHour: 13.5,
        endHour: 16.0,
        color: 'lime',
        details: 'Market St. Structural Collapse · Priority 1 Extraction',
        location: 'Market St. & 4th Ave, Sector 4',
      },
    ],
  },
  {
    unitId: 'AMB-C08',
    callSign: 'Rescue-08',
    unitType: 'Heavy Rescue',
    blocks: [
      {
        id: 'b3',
        label: 'PERIMETER-SEC',
        incidentCode: 'INC-610',
        startHour: 9.2,
        endHour: 11.5,
        color: 'blue',
        details: 'Perimeter Containment & Search Dogs',
        location: 'Sector 1 Perimeter',
      },
      {
        id: 'b4',
        label: 'COLLAPSE-EXTRACT',
        incidentCode: 'INC-882',
        startHour: 14.0,
        endHour: 16.5,
        color: 'cyan',
        details: 'Heavy Shoring & Rapid Victim Extraction',
        location: 'Sector 4 Collapse Zone',
      },
    ],
  },
  {
    unitId: 'ENG-03',
    callSign: 'Engine-03',
    unitType: 'Hazmat Pumper',
    blocks: [
      {
        id: 'b5',
        label: 'HAZMAT-DEPOT',
        incidentCode: 'INC-408',
        startHour: 11.0,
        endHour: 13.5,
        color: 'rose',
        details: 'Chemical Vapor Suppression & Neutralization',
        location: 'Industrial Chemical Depot, Sector 2',
      },
      {
        id: 'b6',
        label: 'FIRE-STANDBY',
        incidentCode: 'STBY-2',
        startHour: 15.0,
        endHour: 17.5,
        color: 'amber',
        details: 'High-Risk Standby Staging',
        location: 'Depot Staging Sector',
      },
    ],
  },
  {
    unitId: 'AMB-A07',
    callSign: 'Alpha-07',
    unitType: 'BLS Ambulance',
    blocks: [
      {
        id: 'b7',
        label: 'FLOOD-EVAC',
        incidentCode: 'INC-204',
        startHour: 10.0,
        endHour: 12.5,
        color: 'blue',
        details: 'Lowland Evacuation Staging & Medical Triage',
        location: 'North Evacuation Staging',
      },
      {
        id: 'b8',
        label: 'STAGING-NORTH',
        incidentCode: 'INC-204',
        startHour: 14.5,
        endHour: 17.0,
        color: 'cyan',
        details: 'Shelter Medical Support & Surge Intake',
        location: 'Community Center Shelter',
      },
    ],
  },
];

export const FreightScheduleTimeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'units' | 'incidents'>('units');

  // Hours 8 to 20 (12 hours span)
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const startHour = 8;
  const totalHours = 12;

  // "NOW" marker at 15.2 (15:12)
  const nowHour = 15.25;
  const nowPct = ((nowHour - startHour) / totalHours) * 100;

  const { timelineEvents, setSelectedVehicleId, setSelectedIncidentId } = useAppStore();
  const latestEvent = timelineEvents[0];

  const handleBlockClick = (unitId: string, incidentCode: string) => {
    setSelectedVehicleId(unitId);
    setSelectedIncidentId(incidentCode);
  };

  const getBlockStyle = (color: MissionScheduleBlock['color']) => {
    switch (color) {
      case 'lime':
        return 'bg-[#bef264] text-black shadow-[0_0_12px_rgba(190,242,100,0.6)] font-bold';
      case 'cyan':
        return 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)] font-semibold';
      case 'amber':
        return 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-bold';
      case 'rose':
        return 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] font-bold';
      case 'blue':
      default:
        return 'bg-[#0284c7] text-white shadow-[0_0_10px_rgba(2,132,199,0.4)] font-semibold';
    }
  };

  return (
    <div className="w-full bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl text-white space-y-4">
      {/* Header with 24h Status Horizon */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white font-sans">
              Operational Mission Schedule & Dispatch Horizon
            </h3>
            <p className="text-xs text-zinc-400">
              Real-time resource allocations & multi-agency operational windows
            </p>
          </div>
        </div>

        {/* Units / Incidents View Toggle */}
        <div className="flex items-center gap-1 bg-[#1b1c20] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'units'
                ? 'bg-zinc-700/80 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Response Units ({DEFAULT_SCHEDULES.length})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'incidents'
                ? 'bg-zinc-700/80 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Incident Horizons
          </button>
        </div>
      </div>

      {/* Main Gantt Horizon Table */}
      <div className="relative overflow-x-auto select-none pt-1">
        {/* Time Scale Header Ruler */}
        <div className="flex items-center mb-2 pl-36 pr-2 text-[10px] font-mono text-zinc-400 relative">
          <div className="flex-1 flex justify-between">
            {hours.map(hour => (
              <span key={hour} className="w-8 text-center">
                {hour.toString().padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {/* Pulsing "NOW" Line Anchor in Ruler */}
          <div
            className="absolute top-0 bottom-0 z-30 flex flex-col items-center pointer-events-none"
            style={{ left: `calc(9rem + ${nowPct}% - 1px)` }}
          >
            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-[9px] font-mono font-bold text-white shadow-[0_0_8px_#ef4444] animate-pulse">
              NOW
            </span>
          </div>
        </div>

        {/* Schedule Lanes with Pulsing Vertical Red "NOW" Line passing through */}
        <div className="relative space-y-2.5">
          {/* Vertical Red NOW Line spanning all unit lanes */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 shadow-[0_0_8px_#ef4444] z-20 pointer-events-none animate-now-pulse"
            style={{ left: `calc(9rem + ${nowPct}% - 1px)` }}
          />

          {DEFAULT_SCHEDULES.map(unit => (
            <div key={unit.unitId} className="flex items-center gap-3 group">
              {/* Unit Info Capsule */}
              <div
                onClick={() => setSelectedVehicleId(unit.unitId)}
                className="w-36 shrink-0 flex items-center justify-between p-2 rounded-xl bg-[#1b1c20] border border-white/5 group-hover:border-cyan-500/40 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-zinc-100 font-mono flex items-center gap-1.5">
                    <span>{unit.callSign}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[85px]">
                    {unit.unitType}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              </div>

              {/* Lane Track */}
              <div className="flex-1 h-8 bg-[#181a1f]/80 rounded-xl relative border border-white/5 flex items-center overflow-hidden">
                {/* Hourly grid lines */}
                {hours.map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 border-r border-white/[0.04]"
                    style={{ left: `${(idx / (hours.length - 1)) * 100}%` }}
                  />
                ))}

                {/* Mission Blocks */}
                {unit.blocks.map(block => {
                  const leftPct = ((block.startHour - startHour) / totalHours) * 100;
                  const widthPct = ((block.endHour - block.startHour) / totalHours) * 100;

                  return (
                    <div
                      key={block.id}
                      onClick={() => handleBlockClick(unit.unitId, block.incidentCode)}
                      className={`group absolute h-6 rounded-lg px-2.5 flex items-center text-[10px] tracking-tight cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-30 truncate ${getBlockStyle(
                        block.color
                      )}`}
                      style={{
                        left: `${Math.max(leftPct, 0)}%`,
                        width: `${widthPct}%`,
                      }}
                    >
                      <span className="truncate">{block.label}</span>

                      {/* Rich Hover Tooltip */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 p-2.5 bg-[#12141a]/95 backdrop-blur-xl text-white text-[11px] rounded-xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl space-y-1">
                        <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <span>{block.incidentCode}</span>
                          <span>•</span>
                          <span className="text-zinc-200">{block.label}</span>
                        </div>
                        <div className="text-zinc-300 text-[10px]">{block.details}</div>
                        <div className="text-zinc-400 font-mono text-[9px]">{block.location}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Telemetry Stream Strip */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold">LIVE LOG:</span>
          <span>{latestEvent ? latestEvent.time : '15:12:04 UTC'}</span>
          <span>·</span>
          <span className="text-cyan-300">
            {latestEvent ? `${latestEvent.title} — ${latestEvent.description}` : 'AMB-A12 telemetry sync accepted (DynamoDB v6)'}
          </span>
        </div>
        <div className="text-zinc-500">
          Showing active shift operational horizon (08:00 – 20:00 UTC)
        </div>
      </div>
    </div>
  );
};

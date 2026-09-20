import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2, Activity, Users, Radio, Gauge, Ambulance } from 'lucide-react';

interface VehicleSchematicCardProps {
  unitId?: string;
  callSign?: string;
  unitType?: string;
  crewCapacity?: string;
  equipmentTier?: string;
  payload?: string;
  fuelRange?: string;
  onDispatch?: (id: string) => void;
  isDispatched?: boolean;
}

export const VehicleSchematicCard: React.FC<VehicleSchematicCardProps> = ({
  unitId = 'AMB-A12',
  callSign = 'Medic-12',
  unitType = 'Type-1 ALS Heavy Ambulance',
  crewCapacity = '3 Paramedics',
  equipmentTier = 'ALS Tier-1 Intensive',
  payload = '1,850 kg',
  fuelRange = '420 km (78%)',
  onDispatch,
  isDispatched = false,
}) => {
  const [isDeploying, setIsDeploying] = React.useState(false);

  const handleDeploy = () => {
    if (isDeploying || isDispatched) return;
    setIsDeploying(true);
    setTimeout(() => {
      if (onDispatch) onDispatch(unitId);
      setIsDeploying(false);
    }, 600);
  };
  return (
    <div className="bg-[#141518]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ambulance className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-zinc-100 tracking-wider font-mono">
              {callSign} <span className="text-zinc-500 text-xs">({unitId})</span>
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono truncate">{unitType}</p>
          </div>
        </div>
        <span className="text-[10px] text-cyan-400/90 uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 shrink-0">
          Unit Blueprint
        </span>
      </div>

      {/* Technical Blueprint Wireframe Illustration of Type-1 ALS Ambulance */}
      <div className="relative w-full h-32 rounded-xl bg-gradient-to-b from-[#161820] to-[#0c0d10] border border-white/5 flex items-center justify-center overflow-hidden group">
        {/* Technical Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00e5ff 1px, transparent 1px), linear-gradient(to bottom, #00e5ff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Detailed High-Tech Technical Vector Drawing of Emergency Ambulance */}
        <svg
          className="w-4/5 h-24 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-500 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]"
          viewBox="0 0 280 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          {/* Aerodynamic Emergency Lightbar on Cab Roof */}
          <rect x="220" y="24" width="30" height="6" rx="2" fill="#ef4444" stroke="#f87171" strokeWidth="1" className="animate-pulse" />
          <line x1="225" y1="24" x2="225" y2="21" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="245" y1="24" x2="245" y2="21" stroke="#ef4444" strokeWidth="1.5" />

          {/* Heavy Duty Cab Section */}
          <path
            d="M 200 90 L 255 90 C 265 90 270 85 272 75 L 268 45 C 266 38 258 32 248 32 L 200 32 Z"
            strokeDasharray="2 0"
          />
          {/* Windshield */}
          <path
            d="M 230 36 L 256 46 C 260 48 262 52 262 58 L 230 58 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          {/* Cab Door & Grab Handle */}
          <line x1="228" y1="58" x2="228" y2="88" strokeDasharray="3 3" />
          <line x1="234" y1="68" x2="242" y2="68" stroke="currentColor" strokeWidth="2" />

          {/* Modular Patient Trauma Care Box Compartment */}
          <rect
            x="20"
            y="20"
            width="180"
            height="70"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity="0.04"
          />

          {/* Star of Life / Medical Caduceus Cross on Patient Compartment */}
          <g transform="translate(105, 52) scale(0.7)" stroke="#38bdf8" strokeWidth="2.5">
            <line x1="0" y1="-14" x2="0" y2="14" />
            <line x1="-14" y1="0" x2="14" y2="0" />
            <line x1="-10" y1="-10" x2="10" y2="10" />
            <line x1="-10" y1="10" x2="10" y2="-10" />
          </g>

          {/* Side Patient Access Doors & Stretcher Loading Bay */}
          <rect x="30" y="28" width="60" height="54" rx="2" strokeDasharray="3 2" strokeOpacity="0.5" />
          <rect x="135" y="28" width="60" height="54" rx="2" strokeDasharray="3 2" strokeOpacity="0.5" />

          {/* Medical Oxygen Cylinder & Power Bay Access */}
          <rect x="94" y="72" width="22" height="15" rx="1.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />

          {/* Wheels with Disc Brake Assemblies */}
          {/* Dual Rear Wheels */}
          <circle cx="55" cy="92" r="14" fill="#0c0d10" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="55" cy="92" r="6" stroke="currentColor" strokeWidth="1.5" />

          <circle cx="95" cy="92" r="14" fill="#0c0d10" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="95" cy="92" r="6" stroke="currentColor" strokeWidth="1.5" />

          {/* Front Steer Wheel */}
          <circle cx="235" cy="92" r="14" fill="#0c0d10" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="235" cy="92" r="6" stroke="currentColor" strokeWidth="1.5" />

          {/* Ground Sensor & Shadow Line */}
          <line x1="12" y1="106" x2="272" y2="106" stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Blueprint watermark */}
        <span className="absolute bottom-1.5 right-2 text-[9px] font-mono text-cyan-500/60 font-semibold">
          TYPE-1 ALS // RESQSYNC SPEC
        </span>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#181a20]/70 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>Crew Capacity</span>
          </div>
          <span className="font-semibold text-zinc-100 font-mono text-xs mt-0.5 block">
            {crewCapacity}
          </span>
        </div>

        <div className="bg-[#181a20]/70 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Equipment Tier</span>
          </div>
          <span className="font-semibold text-zinc-100 font-mono text-xs mt-0.5 block truncate">
            {equipmentTier}
          </span>
        </div>

        <div className="bg-[#181a20]/70 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>Payload / Capacity</span>
          </div>
          <span className="font-semibold text-zinc-100 font-mono text-xs mt-0.5 block">
            {payload}
          </span>
        </div>

        <div className="bg-[#181a20]/70 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>Fuel & Range</span>
          </div>
          <span className="font-semibold text-zinc-100 font-mono text-xs mt-0.5 block">
            {fuelRange}
          </span>
        </div>
      </div>

      {/* Compliance / Readiness Badges */}
      <div className="flex items-center gap-2 pt-1">
        <span className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          ALS Verified
        </span>
        <span className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Trauma Tier-1
        </span>
        <span className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300">
          <FileCheck className="w-3 h-3 text-indigo-400" />
          Telemetry Live
        </span>
      </div>

      {/* Direct Deploy & Dispatch Action */}
      {onDispatch && (
        <button
          onClick={handleDeploy}
          disabled={isDeploying || isDispatched}
          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            isDispatched
              ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
              : isDeploying
              ? 'bg-cyan-500/80 text-black cursor-wait scale-[0.98]'
              : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black shadow-cyan-500/25 hover:scale-[1.01]'
          }`}
        >
          {isDeploying ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>Deploying Unit...</span>
            </>
          ) : isDispatched ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unit Active & En Route</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Dispatch & Deploy {callSign} // Code-3</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

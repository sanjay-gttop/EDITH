import React from 'react';
import { Ambulance, X, Clock, Navigation, Radio, ShieldCheck } from 'lucide-react';
import { SpeedometerGauge } from './SpeedometerGauge';
import { FuelLiquidGauge } from './FuelLiquidGauge';

export interface VehicleTelemetryData {
  id: string; // 'AMB-A12'
  callSign?: string; // 'Medic-12'
  model: string; // 'Type-1 Heavy ALS Trauma Unit'
  status: string; // 'En Route' | 'On Scene' | 'Staging'
  origin: string; // 'Station 4, Central District'
  destination: string; // 'Market St. Collapse (INC-882)'
  totalDistance: string; // '6.4 km'
  progressPct: number; // 72
  eta: string; // '~4 min'
  distanceRemaining: string; // '1.8 km'
  speed: number; // 62
  speedStatus?: string; // 'High Priority' | 'Standard'
  fuelPct: number; // 78
  fuelVolume: string; // '18.2 gal'
  temperature: string; // '68°F'
  alertMessage?: string; // 'Code-3 Emergency: Lights & Sirens Active'
}

interface VehicleTelemetryCardProps {
  vehicle: VehicleTelemetryData;
  onClose?: () => void;
  onClaim?: (id: string) => void;
  canClaim?: boolean;
  isDispatched?: boolean;
}

export const VehicleTelemetryCard: React.FC<VehicleTelemetryCardProps> = ({
  vehicle,
  onClose,
  onClaim,
  canClaim,
  isDispatched,
}) => {
  const [isDispatching, setIsDispatching] = React.useState(false);

  const handleDispatchClick = () => {
    if (isDispatching) return;
    setIsDispatching(true);
    setTimeout(() => {
      if (onClaim) {
        onClaim(vehicle.id);
      }
      setIsDispatching(false);
      if (onClose) {
        onClose();
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-[440px] bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight text-white font-mono">
                {vehicle.callSign || vehicle.id}
              </h3>
              {vehicle.callSign && (
                <span className="text-xs text-zinc-400 font-mono">
                  ({vehicle.id})
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-semibold text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {vehicle.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{vehicle.model}</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close telemetry card"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Route & Progress Track */}
      <div className="bg-[#1b1c20]/80 rounded-2xl p-3.5 border border-white/5 mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-zinc-200">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
            <span className="truncate max-w-[240px]">
              {vehicle.origin} → {vehicle.destination}
            </span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            {vehicle.totalDistance} ·{' '}
            <strong className="text-cyan-400">{vehicle.progressPct}%</strong>
          </span>
        </div>

        {/* Progress Bar with glowing cyan track */}
        <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_#22d3ee] transition-all duration-700"
            style={{ width: `${vehicle.progressPct}%` }}
          />
        </div>

        {/* ETA & Distance Remaining */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Est. Time to Scene (ETA):{' '}
              <strong className="text-zinc-200">{vehicle.eta}</strong>
            </span>
          </div>
          <span>
            <strong className="text-zinc-200 font-mono">
              {vehicle.distanceRemaining}
            </strong>{' '}
            Remaining
          </span>
        </div>
      </div>

      {/* Dual Circular Precision Gauges (Speedometer + Liquid Wave Gauge) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SpeedometerGauge
          speed={vehicle.speed}
          statusBadge={vehicle.speedStatus || 'High Priority'}
        />
        <FuelLiquidGauge
          percentage={vehicle.fuelPct}
          volumeText={vehicle.fuelVolume}
          temperature={vehicle.temperature}
        />
      </div>

      {/* Alert / Code-3 Priority Banner */}
      {vehicle.alertMessage && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{vehicle.alertMessage}</span>
        </div>
      )}

      {/* Direct Dispatcher Action with compression and loading indicator */}
      {canClaim && onClaim && (
        <button
          onClick={handleDispatchClick}
          disabled={isDispatching || isDispatched}
          className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            isDispatched
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
              : isDispatching
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 opacity-85 cursor-wait scale-[0.98] text-black shadow-cyan-500/30'
              : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black hover:scale-[1.01] shadow-cyan-500/30'
          }`}
        >
          {isDispatched ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Unit Active & En Route // Live Tracking Active</span>
            </>
          ) : isDispatching ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>Dispatching Resource...</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Dispatch & Claim Resource // Optimistic Lock</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

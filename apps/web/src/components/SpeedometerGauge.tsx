import React from 'react';

interface SpeedometerGaugeProps {
  speed?: number; // e.g. 51
  maxSpeed?: number; // e.g. 150
  unit?: string; // e.g. 'mph'
  statusBadge?: string; // e.g. 'High' | 'Normal'
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speed = 51,
  maxSpeed = 150,
  unit = 'mph',
  statusBadge = 'High',
}) => {
  // Angle range: -135deg (0 mph) to +135deg (150 mph) => total 270 degrees
  const clampedSpeed = Math.min(Math.max(speed, 0), maxSpeed);
  const angle = -135 + (clampedSpeed / maxSpeed) * 270;

  // Ticks at 0, 25, 50, 75, 100, 125, 150
  const ticks = [0, 25, 50, 75, 100, 125, 150];

  return (
    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-[#1b1c20]/90 border border-white/5 w-full max-w-[200px] h-[190px]">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-xs font-medium text-zinc-400">Speed</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            statusBadge === 'High'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {statusBadge}
        </span>
      </div>

      {/* Circular Gauge Canvas */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Arc */}
          <circle
            cx="80"
            cy="80"
            r="62"
            fill="none"
            stroke="#262930"
            strokeWidth="6"
            strokeDasharray="292 100"
            strokeDashoffset="-50"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <circle
            cx="80"
            cy="80"
            r="62"
            fill="none"
            stroke="url(#speedGrad)"
            strokeWidth="6"
            strokeDasharray="292 100"
            strokeDashoffset={292 - (clampedSpeed / maxSpeed) * 292 - 50}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Tick Marks & Labels */}
          {ticks.map((tickVal) => {
            const tickAngle = -135 + (tickVal / maxSpeed) * 270;
            const rad = (tickAngle * Math.PI) / 180;
            // tick inner and outer coords
            const x1 = 80 + 52 * Math.sin(rad);
            const y1 = 80 - 52 * Math.cos(rad);
            const x2 = 80 + 57 * Math.sin(rad);
            const y2 = 80 - 57 * Math.cos(rad);

            // text coords
            const tx = 80 + 42 * Math.sin(rad);
            const ty = 80 - 42 * Math.cos(rad);

            return (
              <g key={tickVal}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#525866"
                  strokeWidth="1.5"
                />
                <text
                  x={tx}
                  y={ty + 3}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="7.5"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Center Pivot Bezel */}
          <circle cx="80" cy="80" r="7" fill="#1b1c20" stroke="#525866" strokeWidth="2" />
          <circle cx="80" cy="80" r="3" fill="#ffffff" />
        </svg>

        {/* Rotating Needle */}
        <div
          className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Needle stick pointing up towards 12 o'clock */}
          <div
            className="w-1 h-[52px] bg-gradient-to-t from-white to-amber-200 rounded-full shadow-[0_0_10px_#ffffff] origin-bottom mb-[52px]"
            style={{ filter: 'drop-shadow(0 0 4px #ffffff)' }}
          />
        </div>

        {/* Speed Value Readout at Bottom Center */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-xl font-bold font-mono text-white tracking-tight leading-none">
            {speed}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface CompassWidgetProps {
  heading?: number; // In degrees, e.g. 315 for NW
  headingLabel?: string; // 'NW'
}

export const CompassWidget: React.FC<CompassWidgetProps> = ({
  heading = 315,
  headingLabel = 'NW',
}) => {
  return (
    <div className="relative group flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-b from-[#1e2025] to-[#0c0d0f] p-2 border-2 border-[#2b2d35] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15)]">
      {/* Outer Dial Markings Ring */}
      <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none" viewBox="0 0 100 100">
        {/* Ticks every 30 degrees */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
          const isMajor = deg % 90 === 0;
          const rad = (deg * Math.PI) / 180;
          const r1 = 44;
          const r2 = isMajor ? 38 : 41;
          const x1 = 50 + r1 * Math.sin(rad);
          const y1 = 50 - r1 * Math.cos(rad);
          const x2 = 50 + r2 * Math.sin(rad);
          const y2 = 50 - r2 * Math.cos(rad);

          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? '#9ca3af' : '#4b5563'}
              strokeWidth={isMajor ? 1.5 : 1}
            />
          );
        })}

        {/* Labels: N, E, S, W */}
        <text x="50" y="16" textAnchor="middle" fill="#f97316" fontSize="7" fontWeight="bold">N</text>
        <text x="86" y="52.5" textAnchor="middle" fill="#9ca3af" fontSize="6.5" fontWeight="bold">E</text>
        <text x="50" y="89" textAnchor="middle" fill="#9ca3af" fontSize="6.5" fontWeight="bold">S</text>
        <text x="14" y="52.5" textAnchor="middle" fill="#9ca3af" fontSize="6.5" fontWeight="bold">W</text>
      </svg>

      {/* Rotating Inner Rose */}
      <div
        className="w-16 h-16 rounded-full bg-[#121316] border border-[#2a2d36] flex items-center justify-center relative shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-out"
        style={{ transform: `rotate(${-heading}deg)` }}
      >
        {/* Needle Top Half (Orange) */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-b-[24px] border-b-orange-500 filter drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" />

        {/* Needle Bottom Half (Silver) */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[24px] border-t-zinc-400" />

        {/* Center Metal Stud */}
        <div className="w-4 h-4 rounded-full bg-[#242730] border border-zinc-600 flex items-center justify-center z-10 shadow-md">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Heading Badge on Top-Right Corner */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-orange-500/40 text-[11px] font-mono font-bold text-orange-400 shadow-md pointer-events-none tracking-wider">
        {headingLabel}
      </div>
    </div>
  );
};

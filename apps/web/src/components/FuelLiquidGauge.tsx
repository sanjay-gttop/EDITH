import React from 'react';

interface FuelLiquidGaugeProps {
  percentage?: number; // e.g. 31
  volumeText?: string; // e.g. '1.11 gal'
  temperature?: string; // e.g. '36°F'
}

export const FuelLiquidGauge: React.FC<FuelLiquidGaugeProps> = ({
  percentage = 31,
  volumeText = '1.11 gal',
  temperature = '36°F',
}) => {
  // Wave vertical position calculation: 100% = y=20 (high), 0% = y=140 (empty)
  // Inside 160x160 viewBox, circle center 80, r=58. Top is 22, bottom is 138.
  const waveY = 138 - (percentage / 100) * (138 - 22);

  return (
    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-[#1b1c20]/90 border border-white/5 w-full max-w-[200px] h-[190px]">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-xs font-medium text-zinc-400">Fuel level</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {percentage}%
        </span>
      </div>

      {/* Circular Liquid Wave Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <defs>
            <clipPath id="circleClip">
              <circle cx="80" cy="80" r="56" />
            </clipPath>

            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="liquidGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Outer Dial Track */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke="#262930"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Inner Well */}
          <circle cx="80" cy="80" r="56" fill="#141518" />

          {/* Animated Liquid Wave Inside Clip Circle */}
          <g clipPath="url(#circleClip)">
            {/* Background Slower Wave */}
            <g className="animate-liquid-wave-slow">
              <path
                d={`M 0 ${waveY - 4} Q 50 ${waveY - 14} 100 ${waveY - 4} T 200 ${waveY - 4} T 300 ${waveY - 4} T 400 ${waveY - 4} L 400 160 L 0 160 Z`}
                fill="url(#liquidGradBack)"
              />
            </g>

            {/* Foreground Wave */}
            <g className="animate-liquid-wave">
              <path
                d={`M 0 ${waveY} Q 50 ${waveY + 8} 100 ${waveY} T 200 ${waveY} T 300 ${waveY} T 400 ${waveY} L 400 160 L 0 160 Z`}
                fill="url(#liquidGrad)"
              />
            </g>
          </g>

          {/* Subtle Ring Border */}
          <circle cx="80" cy="80" r="56" fill="none" stroke="#374151" strokeWidth="1.5" />
        </svg>

        {/* Center Digital Telemetry Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
          {/* Fuel icon */}
          <div className="text-zinc-400 text-xs mb-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-sm font-bold font-mono text-white tracking-tight">
            {volumeText}
          </span>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-[10px] font-mono text-zinc-300">
            {temperature}
          </div>
        </div>
      </div>
    </div>
  );
};

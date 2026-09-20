import React, { useState } from 'react';
import {
  Plus,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export const AnalyticsToolsView: React.FC = () => {
  const { setCreateOpModalOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'vis' | 'report'>('vis');


  // CloudWatch Metrics preservation
  const metrics = [
    { title: 'Telemetry Ingestion Latency', value: '14 ms', sub: 'p95 HTTP API latency (us-east-1)', status: 'healthy' },
    { title: 'Client Reconnect Latency', value: '24 ms', sub: 'IndexedDB batch ingestion time', status: 'healthy' },
    { title: 'Open Adjudication Backlog', value: '1 Active', sub: 'Pending supervisor adjudication', status: 'warning' },
    { title: 'DynamoDB Optimistic Version', value: 'v6 Live', sub: 'Single-table state consistency', status: 'healthy' },
  ];

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Analytical tools
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Disaster telemetry, predictive models & resource saturation
          </p>
        </div>

        <button
          onClick={() => setCreateOpModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create new operation</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('vis')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'vis' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Data Visualization Panel
          {activeTab === 'vis' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'report' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Report Generator
          {activeTab === 'report' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
          )}
        </button>
      </div>

      {/* 2x2 Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Temporal Trend Graphs (8 cols) */}
        <div className="lg:col-span-8 bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-base tracking-tight text-white">
              Temporal trend graphs
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                Use of resources
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                Injured people
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Affected infrastructure
              </span>
            </div>
          </div>

          {/* Smooth SVG Spline Area Chart */}
          <div className="relative h-64 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (0 to 60) */}
              {[40, 80, 120, 160, 200].map(y => (
                <line
                  key={y}
                  x1="40"
                  y1={y}
                  x2="680"
                  y2={y}
                  stroke="#262930"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y Axis labels */}
              <text x="25" y="45" fill="#6b7280" fontSize="10" fontFamily="monospace">60</text>
              <text x="25" y="85" fill="#6b7280" fontSize="10" fontFamily="monospace">50</text>
              <text x="25" y="125" fill="#6b7280" fontSize="10" fontFamily="monospace">40</text>
              <text x="25" y="165" fill="#6b7280" fontSize="10" fontFamily="monospace">20</text>
              <text x="25" y="205" fill="#6b7280" fontSize="10" fontFamily="monospace">0</text>

              {/* Area 1: Green (Infrastructure) */}
              <path
                d="M 50 180 Q 150 130 250 185 T 450 190 T 670 140 L 670 210 L 50 210 Z"
                fill="url(#gradGreen)"
              />
              <path
                d="M 50 180 Q 150 130 250 185 T 450 190 T 670 140"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_6px_#10b981]"
              />

              {/* Area 2: Cyan (Injured People) */}
              <path
                d="M 50 140 Q 150 110 250 125 T 380 95 T 520 120 T 670 110 L 670 210 L 50 210 Z"
                fill="url(#gradCyan)"
              />
              <path
                d="M 50 140 Q 150 110 250 125 T 380 95 T 520 120 T 670 110"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_8px_#06b6d4]"
              />

              {/* Area 3: Blue (Use of Resources) */}
              <path
                d="M 50 90 Q 150 60 250 80 T 400 90 T 550 65 T 670 70 L 670 210 L 50 210 Z"
                fill="url(#gradBlue)"
              />
              <path
                d="M 50 90 Q 150 60 250 80 T 400 90 T 550 65 T 670 70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_8px_#3b82f6]"
              />

              {/* Highlight Cursor Line at Thurs (x=380) */}
              <line
                x1="380"
                y1="30"
                x2="380"
                y2="210"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Highlight Nodes */}
              <circle cx="380" cy="95" r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="380" cy="155" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Tooltip Badge at Peak Point */}
            <div className="absolute top-2 left-[50%] -translate-x-1/2 px-3 py-1 bg-[#162938] border border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded-lg shadow-lg shadow-cyan-500/20">
              5.987,37
            </div>

            {/* X Axis Day Labels */}
            <div className="flex justify-between px-10 text-[11px] text-zinc-400 font-medium pt-2">
              <span>Mon</span>
              <span>Tues</span>
              <span>Wed</span>
              <span className="text-cyan-400 font-bold">Thurs</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* 2. Resource Distribution and Utilization (4 cols) */}
        <div className="lg:col-span-4 bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base tracking-tight text-white">
              Resource distribution and utilization
            </h3>
            <Info className="w-4 h-4 text-zinc-500" />
          </div>

          <div className="flex items-center gap-4 text-xs pt-1">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
              On the way
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Engaged
            </span>
          </div>

          {/* 3D Volumetric Isometric Bar Chart */}
          <div className="h-56 flex items-end justify-between px-3 pt-6">
            {[
              { month: 'Jan', height1: 45, height2: 15 },
              { month: 'Feb', height1: 65, height2: 30 },
              { month: 'Mar', height1: 75, height2: 40 },
              { month: 'Apr', height1: 90, height2: 60 },
            ].map(col => (
              <div key={col.month} className="flex flex-col items-center gap-2">
                {/* 3D Isometric Bar Column */}
                <div className="relative w-12 flex flex-col items-center justify-end" style={{ height: '160px' }}>
                  {/* Outer / Back Bar (Darker emerald) */}
                  <div
                    className="w-10 rounded-t-md bg-gradient-to-t from-emerald-900 to-emerald-700/80 border border-emerald-500/30 transition-all duration-700"
                    style={{ height: `${col.height1}%` }}
                  />

                  {/* Inner / Foreground Bar (Lighter mint 3D isometric block) */}
                  <div
                    className="absolute bottom-0 w-8 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] border-t border-emerald-200 transition-all duration-700"
                    style={{ height: `${col.height2}%` }}
                  />
                </div>

                <span className="text-xs font-mono text-zinc-400">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Predictive Analytics Models (6 cols) */}
        <div className="lg:col-span-6 bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base tracking-tight text-white">
              Predictive Analytics Models
            </h3>
            <Info className="w-4 h-4 text-zinc-500" />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              High-rise buildings
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
              Private houses
            </span>
          </div>

          {/* Sine Wave Frequency Curves */}
          <div className="relative h-44 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
              {/* Y Axis gridlines */}
              {[20, 60, 100, 140].map(y => (
                <line key={y} x1="30" y1={y} x2="490" y2={y} stroke="#262930" strokeWidth="1" strokeDasharray="3 3" />
              ))}

              {/* Predictive Sine Wave 1 */}
              <path
                d="M 30 70 C 90 90, 150 140, 210 50 C 270 120, 330 60, 390 110 L 490 80"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_6px_#06b6d4]"
              />

              {/* Predictive Sine Wave 2 */}
              <path
                d="M 30 110 C 90 120, 150 150, 210 90 C 270 140, 330 90, 390 140 L 490 110"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Highlight Pin at x=210 */}
              <line x1="210" y1="20" x2="210" y2="150" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="210" cy="50" r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Tag 1.987,11 */}
            <div className="absolute top-1 left-[39%] px-2.5 py-0.5 bg-[#0f2d3d] border border-cyan-400 text-cyan-300 text-[11px] font-mono font-bold rounded shadow-md">
              1.987,11
            </div>
          </div>
        </div>

        {/* 4. Heat Map (6 cols) */}
        <div className="lg:col-span-6 bg-[#141518]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base tracking-tight text-white">
              Heat map
            </h3>
            <Info className="w-4 h-4 text-zinc-500" />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Most dangerous
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Dangerously
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Moderately dangerous
            </span>
          </div>

          {/* Regional Vector Map with Glowing Risk Rings */}
          <div className="relative h-44 w-full bg-[#101114] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
            {/* Ambient Map Outlines */}
            <svg className="w-full h-full opacity-30" viewBox="0 0 400 200">
              <path
                d="M 50 150 Q 80 120 120 140 T 200 130 T 280 140 T 360 120"
                fill="none"
                stroke="#4b5563"
                strokeWidth="1.5"
              />
              <path
                d="M 90 60 Q 140 40 220 50 T 310 70"
                fill="none"
                stroke="#4b5563"
                strokeWidth="1.5"
              />
            </svg>

            {/* Glowing Danger Nodes */}
            {[
              { x: '25%', y: '40%', color: 'border-rose-500 text-rose-400 bg-rose-500/20' },
              { x: '35%', y: '65%', color: 'border-amber-500 text-amber-400 bg-amber-500/20' },
              { x: '45%', y: '35%', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/20' },
              { x: '60%', y: '50%', color: 'border-rose-500 text-rose-400 bg-rose-500/20' },
              { x: '70%', y: '70%', color: 'border-amber-500 text-amber-400 bg-amber-500/20' },
              { x: '82%', y: '30%', color: 'border-rose-500 text-rose-400 bg-rose-500/20' },
            ].map((node, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: node.x, top: node.y }}
              >
                <div className={`w-6 h-6 rounded-full border ${node.color} animate-ping absolute opacity-60`} />
                <div className={`w-3.5 h-3.5 rounded-full border-2 ${node.color} shadow-lg`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CloudWatch EMF Operational Metrics (Preserved backend telemetry) */}
      <div className="mt-8 space-y-3">
        <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
          CloudWatch EMF Production Telemetry (Authoritative AWS Layer)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="bg-[#141518]/80 border border-white/5 rounded-2xl p-4 space-y-2"
            >
              <span className="text-xs text-zinc-400 font-medium">{m.title}</span>
              <p className="text-xl font-bold font-mono text-white">{m.value}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                {m.status === 'healthy' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{m.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Check, Loader2, HeartPulse, Activity, Zap } from 'lucide-react';

export const LoadPlanningCard: React.FC = () => {
  const items = [
    {
      id: 'item-1',
      title: 'Trauma Kit Alpha-1',
      type: 'Grade IV Hemostatic Dressings & Chest Seals',
      status: 'Verified',
      icon: HeartPulse,
      badgeClass: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'item-2',
      title: 'Zoll X-Series ALS Monitor',
      type: '12-Lead ECG / Pacer & Pulse Oximetry',
      status: 'Telemetry Live',
      icon: Activity,
      badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      isScanning: true,
    },
    {
      id: 'item-3',
      title: 'Hamilton T1 Ventilator',
      type: 'ICU Transport Vent · O2 Manifold 98%',
      status: 'Ready',
      icon: Zap,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
  ];

  return (
    <div className="bg-[#141518]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-zinc-200 tracking-wide font-sans">
          Medical Equipment Readiness
        </h4>
        <span className="text-[11px] text-cyan-400 font-mono font-bold">3 Manifests Verified</span>
      </div>

      <div className="space-y-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1c20]/70 border border-white/5 hover:border-cyan-500/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{item.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[170px]">{item.type}</p>
                </div>
              </div>

              <span
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeClass}`}
              >
                {item.isScanning ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Check className="w-2.5 h-2.5" />
                )}
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

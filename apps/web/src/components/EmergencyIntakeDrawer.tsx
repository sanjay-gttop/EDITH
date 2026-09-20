import React, { useState } from 'react';
import {
  Shield,
  Flame,
  Ambulance,
  ChevronDown,
} from 'lucide-react';

interface EmergencyIntakeDrawerProps {
  onDispatch?: (data: {
    unitType: string;
    incidentType: string;
    problemNotes: string;
    victims: string;
    aggressors: string;
    dangerLevel: number;
  }) => void;
  onClose?: () => void;
}

export const EmergencyIntakeDrawer: React.FC<EmergencyIntakeDrawerProps> = ({
  onDispatch,
  onClose,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'Police' | 'Fire' | 'Rescue'>('Police');
  const [incidentType, setIncidentType] = useState('Assault');
  const [problemNotes, setProblemNotes] = useState('Assault with sharp weapon');
  const [victims, setVictims] = useState<'No one' | '1-4' | '5-9' | 'Over 10'>('1-4');
  const [aggressors, setAggressors] = useState<'Single' | '2-4' | '5-9' | 'Over 10'>('2-4');
  const [dangerLevel, setDangerLevel] = useState<number>(38); // 0 to 100

  const getDangerLabel = (val: number) => {
    if (val < 25) return 'Minimal Risk';
    if (val < 50) return 'Below Average';
    if (val < 75) return 'High Hazard';
    return 'Critical Catastrophe';
  };

  const handleSend = () => {
    if (onDispatch) {
      onDispatch({
        unitType: selectedUnit,
        incidentType,
        problemNotes,
        victims,
        aggressors,
        dangerLevel,
      });
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-[#16152b]/95 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl p-6 shadow-[0_20px_60px_rgba(10,8,30,0.9)] text-white space-y-5">
      {/* 1. Which unit to send? */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">
          Which unit to send?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'Police', icon: Shield, label: 'Police' },
            { id: 'Fire', icon: Flame, label: 'Fire' },
            { id: 'Rescue', icon: Ambulance, label: 'Rescue' },
          ].map(unit => {
            const Icon = unit.icon;
            const isSelected = selectedUnit === unit.id;
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnit(unit.id as any)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#3b2d71] text-white border border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-[#1e1c38] text-zinc-400 border border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{unit.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Type of incident */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">
          Type of incident
        </label>
        <div className="relative">
          <select
            value={incidentType}
            onChange={e => setIncidentType(e.target.value)}
            className="w-full appearance-none bg-[#1e1c38] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/60 transition-colors"
          >
            <option value="Assault">Assault</option>
            <option value="Cardiac Distress">Cardiac Distress / Trauma</option>
            <option value="Building Collapse">Building Collapse / Entrapment</option>
            <option value="Mass Casualty">Mass Casualty Incident</option>
            <option value="Hazmat Incident">Hazmat Chemical Release</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* 3. What is the problem? */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">
          What is the problem?
        </label>
        <input
          type="text"
          value={problemNotes}
          onChange={e => setProblemNotes(e.target.value)}
          placeholder="Describe triage assessment..."
          className="w-full bg-[#1e1c38] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/60 transition-colors placeholder:text-zinc-500"
        />
      </div>

      {/* 4. How much victims? */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">
          How much victims?
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['No one', '1-4', '5-9', 'Over 10'] as const).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setVictims(opt)}
              className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
                victims === opt
                  ? 'bg-[#3b2d71] text-white border border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                  : 'bg-[#1e1c38] text-zinc-400 border border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 5. How much aggressors? */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">
          How much aggressors?
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['Single', '2-4', '5-9', 'Over 10'] as const).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setAggressors(opt)}
              className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
                aggressors === opt
                  ? 'bg-[#3b2d71] text-white border border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                  : 'bg-[#1e1c38] text-zinc-400 border border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Rate the danger level */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Rate the danger level</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={dangerLevel}
            onChange={e => setDangerLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#252247] rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>

        <p className="text-center text-[11px] font-medium text-indigo-300 tracking-wide">
          {getDangerLabel(dangerLevel)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2"
        >
          Back to Details
        </button>

        <button
          type="button"
          onClick={handleSend}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-bold text-xs shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-emerald-glow"
        >
          Send Units
        </button>
      </div>
    </div>
  );
};

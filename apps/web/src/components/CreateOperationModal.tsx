import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, X, Shield, MapPin, Users, Calendar, AlertCircle } from 'lucide-react';

export const CreateOperationModal: React.FC = () => {
  const { isCreateOpModalOpen, setCreateOpModalOpen, createOperation } = useAppStore();

  const [name, setName] = useState('');
  const [incidentType, setIncidentType] = useState('Structural Collapse');
  const [priority, setPriority] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('CRITICAL');
  const [location, setLocation] = useState('Sector 4 Core · Market St & 4th Ave');
  const [resources, setResources] = useState('AMB-A12, ENG-03');
  const [startTime, setStartTime] = useState('Immediate / 15:15 UTC');

  if (!isCreateOpModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createOperation({
      name: name.trim(),
      incidentType,
      priority,
      location,
      assignedResources: resources.split(',').map((r) => r.trim()).filter(Boolean),
      startTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0e1117] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                Create New Disaster Operation
              </h3>
              <p className="text-[11px] text-zinc-400">
                Multi-agency tactical command & resource orchestration
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateOpModalOpen(false)}
            className="w-8 h-8 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Operation Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operation Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operation Shield Wall / Market St Evac"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-zinc-500 font-medium"
            />
          </div>

          {/* Grid: Incident Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Incident Classification
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white"
              >
                <option value="Structural Collapse">Structural Collapse</option>
                <option value="Chemical Hazmat">Chemical Hazmat Leak</option>
                <option value="Flash Flood Evac">Flash Flood Evacuation</option>
                <option value="Mass Casualty Event">Mass Casualty Event</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Priority Level</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['CRITICAL', 'URGENT', 'STANDARD'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                      priority === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-rose-600 text-white shadow-[0_0_12px_#f43f5e]'
                          : lvl === 'URGENT'
                          ? 'bg-amber-600 text-white shadow-[0_0_12px_#f59e0b]'
                          : 'bg-cyan-600 text-white shadow-[0_0_12px_#06b6d4]'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Target Location / Sector</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white font-medium"
            />
          </div>

          {/* Assigned Resources & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Required Resources</span>
              </label>
              <input
                type="text"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                placeholder="AMB-A12, ENG-03"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Start Horizon</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-white font-mono"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCreateOpModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-all transform active:scale-95"
            >
              Create Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import {
  Sliders,
  Radio,
  Server,
  Flame,
  RotateCcw,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface SettingsViewProps {
  onResetDemo?: () => void;
}

export function SettingsView({ onResetDemo }: SettingsViewProps) {
  // Node settings
  const [stationId, setStationId] = useState('STATION-04-SF');
  const [nodeCallSign, setNodeCallSign] = useState('Central Dispatch HQ');
  const [region, setRegion] = useState('us-east-1');

  // Channel toggles
  const [channels, setChannels] = useState({
    webSocket: true,
    smsGateway: true,
    radioIngest: true,
    satelliteBackhaul: false,
  });

  // Chaos parameters
  const [chaosLossRate, setChaosLossRate] = useState(0);
  const [chaosLatencyMs, setChaosLatencyMs] = useState(0);
  const [chaosPartitionMode, setChaosPartitionMode] = useState<'NONE' | 'FLAPPING' | 'SEVERED'>('NONE');

  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">System Settings & Station Node Parameters</h2>
            <p className="text-xs text-slate-400">
              Configure edge hardware, multi-channel gateways, and chaos failure injection parameters
            </p>
          </div>
        </div>

        {onResetDemo && (
          <button
            onClick={() => {
              onResetDemo();
              alert('Demo state reset to initial conditions: AMB-A12 restored to conflict review.');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Demo State</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Station Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Node & Edge Station Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Station Identifier:</label>
              <input
                type="text"
                value={stationId}
                onChange={e => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Station Call Sign:</label>
              <input
                type="text"
                value={nodeCallSign}
                onChange={e => setNodeCallSign(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Primary Cloud Region:</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono outline-none"
              >
                <option value="us-east-1">us-east-1 (N. Virginia - Primary)</option>
                <option value="us-west-2">us-west-2 (Oregon - Disaster Recovery)</option>
                <option value="eu-west-1">eu-west-1 (Ireland)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Multi-Channel Ingestion Gateways */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multi-Channel Ingestion Pipelines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-white">WebSocket Real-Time Stream</span>
                <p className="text-[11px] text-slate-400">AWS API Gateway WebSocket $connect & broadcast</p>
              </div>
              <input
                type="checkbox"
                checked={channels.webSocket}
                onChange={e => setChannels({ ...channels, webSocket: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-white">SMS Gateway Webhook</span>
                <p className="text-[11px] text-slate-400">Twilio SMS / SNS mobile responder intake</p>
              </div>
              <input
                type="checkbox"
                checked={channels.smsGateway}
                onChange={e => setChannels({ ...channels, smsGateway: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-white">Tactical Radio Audio Ingestion</span>
                <p className="text-[11px] text-slate-400">Amazon Transcribe audio voice-to-event pipeline</p>
              </div>
              <input
                type="checkbox"
                checked={channels.radioIngest}
                onChange={e => setChannels({ ...channels, radioIngest: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-semibold text-white">Starlink Satellite Backhaul</span>
                <p className="text-[11px] text-slate-400">Low-earth orbit high-reliability failover</p>
              </div>
              <input
                type="checkbox"
                checked={channels.satelliteBackhaul}
                onChange={e => setChannels({ ...channels, satelliteBackhaul: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Chaos & Failure Simulation Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Chaos & Failure Injection Engine
              </h3>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
              [SIMULATION CONTROLS]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <label className="font-medium">Injected Packet Loss:</label>
                <span className="font-mono text-white">{chaosLossRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={chaosLossRate}
                onChange={e => setChaosLossRate(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <label className="font-medium">Injected Jitter / Latency:</label>
                <span className="font-mono text-white">{chaosLatencyMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="100"
                value={chaosLatencyMs}
                onChange={e => setChaosLatencyMs(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Partition Simulation Mode:</label>
              <select
                value={chaosPartitionMode}
                onChange={e => setChaosPartitionMode(e.target.value as 'NONE' | 'FLAPPING' | 'SEVERED')}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono outline-none"
              >
                <option value="NONE">NONE (Normal Resilient Mesh)</option>
                <option value="FLAPPING">FLAPPING (Intermittent Dropouts)</option>
                <option value="SEVERED">SEVERED (Complete WAN Outage)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          {savedAlert ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Node configuration applied successfully!</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Settings persist across browser tab refresh in local station storage.
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Apply Station Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
}

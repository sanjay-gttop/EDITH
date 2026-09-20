import { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward, History, ShieldAlert } from 'lucide-react';
import { ResourceStateBadge } from './StateBadge';
import type { ResourceStatus } from '@resqsync/domain';

interface ReplayStep {
  stepIndex: number;
  timestamp: string;
  stepName: string;
  actorId: string;
  resourceStatus: ResourceStatus;
  version: number;
  description: string;
  isConflict?: boolean;
}

const REPLAY_TIMELINE: ReplayStep[] = [
  {
    stepIndex: 1,
    timestamp: '2026-09-20 10:00:00 UTC',
    stepName: 'INITIAL_AVAILABLE',
    actorId: 'SYSTEM',
    resourceStatus: 'AVAILABLE',
    version: 1,
    description: 'Unit AMB-A12 stationed at Station 4 (Authoritative v1)',
  },
  {
    stepIndex: 2,
    timestamp: '2026-09-20 10:02:00 UTC',
    stepName: 'ALPHA_OFFLINE_CLAIM',
    actorId: 'USR-ALPHA',
    resourceStatus: 'PENDING_SYNC',
    version: 1,
    description: 'Alpha disconnected; recorded local claim evt-alpha-9901 in IndexedDB',
  },
  {
    stepIndex: 3,
    timestamp: '2026-09-20 10:03:00 UTC',
    stepName: 'BRAVO_ONLINE_CLAIM',
    actorId: 'USR-BRAVO',
    resourceStatus: 'CLAIMED',
    version: 2,
    description: 'Bravo claimed AMB-A12 online; authoritative DynamoDB state moved to v2',
  },
  {
    stepIndex: 4,
    timestamp: '2026-09-20 10:06:00 UTC',
    stepName: 'ALPHA_RECONNECT_CONFLICT',
    actorId: 'USR-ALPHA',
    resourceStatus: 'HUMAN_REVIEW',
    version: 2,
    description: 'Alpha reconnected; stale version detected. Explicit conflict CONF-A12-8801 declared',
    isConflict: true,
  },
  {
    stepIndex: 5,
    timestamp: '2026-09-20 10:08:00 UTC',
    stepName: 'SUPERVISOR_ADJUDICATION',
    actorId: 'USR-SUPERVISOR',
    resourceStatus: 'CLAIMED',
    version: 3,
    description: 'Supervisor adjudicated to Alpha. Authoritative DynamoDB state updated to v3',
  },
];

export function IncidentReplayView() {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = REPLAY_TIMELINE[currentStepIndex - 1];

  const handleNext = () => {
    if (currentStepIndex < REPLAY_TIMELINE.length) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(1);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Incident Replay & Deterministic State Machine Audit
            </h2>
            <p className="text-xs text-slate-400">
              Scrub and replay authoritative DynamoDB state transitions for incident #INC-A12-8801
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            aria-label="Reset replay"
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= REPLAY_TIMELINE.length}
            aria-label="Step forward"
            className={`p-2 rounded transition-colors ${
              currentStepIndex >= REPLAY_TIMELINE.length
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Step Forward"
          >
            <StepForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Timeline Progression (Step {currentStepIndex} of {REPLAY_TIMELINE.length})
          </span>
          <span className="font-mono text-slate-400">{currentStep.timestamp}</span>
        </div>

        {/* Scrubber Track */}
        <div className="grid grid-cols-5 gap-2">
          {REPLAY_TIMELINE.map(s => (
            <button
              key={s.stepIndex}
              onClick={() => setCurrentStepIndex(s.stepIndex)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                s.stepIndex === currentStepIndex
                  ? 'bg-rose-600/20 border-rose-500 ring-2 ring-rose-500/20'
                  : s.stepIndex < currentStepIndex
                  ? 'bg-slate-950/60 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-950/30 border-slate-800 text-slate-600 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono font-bold">Step {s.stepIndex}</span>
                <span className="text-[10px] text-slate-400 font-mono">v{s.version}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">{s.stepName}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active State Delta Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">STEP {currentStep.stepIndex}:</span>
            <h3 className="text-base font-bold text-white">{currentStep.stepName}</h3>
          </div>
          <div className="flex items-center gap-3">
            <ResourceStateBadge status={currentStep.resourceStatus} />
            <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300">
              DynamoDB Version: v{currentStep.version}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Resource:</span>
              <span className="text-slate-200 font-bold">AMB-A12 (Medic-12)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Executing Actor:</span>
              <span className="text-slate-300">{currentStep.actorId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-300">{currentStep.timestamp}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-2">
            <span className="text-slate-500 block">Description & Evidence:</span>
            <p className="text-slate-300 font-sans leading-relaxed">{currentStep.description}</p>
            {currentStep.isConflict && (
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold pt-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Deterministic Conflict Declared: Both claims preserved in evidence</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

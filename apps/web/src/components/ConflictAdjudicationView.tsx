import { useState } from 'react';
import type { UserRole } from '@resqsync/domain';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Wifi,
  WifiOff,
  UserCheck,
} from 'lucide-react';

interface ConflictAdjudicationProps {
  userRole: UserRole;
  onResolved?: (winner: 'ALPHA' | 'BRAVO', notes: string) => void;
}

export function ConflictAdjudicationView({ userRole, onResolved }: ConflictAdjudicationProps) {
  const [resolutionStatus, setResolutionStatus] = useState<'DETECTED' | 'UNDER_REVIEW' | 'RESOLVED'>('DETECTED');
  const [winningClaim, setWinningClaim] = useState<'ALPHA' | 'BRAVO' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState(
    'Alpha field unit has 3 code-red triage patients requiring immediate transport. Bravo rerouted to unit AMB-C08.',
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canResolve = userRole === 'SUPERVISOR' || userRole === 'ADMINISTRATOR';

  const handleResolve = (action: 'ASSIGN_TO_ALPHA' | 'ASSIGN_TO_BRAVO' | 'REQUEST_INFORMATION') => {
    if (!canResolve) {
      setStatusMessage('Error: Only SUPERVISOR or ADMINISTRATOR roles can resolve conflicts.');
      return;
    }

    if (action === 'REQUEST_INFORMATION') {
      setResolutionStatus('UNDER_REVIEW');
      setStatusMessage('Conflict status set to UNDER_REVIEW. Additional field telemetry requested.');
      return;
    }

    const winner = action === 'ASSIGN_TO_ALPHA' ? 'ALPHA' : 'BRAVO';
    setWinningClaim(winner);
    setResolutionStatus('RESOLVED');
    setStatusMessage(
      `Conflict CONF-A12-8801 successfully resolved: Assigned to ${winner}. Authoritative state updated to v3. All competing evidence preserved.`,
    );
    if (onResolved) {
      onResolved(winner, resolutionNotes);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                resolutionStatus === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {resolutionStatus === 'RESOLVED' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Conflict Adjudication: Unit AMB-A12 (Medic-12)
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  ID: CONF-A12-8801
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                    resolutionStatus === 'RESOLVED'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      : resolutionStatus === 'UNDER_REVIEW'
                      ? 'bg-sky-900/60 text-sky-300 border border-sky-700'
                      : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                  }`}
                >
                  {resolutionStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Signature Scenario: Concurrent claim competition between offline field unit and online dispatch.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-mono block">Detected: 2026-09-20 10:06:00 UTC</span>
            <span className="text-xs text-slate-400 font-medium">Authoritative State: v2 (Stale conflict)</span>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`text-xs p-3 rounded border flex items-center gap-2 ${
              resolutionStatus === 'RESOLVED'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-sky-950/40 border-sky-800 text-sky-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Evidence Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claim Alpha */}
        <div
          className={`bg-slate-900 border rounded-lg p-5 space-y-4 relative transition-all ${
            winningClaim === 'ALPHA'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          {winningClaim === 'ALPHA' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded font-bold border border-emerald-500/30">
              <UserCheck className="w-3.5 h-3.5" />
              <span>AWARDED ALLOCATION</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Claim Alpha</span>
                <span className="text-xs font-normal text-slate-400 font-mono">(claim-alpha-01)</span>
              </h3>
              <span className="text-xs text-amber-400 font-medium">Offline Disconnected Triage</span>
            </div>
          </div>

          <div className="text-xs space-y-2 bg-slate-950/70 p-3 rounded border border-slate-800/80 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Actor:</span>
              <span className="text-slate-200 font-semibold">USR-ALPHA (Team Alpha)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Device:</span>
              <span className="text-slate-300">DEV-TAB-ALPHA (Field Tablet)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client Event ID:</span>
              <span className="text-slate-300">evt-alpha-9901</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client Timestamp:</span>
              <span className="text-slate-300">2026-09-20 10:02:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Server Sync Time:</span>
              <span className="text-slate-300">2026-09-20 10:06:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Observed Version:</span>
              <span className="text-amber-400 font-bold">v1 (Stale)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Incident ID:</span>
              <span className="text-slate-300">INC-ALPHA-401</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded border border-slate-800/60 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">Field Clinical Assessment:</span>
            <p className="text-slate-300 italic">
              "Offline triage at Sector 4. Three critical trauma patients categorized Code Red. Immediate extraction required."
            </p>
          </div>
        </div>

        {/* Claim Bravo */}
        <div
          className={`bg-slate-900 border rounded-lg p-5 space-y-4 relative transition-all ${
            winningClaim === 'BRAVO'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          {winningClaim === 'BRAVO' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded font-bold border border-emerald-500/30">
              <UserCheck className="w-3.5 h-3.5" />
              <span>AWARDED ALLOCATION</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Claim Bravo</span>
                <span className="text-xs font-normal text-slate-400 font-mono">(claim-bravo-02)</span>
              </h3>
              <span className="text-xs text-sky-400 font-medium">Online Live Central Dispatch</span>
            </div>
          </div>

          <div className="text-xs space-y-2 bg-slate-950/70 p-3 rounded border border-slate-800/80 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Actor:</span>
              <span className="text-slate-200 font-semibold">USR-BRAVO (Team Bravo)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Device:</span>
              <span className="text-slate-300">DEV-STATION-BRAVO (HQ Console)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client Event ID:</span>
              <span className="text-slate-300">evt-bravo-9902</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client Timestamp:</span>
              <span className="text-slate-300">2026-09-20 10:03:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Server Sync Time:</span>
              <span className="text-slate-300">2026-09-20 10:03:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Observed Version:</span>
              <span className="text-sky-400 font-bold">v1 → v2 (Authoritative)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Incident ID:</span>
              <span className="text-slate-300">INC-BRAVO-402</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded border border-slate-800/60 text-xs">
            <span className="text-slate-400 font-semibold block mb-1">Dispatch Incident Assessment:</span>
            <p className="text-slate-300 italic">
              "Online dispatch for respiratory arrest patient in zone 2. Unit Medic-12 assigned at version 2."
            </p>
          </div>
        </div>
      </div>

      {/* Timeline of Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Immutable Conflict Timeline & Evidence Preservation
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
            <span className="font-mono text-slate-500 shrink-0">10:00:00 UTC</span>
            <span className="text-slate-300">Unit AMB-A12 available at station (Authoritative v1)</span>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
            <span className="font-mono text-slate-500 shrink-0">10:02:00 UTC</span>
            <span className="text-amber-300">
              Alpha disconnected, created local claim <code>evt-alpha-9901</code> in IndexedDB (observed v1)
            </span>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
            <span className="font-mono text-slate-500 shrink-0">10:03:00 UTC</span>
            <span className="text-sky-300">
              Bravo claimed AMB-A12 online; authoritative DynamoDB state moved to v2
            </span>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
            <span className="font-mono text-slate-500 shrink-0">10:06:00 UTC</span>
            <span className="text-slate-300">Alpha reconnected and uploaded sync batch with event log</span>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
            <span className="font-mono text-slate-500 shrink-0">10:06:00 UTC</span>
            <span className="text-rose-400 font-semibold">
              Conflict detected: Competing claims preserved in CONF-A12-8801. Neither claim overwritten.
            </span>
          </div>
        </div>
      </div>

      {/* Human Resolution Decision Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Supervisor Adjudication Console
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active Role: <strong className="text-rose-400">{userRole}</strong>
          </span>
        </div>

        {/* RBAC Notice */}
        {!canResolve ? (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded p-3 text-xs text-amber-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Role Access Restricted (403 Forbidden Simulation):</p>
              <p>
                Resolving conflicts requires <strong>SUPERVISOR</strong> or <strong>ADMINISTRATOR</strong> authority. Current role is <code>{userRole}</code>. Switch role in top navigation bar to test resolution.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded p-3 text-xs text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Authorized: You have <strong>{userRole}</strong> privileges to adjudicate this resource conflict.
            </p>
          </div>
        )}

        {/* Adjudication Notes */}
        <div className="space-y-1.5">
          <label htmlFor="res-notes" className="text-xs font-semibold text-slate-300">
            Supervisor Rationale & Audit Trail Notes:
          </label>
          <textarea
            id="res-notes"
            rows={2}
            value={resolutionNotes}
            onChange={e => setResolutionNotes(e.target.value)}
            disabled={!canResolve || resolutionStatus === 'RESOLVED'}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            placeholder="Document reason for allocation decision..."
          />
        </div>

        {/* Decision Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleResolve('ASSIGN_TO_ALPHA')}
            disabled={!canResolve || resolutionStatus === 'RESOLVED'}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition-colors ${
              !canResolve || resolutionStatus === 'RESOLVED'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            <span>Assign to Alpha (Field Triage)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleResolve('ASSIGN_TO_BRAVO')}
            disabled={!canResolve || resolutionStatus === 'RESOLVED'}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition-colors ${
              !canResolve || resolutionStatus === 'RESOLVED'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
            }`}
          >
            <span>Assign to Bravo (Online Dispatch)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleResolve('REQUEST_INFORMATION')}
            disabled={!canResolve || resolutionStatus === 'RESOLVED'}
            className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              !canResolve || resolutionStatus === 'RESOLVED'
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Request Information</span>
          </button>
        </div>
      </div>
    </div>
  );
}

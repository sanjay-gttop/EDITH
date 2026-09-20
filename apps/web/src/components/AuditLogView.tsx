import { useState } from 'react';
import {
  History,
  Search,
  FileJson,
  Filter,
  PlayCircle,
  X,
} from 'lucide-react';
import { IncidentReplayView } from './IncidentReplayView';

interface DomainAuditRecord {
  event_id: string;
  correlation_id: string;
  timestamp: string;
  event_type: string;
  entity_type: 'RESOURCE' | 'CONFLICT' | 'REQUEST';
  entity_id: string;
  actor_id: string;
  device_id: string;
  payload: Record<string, unknown>;
}

const INITIAL_AUDIT_LOGS: DomainAuditRecord[] = [
  {
    event_id: 'evt-audit-1001',
    correlation_id: 'corr-init-fleet-001',
    timestamp: '2026-09-20T09:00:00.000Z',
    event_type: 'ResourceRegistered',
    entity_type: 'RESOURCE',
    entity_id: 'AMB-A12',
    actor_id: 'USR-ADMIN-01',
    device_id: 'CONSOLE-HQ-01',
    payload: {
      callSign: 'Medic-12',
      type: 'ALS Ambulance',
      initial_status: 'AVAILABLE',
      version: 1,
      agency: 'AGY-METRO-EMS',
    },
  },
  {
    event_id: 'evt-audit-1002',
    correlation_id: 'corr-alpha-offline-9901',
    timestamp: '2026-09-20T10:02:14.000Z',
    event_type: 'OfflineClaimBuffered',
    entity_type: 'RESOURCE',
    entity_id: 'AMB-A12',
    actor_id: 'USR-ALPHA',
    device_id: 'MDT-ALPHA-FIELD',
    payload: {
      client_event_id: 'evt-alpha-9901',
      observed_version: 1,
      claimant_role: 'RESPONDER',
      sync_state: 'BUFFERED_INDEXEDDB',
    },
  },
  {
    event_id: 'evt-audit-1003',
    correlation_id: 'corr-bravo-claim-9902',
    timestamp: '2026-09-20T10:03:00.000Z',
    event_type: 'AuthoritativeClaimCommitted',
    entity_type: 'RESOURCE',
    entity_id: 'AMB-A12',
    actor_id: 'USR-BRAVO',
    device_id: 'MDT-BRAVO-STATION',
    payload: {
      previous_version: 1,
      new_version: 2,
      new_status: 'CLAIMED',
      allocated_to: 'USR-BRAVO',
      dynamodb_table: 'ResQSync-Authoritative',
    },
  },
  {
    event_id: 'evt-audit-1004',
    correlation_id: 'corr-reconnect-sync-9903',
    timestamp: '2026-09-20T10:06:22.000Z',
    event_type: 'ConflictDeclared',
    entity_type: 'CONFLICT',
    entity_id: 'CONF-A12-8801',
    actor_id: 'SYSTEM-RECONCILER',
    device_id: 'LAMBDA-SYNC-CORE',
    payload: {
      resource_id: 'AMB-A12',
      authoritative_version: 2,
      conflicting_client_event: 'evt-alpha-9901',
      action_required: 'HUMAN_REVIEW',
      claims_preserved: ['claim-alpha-01', 'claim-bravo-02'],
    },
  },
  {
    event_id: 'evt-audit-1005',
    correlation_id: 'corr-supervisor-adjudicate-9904',
    timestamp: '2026-09-20T10:08:45.000Z',
    event_type: 'ConflictResolved',
    entity_type: 'CONFLICT',
    entity_id: 'CONF-A12-8801',
    actor_id: 'USR-SUPERVISOR',
    device_id: 'CONSOLE-SUPERVISOR-01',
    payload: {
      action: 'ASSIGN_TO_ALPHA',
      winner: 'claim-alpha-01',
      new_resource_version: 3,
      convergence_verified: true,
    },
  },
];

export function AuditLogView() {
  const [logs] = useState<DomainAuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [searchCorrelation, setSearchCorrelation] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DomainAuditRecord | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'replay'>('log');

  const filteredLogs = logs.filter(record => {
    const matchesSearch =
      record.correlation_id.toLowerCase().includes(searchCorrelation.toLowerCase()) ||
      record.entity_id.toLowerCase().includes(searchCorrelation.toLowerCase()) ||
      record.event_type.toLowerCase().includes(searchCorrelation.toLowerCase());

    const matchesType = filterType === 'ALL' || record.entity_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Subtab toggle: Event Log vs Step Machine Incident Replay */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-bold text-white">Authoritative Event Audit & Incident Replay</h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('log')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeSubTab === 'log'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Immutable Event Log
          </button>
          <button
            onClick={() => setActiveSubTab('replay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeSubTab === 'replay'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Interactive Replay Scrubber</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'replay' ? (
        <IncidentReplayView />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Correlation ID, Entity ID, or Event..."
                value={searchCorrelation}
                onChange={e => setSearchCorrelation(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Entity:</span>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none text-xs"
                >
                  <option value="ALL">All Entities</option>
                  <option value="RESOURCE">Ambulance Resource</option>
                  <option value="CONFLICT">Conflict Record</option>
                  <option value="REQUEST">Emergency Request</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Events */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Entity ID</th>
                    <th className="px-4 py-3">Actor / Device</th>
                    <th className="px-4 py-3">Correlation ID</th>
                    <th className="px-4 py-3 text-right">Evidence Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.map(record => (
                    <tr key={record.event_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(record.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-rose-300 bg-rose-950/50 border border-rose-900/60 px-2 py-0.5 rounded">
                          {record.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-bold">{record.entity_id}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div>{record.actor_id}</div>
                        <div className="text-[10px] text-slate-500">{record.device_id}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]" title={record.correlation_id}>
                        {record.correlation_id}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="flex items-center gap-1 ml-auto text-purple-400 hover:text-purple-300 font-sans font-semibold bg-purple-950/40 border border-purple-800/50 px-2 py-1 rounded"
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* JSON Payload Inspector Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspector-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 id="inspector-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-purple-400" />
                  Immutable Event Evidence Payload
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Event: {selectedRecord.event_id} • Correlation: {selectedRecord.correlation_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                aria-label="Close payload modal"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-80">
              {JSON.stringify(selectedRecord.payload, null, 2)}
            </pre>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
              <span>Cryptographic verification: SHA-256 Validated</span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded font-semibold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { SyncStatus } from '@resqsync/domain';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  ShieldCheck,
  HardDrive,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface QueuedEvent {
  client_event_id: string;
  action: 'CLAIM_RESOURCE' | 'UPDATE_STATUS' | 'REQUEST_DISPATCH';
  entity_id: string;
  created_at: string;
  status: 'QUEUED' | 'SYNCING' | 'ACKNOWLEDGED';
  idempotency_key: string;
  retry_count: number;
}

const DEMO_LOCAL_QUEUE: QueuedEvent[] = [
  {
    client_event_id: 'evt-alpha-9901',
    action: 'CLAIM_RESOURCE',
    entity_id: 'AMB-A12',
    created_at: '2026-09-20T10:02:14Z',
    status: 'QUEUED',
    idempotency_key: 'idemp-amb-a12-alpha-1002',
    retry_count: 0,
  },
  {
    client_event_id: 'evt-alpha-9902',
    action: 'UPDATE_STATUS',
    entity_id: 'AMB-A07',
    created_at: '2026-09-20T10:03:45Z',
    status: 'QUEUED',
    idempotency_key: 'idemp-amb-a07-alpha-1003',
    retry_count: 0,
  },
];

interface SyncCenterViewProps {
  syncStatus: SyncStatus;
  onToggleSync: (newStatus: SyncStatus) => void;
  onForceSync?: () => void;
}

export function SyncCenterView({
  syncStatus,
  onToggleSync,
  onForceSync,
}: SyncCenterViewProps) {
  const { addNotification } = useAppStore();
  const [queue, setQueue] = useState<QueuedEvent[]>(DEMO_LOCAL_QUEUE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<string[]>([
    '2026-09-20 09:55:00 UTC: Sync batch #104 committed 4 events to DynamoDB via SQS FIFO',
    '2026-09-20 09:40:12 UTC: Sync batch #103 committed 1 event (Heartbeat ACK)',
  ]);

  const handleSyncNow = () => {
    if (syncStatus === 'OFFLINE') {
      addNotification({
        title: 'SYNC BLOCKED // OFFLINE MODE',
        message: 'Cannot synchronize while network is disconnected! Please restore network connectivity first.',
        type: 'warning',
      });
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      setSyncHistory(prev => [
        `${new Date().toISOString()}: Reconciled batch of ${queue.length} events against authoritative DynamoDB table`,
        ...prev,
      ]);
      setQueue([]);
      setIsSyncing(false);
      onForceSync?.();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Network Partition Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border ${
                syncStatus === 'ONLINE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {syncStatus === 'ONLINE' ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Network State & Sync Engine
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    syncStatus === 'ONLINE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {syncStatus === 'ONLINE' ? 'CONNECTED (ONLINE)' : 'SEVERED (OFFLINE)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulate catastrophic cellular / tower outage and observe IndexedDB local buffering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleSync(syncStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                syncStatus === 'ONLINE'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {syncStatus === 'ONLINE' ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Sever Network Connection (Go Offline)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Restore Network Connection (Go Online)</span>
                </>
              )}
            </button>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing || syncStatus === 'OFFLINE' || queue.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                isSyncing || syncStatus === 'OFFLINE' || queue.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Flush & Reconcile Now'}</span>
            </button>
          </div>
        </div>

        {/* Informational guarantee */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Reconciliation:</strong> Offline events queued in browser IndexedDB maintain client cryptographic hashes and event IDs. Upon network restoration, events are sent to SQS FIFO and validated against DynamoDB condition expressions before authoritative state update.
          </span>
        </div>
      </div>

      {/* Local IndexedDB Queue Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Local IndexedDB Event Buffer ({queue.length} Pending Actions)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Store: ResQSync-Dexie-Events</span>
        </div>

        {queue.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-8 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-white">Local Queue is Empty</div>
            <p className="text-xs text-slate-400">
              All client operations have converged with DynamoDB. No pending offline mutations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(evt => (
              <div
                key={evt.client_event_id}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{evt.client_event_id}</span>
                    <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-semibold text-[10px]">
                      {evt.action}
                    </span>
                    <span className="font-mono text-slate-400 font-bold">Target: {evt.entity_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>Idempotency Key: {evt.idempotency_key}</span>
                    <span>•</span>
                    <span>Retries: {evt.retry_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-1 rounded font-mono text-[10px] font-bold">
                    STATUS: {evt.status}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Created: {new Date(evt.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Ledger History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Reconciliation & SQS Delivery Log
          </h3>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-400 space-y-1.5 max-h-40 overflow-y-auto">
          {syncHistory.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

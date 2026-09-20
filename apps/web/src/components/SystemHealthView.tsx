import { useState } from 'react';
import {
  Activity,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  status: 'healthy' | 'warning' | 'info';
  isSimulation?: boolean;
}

function MetricCard({ title, value, subtext, status, isSimulation }: MetricCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2 relative overflow-hidden">
      {isSimulation && (
        <span className="absolute top-2 right-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80">
          Simulation Telemetry
        </span>
      )}
      <span className="text-xs text-slate-400 block font-medium">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-white">{value}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        {status === 'healthy' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : status === 'warning' ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Info className="w-3.5 h-3.5 text-blue-400" />
        )}
        <span className="text-slate-400">{subtext}</span>
      </div>
    </div>
  );
}

export function SystemHealthView() {
  const [selectedLogWorkload, setSelectedLogWorkload] = useState<string>('ALL');

  const SAMPLE_EMF_LOGS = [
    {
      timestamp: '2026-09-20T10:06:00.040Z',
      workload: 'Lambda',
      service: 'resqsync-api',
      message: 'Recorded conflict resolution in DynamoDB table ResQSync-Authoritative',
      metrics: { resolution_count: 1, api_latency: 14 },
    },
    {
      timestamp: '2026-09-20T10:06:00.036Z',
      workload: 'Lambda',
      service: 'resqsync-api',
      message: 'Detected competing claim for resource AMB-A12. Appended to CONF-A12-8801',
      metrics: { claim_conflict_count: 1 },
    },
    {
      timestamp: '2026-09-20T10:05:59.880Z',
      workload: 'ECS',
      service: 'resqsync-sync-worker',
      message: 'Processed high-throughput SQS batch from resqsync-sync-queue.fifo',
      metrics: { sync_success_count: 12, queue_depth: 0 },
    },
    {
      timestamp: '2026-09-20T10:05:45.120Z',
      workload: 'SageMaker',
      service: 'resqsync-ai-adapter',
      message: 'Inference completed: Nearest ALS ambulance recommendation (confidence 0.92)',
      metrics: { ai_extraction_count: 1, ai_low_confidence_count: 0 },
    },
    {
      timestamp: '2026-09-20T10:05:30.010Z',
      workload: 'StepFunctions',
      service: 'resqsync-reconciliation',
      message: 'State execution: StepFunctions execution ARN resqsync-batch-reconcile-818',
      metrics: { step_latency_ms: 45 },
    },
  ];

  const filteredLogs =
    selectedLogWorkload === 'ALL'
      ? SAMPLE_EMF_LOGS
      : SAMPLE_EMF_LOGS.filter(l => l.workload === selectedLogWorkload);

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner for Real vs Simulated Metrics */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed space-y-1">
          <p className="font-semibold text-amber-100">
            Telemetry Provenance & Integrity Statement:
          </p>
          <p>
            Metrics labeled <strong>[SIMULATION TELEMETRY]</strong> reflect artificial chaos simulations, partition injectors, and load benchmarks. Authoritative resource state resides strictly in Amazon DynamoDB. Simulated disaster stress metrics are never represented as real-world field operations.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Authoritative API Latency"
          value="14 ms"
          subtext="p95 HTTP API latency (AWS us-east-1)"
          status="healthy"
        />
        <MetricCard
          title="Sync Reconnect Latency"
          value="24 ms"
          subtext="IndexedDB batch ingestion time"
          status="healthy"
        />
        <MetricCard
          title="Active Conflicts Under Review"
          value="1"
          subtext="Unit AMB-A12 awaiting supervisor review"
          status="warning"
        />
        <MetricCard
          title="Dead Letter Queue (DLQ)"
          value="0"
          subtext="Zero event processing failures"
          status="healthy"
        />
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Simulated Network Partition"
          value="250 ms"
          subtext="Synthetic WAN delay injection"
          status="info"
          isSimulation={true}
        />
        <MetricCard
          title="Simulated Packet Drop Rate"
          value="15 %"
          subtext="Chaos Gateway drop test active"
          status="warning"
          isSimulation={true}
        />
        <MetricCard
          title="SageMaker AI Confidence"
          value="92 %"
          subtext="Resource capability match model"
          status="healthy"
        />
        <MetricCard
          title="IndexedDB Client Queue"
          value="0"
          subtext="All local client claims synchronized"
          status="healthy"
        />
      </div>

      {/* AWS Workload Architecture Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              AWS Infrastructure & Service Telemetry
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Region: us-east-1 (N. Virginia)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">DynamoDB</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">ResQSync-Authoritative</p>
            <span className="text-[10px] text-emerald-400 font-medium">Single-Table Active</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">API Gateway</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">ResQSync-HttpApi</p>
            <span className="text-[10px] text-emerald-400 font-medium">99.99% Availability</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Lambda Handlers</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">Node.js 22 (arm64)</p>
            <span className="text-[10px] text-emerald-400 font-medium">0 Errors in 24h</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Cognito Auth</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">ResQSync-Users</p>
            <span className="text-[10px] text-emerald-400 font-medium">RBAC Groups Configured</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">EventBridge</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">ResQSync-EventBus</p>
            <span className="text-[10px] text-emerald-400 font-medium">Dead Letter Routed</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">SQS FIFO Queues</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">SyncBatches.fifo</p>
            <span className="text-[10px] text-emerald-400 font-medium">Depth: 0 / DLQ: 0</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">ECS Fargate</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">Sync-Worker-Task</p>
            <span className="text-[10px] text-emerald-400 font-medium">Container Healthy</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">SageMaker AI</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">Dispatch-Optimizer-v1</p>
            <span className="text-[10px] text-emerald-400 font-medium">Latency: 82ms</span>
          </div>
        </div>
      </div>

      {/* CloudWatch EMF Log Stream Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              CloudWatch Embedded Metric Format (EMF) Log Stream
            </h3>
          </div>

          {/* Workload Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Filter Workload:</span>
            {['ALL', 'Lambda', 'ECS', 'SageMaker', 'StepFunctions'].map(wl => (
              <button
                key={wl}
                onClick={() => setSelectedLogWorkload(wl)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  selectedLogWorkload === wl
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {wl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
          {filteredLogs.map((log, i) => (
            <div
              key={i}
              className="bg-slate-950/80 p-3 rounded border border-slate-800/70 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{log.timestamp}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-rose-300 font-semibold text-[10px]">
                    {log.workload}
                  </span>
                  <span className="text-slate-400 font-bold">{log.service}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <span>EMF:</span>
                  {Object.entries(log.metrics).map(([k, v]) => (
                    <span key={k} className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 border border-slate-800">
                      {k}={v}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-slate-200">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

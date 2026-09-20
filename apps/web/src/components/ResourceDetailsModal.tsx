import type { ResourceStatus } from '@resqsync/domain';
import { ResourceStateBadge } from './StateBadge';
import { X, Ambulance, ShieldCheck } from 'lucide-react';

export interface ResourceDetailsData {
  id: string;
  callSign: string;
  type: string;
  status: ResourceStatus;
  location: string;
  version: number;
  agencyId?: string;
  assignedActorId?: string | null;
  assignedIncidentId?: string | null;
  coordinates?: { latitude: number; longitude: number };
  equipment?: string[];
}

interface ResourceDetailsModalProps {
  resource: ResourceDetailsData | null;
  onClose: () => void;
  onClaim?: (resourceId: string) => void;
  isOnline: boolean;
}

export function ResourceDetailsModal({
  resource,
  onClose,
  onClaim,
  isOnline,
}: ResourceDetailsModalProps) {
  if (!resource) return null;

  const isAvailable = resource.status === 'AVAILABLE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <h2 id="resource-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
                <span>{resource.callSign}</span>
                <span className="text-xs font-mono text-slate-400">({resource.id})</span>
              </h2>
              <p className="text-xs text-slate-400">{resource.type} • {resource.agencyId || 'AGY-METRO-EMS'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge & Version */}
        <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 text-[11px] block">Current State</span>
            <ResourceStateBadge status={resource.status} />
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[11px] block">Authoritative Version</span>
            <span className="text-sm font-mono font-bold text-rose-400">v{resource.version}</span>
          </div>
        </div>

        {/* Telemetry Details */}
        <div className="space-y-2 text-xs bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/80 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Physical Location:</span>
            <span className="text-slate-200">{resource.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">GPS Coordinates:</span>
            <span className="text-slate-300">
              {resource.coordinates
                ? `${resource.coordinates.latitude.toFixed(4)}, ${resource.coordinates.longitude.toFixed(4)}`
                : '37.7749° N, 122.4194° W'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Actor:</span>
            <span className="text-slate-300">{resource.assignedActorId || 'None (Unallocated)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Incident:</span>
            <span className="text-slate-300">{resource.assignedIncidentId || 'None'}</span>
          </div>
        </div>

        {/* Equipment & Capability */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Equipment & Readiness:</span>
          <div className="flex flex-wrap gap-1.5">
            {['12-Lead ECG Defibrillator', 'Ventilator', 'Advanced Airway Kit', 'Telemetry Modem', 'Hazmat PPE'].map(eq => (
              <span key={eq} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {eq}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authoritative DynamoDB Single-Table State</span>
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            {isAvailable && (
              <button
                onClick={() => {
                  if (onClaim) onClaim(resource.id);
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {isOnline ? 'Claim Online' : 'Claim Locally (Queued)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

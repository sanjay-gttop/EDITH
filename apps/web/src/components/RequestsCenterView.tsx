import { useState } from 'react';
import type { Request, IncidentSeverity, Channel } from '@resqsync/domain';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  PlusCircle,
  Radio,
  Send,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface RequestsCenterViewProps {
  onDispatchResource?: (requestId: string, resourceId: string) => void;
}

const INITIAL_REQUESTS: Request[] = [
  {
    request_id: 'REQ-911-001',
    incident_id: 'INC-SFO-881',
    severity: 'CRITICAL',
    location: { latitude: 37.7749, longitude: -122.4194 },
    reporting_channel: 'API',
    status: 'PENDING',
    assigned_resource_id: null,
    notes: 'Multi-vehicle collision on 4th & Market St. Multiple entrapments reported, ALS required.',
    created_at: '2026-09-20T10:14:00Z',
    updated_at: '2026-09-20T10:14:00Z',
  },
  {
    request_id: 'REQ-911-002',
    incident_id: 'INC-SFO-882',
    severity: 'URGENT',
    location: { latitude: 37.7833, longitude: -122.4167 },
    reporting_channel: 'WEB',
    status: 'DISPATCHED',
    assigned_resource_id: 'AMB-C08',
    notes: 'Elderly cardiac distress call. Oxygen and monitor dispatched with Rescue-08.',
    created_at: '2026-09-20T10:05:00Z',
    updated_at: '2026-09-20T10:08:00Z',
  },
  {
    request_id: 'REQ-911-003',
    incident_id: 'INC-SFO-883',
    severity: 'STANDARD',
    location: { latitude: 37.769, longitude: -122.4467 },
    reporting_channel: 'SMS',
    status: 'PENDING',
    assigned_resource_id: null,
    notes: 'Non-ambulatory fall injury at residential home. BLS required.',
    created_at: '2026-09-20T10:20:00Z',
    updated_at: '2026-09-20T10:20:00Z',
  },
  {
    request_id: 'REQ-911-004',
    incident_id: 'INC-SFO-884',
    severity: 'NON_EMERGENCY',
    location: { latitude: 37.755, longitude: -122.42 },
    reporting_channel: 'WEB',
    status: 'FULFILLED',
    assigned_resource_id: 'AMB-D15',
    notes: 'Minor laceration treated on scene. Patient released.',
    created_at: '2026-09-20T09:45:00Z',
    updated_at: '2026-09-20T10:00:00Z',
  },
];

export function RequestsCenterView({ onDispatchResource }: RequestsCenterViewProps) {
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // New Request Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('CRITICAL');
  const [newChannel, setNewChannel] = useState<Channel>('WEB');
  const [newNotes, setNewNotes] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes.trim()) return;

    const newReq: Request = {
      request_id: `REQ-${Date.now().toString().slice(-4)}`,
      incident_id: `INC-${Date.now().toString().slice(-4)}`,
      severity: newSeverity,
      location: { latitude: 37.7749, longitude: -122.4194 },
      reporting_channel: newChannel,
      status: 'PENDING',
      assigned_resource_id: null,
      notes: newNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRequests([newReq, ...requests]);
    setNewNotes('');
    setNewAddress('');
    setShowCreateModal(false);
  };

  const handleAssignResource = (requestId: string, resourceId: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.request_id === requestId
          ? { ...r, status: 'DISPATCHED', assigned_resource_id: resourceId, updated_at: new Date().toISOString() }
          : r
      )
    );
    setShowAiModal(false);
    setSelectedRequest(null);
    onDispatchResource?.(requestId, resourceId);
  };

  const filteredRequests = requests.filter(r => {
    if (filterSeverity === 'ALL') return true;
    return r.severity === filterSeverity;
  });

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="bg-rose-950/80 text-rose-300 border border-rose-800 text-[11px] font-bold px-2 py-0.5 rounded">CRITICAL</span>;
      case 'URGENT':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">URGENT</span>;
      case 'STANDARD':
        return <span className="bg-blue-950/80 text-blue-300 border border-blue-800 text-[11px] font-bold px-2 py-0.5 rounded">STANDARD</span>;
      case 'NON_EMERGENCY':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">NON_EMERGENCY</span>;
    }
  };

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-900/40 text-amber-300 border border-amber-700/60 text-[10px] px-2 py-0.5 rounded font-mono">PENDING</span>;
      case 'DISPATCHED':
        return <span className="bg-blue-900/40 text-blue-300 border border-blue-700/60 text-[10px] px-2 py-0.5 rounded font-mono">DISPATCHED</span>;
      case 'FULFILLED':
        return <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 text-[10px] px-2 py-0.5 rounded font-mono">FULFILLED</span>;
      case 'CANCELLED':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">CANCELLED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Emergency Request Intake & Triage
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {requests.length} Active Calls
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-channel intake (Web, Radio Transcripts, SMS Gateway) backed by Amazon SageMaker Dispatch AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs text-slate-400">
            <span>Filter:</span>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-transparent text-slate-200 outline-none text-xs"
              aria-label="Filter requests by severity"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="URGENT">Urgent Only</option>
              <option value="STANDARD">Standard Only</option>
              <option value="NON_EMERGENCY">Non-Emergency Only</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Emergency Call</span>
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map(req => (
          <div
            key={req.request_id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{req.request_id}</span>
                  <span className="text-xs text-slate-500 font-mono">({req.incident_id})</span>
                  {getSeverityBadge(req.severity)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-slate-500" />
                    Channel: <strong className="text-slate-300 font-mono">{req.reporting_channel}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div>{getStatusBadge(req.status)}</div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              {req.notes}
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {req.location.latitude.toFixed(4)}, {req.location.longitude.toFixed(4)}
                </span>
                {req.assigned_resource_id && (
                  <span className="ml-2 font-mono text-emerald-400 font-semibold">
                    Assigned: {req.assigned_resource_id}
                  </span>
                )}
              </div>

              {req.status === 'PENDING' ? (
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowAiModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Dispatch Assist</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Dispatched
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Dispatch Assistant Modal */}
      {showAiModal && selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="ai-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                    SageMaker Dispatch Assistant
                    <span className="text-[10px] bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded font-mono">
                      Model: Dispatch-v1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Incident: {selectedRequest.incident_id} ({selectedRequest.request_id})</p>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-gradient-to-br from-purple-950/30 to-slate-950 border border-purple-800/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold uppercase tracking-wide">
                  Top Recommended Unit:
                </span>
                <span className="bg-purple-900/60 text-purple-200 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                  92% Match Confidence
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded border border-purple-900/40">
                <div>
                  <div className="text-sm font-bold text-white">AMB-A12 (Medic-12)</div>
                  <div className="text-xs text-slate-400">ALS Ambulance • Station 4, Central District</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-400 font-bold">~6 min ETA</div>
                  <div className="text-[10px] text-slate-500">2.1 miles away</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-slate-200">AI Triage Rationale:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Call notes describe multiple entrapments requiring Advanced Life Support (ALS) capabilities. AMB-A12 is currently at Station 4 with highest proximity score and specialized extraction equipment.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignResource(selectedRequest.request_id, 'AMB-A12')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Accept Recommendation & Dispatch AMB-A12</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <form
            onSubmit={handleCreateRequest}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between">
              <h3 id="create-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Ingest Emergency Request
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Severity Triage:</label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Code 3 ALS - Immediate Threat)</option>
                  <option value="URGENT">URGENT (Urgent Medical Attention)</option>
                  <option value="STANDARD">STANDARD (Standard Transport / BLS)</option>
                  <option value="NON_EMERGENCY">NON_EMERGENCY (Non-Urgent / First Aid)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Intake Channel:</label>
                <select
                  value={newChannel}
                  onChange={e => setNewChannel(e.target.value as Channel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="WEB">WEB (Dispatcher Console)</option>
                  <option value="API">API (Automated / Radio Transcript Ingest)</option>
                  <option value="SMS">SMS (Automated Mobile Webhook)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Incident Location / Address:</label>
                <input
                  type="text"
                  placeholder="e.g. 101 California St, San Francisco"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Incident Description / Triage Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Describe patient symptoms, entrapped individuals, safety hazards..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

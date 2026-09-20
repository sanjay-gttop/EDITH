import React, { useEffect } from 'react';
import { useAppStore, type AppNotification } from '../stores/useAppStore';
import {
  CheckCircle2,
  AlertTriangle,
  Radio,
  Info,
  ShieldAlert,
  X,
  Bell,
  Clock,
} from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const {
    notifications,
    dismissNotification,
    clearNotifications,
    isNotificationsPanelOpen,
    setNotificationsPanelOpen,
  } = useAppStore();

  // Active unread / recent toast items (top 3 for floating toasts)
  const activeToasts = notifications.slice(0, 3);

  return (
    <>
      {/* 1. Floating Slide-in Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3">
        {activeToasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissNotification(toast.id)}
          />
        ))}
      </div>

      {/* 2. Notification Center History Drawer / Popover */}
      {isNotificationsPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-[#0e1117] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Disaster Notifications</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {notifications.length} logged tactical signals
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearNotifications}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded hover:bg-white/5 transition-colors"
                >
                  Mark read
                </button>
                <button
                  onClick={() => setNotificationsPanelOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto tactical-scrollbar p-4 space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No active tactical notifications.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      notif.type === 'dispatch'
                        ? 'bg-cyan-950/30 border-cyan-500/30'
                        : notif.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : notif.type === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/30'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ToastIcon type={notif.type} />
                        <span className="font-bold text-xs text-white font-mono">
                          {notif.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed pl-6">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-[11px] text-zinc-400 text-center font-mono bg-black/40">
              ResQSync Real-Time Telemetry Stream · US-East-1
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ToastItem: React.FC<{
  toast: AppNotification;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const borderColor =
    toast.type === 'dispatch'
      ? 'border-cyan-400/60 shadow-[0_0_24px_rgba(6,182,212,0.4)]'
      : toast.type === 'success'
      ? 'border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
      : toast.type === 'critical'
      ? 'border-rose-400/60 shadow-[0_0_24px_rgba(244,63,94,0.4)]'
      : 'border-white/20 shadow-xl';

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl bg-[#0e1117]/95 backdrop-blur-xl border ${borderColor} text-white shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top-3 fade-in duration-300 transition-all`}
    >
      <div className="flex items-start gap-3">
        <ToastIcon type={toast.type} />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs tracking-tight font-mono text-zinc-100">
              {toast.title}
            </h4>
            <span className="text-[10px] text-zinc-400 font-mono">{toast.timestamp}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-snug">{toast.message}</p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="w-5 h-5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ToastIcon: React.FC<{ type: AppNotification['type'] }> = ({ type }) => {
  switch (type) {
    case 'dispatch':
      return (
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_10px_#22d3ee]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
        </div>
      );
    case 'success':
      return (
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 shadow-[0_0_10px_#10b981]">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      );
    case 'critical':
      return (
        <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shrink-0 mt-0.5 shadow-[0_0_10px_#f43f5e]">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
      );
    case 'warning':
      return (
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
      );
  }
};

import {
  LayoutGrid,
  Map as MapIcon,
  Ambulance,
  PhoneCall,
  AlertOctagon,
  RefreshCw,
  BarChart3,
  History,
  Settings,
  Power,
} from 'lucide-react';
import type { NavTab } from '../stores/useAppStore';

interface SidebarDockProps {
  currentTab: NavTab | 'crisis_map' | 'operations';
  onSelectTab: (tab: any) => void;
  activeConflictCount?: number;
  offlineCount?: number;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  currentTab,
  onSelectTab,
  activeConflictCount = 1,
  offlineCount = 0,
}) => {
  const navItems = [
    {
      id: 'dispatch',
      label: 'Dispatch Board',
      icon: LayoutGrid,
    },
    {
      id: 'operations',
      label: 'Operations Unit HUD',
      icon: Ambulance,
      highlight: true,
    },
    {
      id: 'requests',
      label: 'Emergency Intake',
      icon: PhoneCall,
    },
    {
      id: 'crisis_map',
      label: 'Tactical Crisis Map',
      icon: MapIcon,
    },
    {
      id: 'system_health',
      label: 'System Health',
      icon: BarChart3,
    },
    {
      id: 'conflicts',
      label: 'Conflicts & Adjudication',
      icon: AlertOctagon,
      badge: activeConflictCount > 0 ? activeConflictCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'sync_center',
      label: 'Sync Center',
      icon: RefreshCw,
      badge: offlineCount > 0 ? offlineCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'audit',
      label: 'Audit & Replay',
      icon: History,
    },
  ];

  return (
    <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
      {/* Sleek Floating Dock Capsule */}
      <div className="flex flex-col items-center bg-[#131518]/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl shadow-black/80">
        {/* Brand / Logo Top Node: ResQSync */}
        <button
          onClick={() => onSelectTab('dispatch')}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl mb-2 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 border border-cyan-400/50 text-black font-black text-base shadow-[0_0_18px_rgba(34,211,238,0.6)] hover:scale-110 transition-all duration-300"
          title="ResQSync // Emergency Response Command"
        >
          <span className="font-mono tracking-tighter">R</span>
          <span className="absolute left-14 px-2.5 py-1 bg-black/95 text-[11px] text-cyan-300 font-bold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap border border-cyan-500/30 z-50 shadow-xl">
            ResQSync Command
          </span>
        </button>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-white/10 mb-2" />

        {/* Navigation Item Buttons */}
        <div className="flex flex-col items-center gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:scale-105'
                }`}
                aria-label={item.label}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {/* Badge Notification */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${item.badgeColor} text-[9px] font-bold text-white flex items-center justify-center shadow-md animate-pulse`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on Hover */}
                <div className="absolute left-14 px-2.5 py-1 bg-[#131518]/95 text-xs text-white rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all whitespace-nowrap border border-white/10 shadow-xl z-50 flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-white/10 my-2" />

        {/* Bottom System Utility Nodes */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onSelectTab('settings')}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
              currentTab === 'settings'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-black/90 text-xs text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50">
              System Settings & RBAC
            </span>
          </button>

          <button
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
            title="System Terminal"
          >
            <Power className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-black/90 text-xs text-rose-300 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50">
              Station Session
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

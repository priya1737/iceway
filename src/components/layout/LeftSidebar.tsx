import React from 'react';
import {
  Compass,
  Route as RouteIcon,
  Layers,
  Mountain,
  Waves,
  Ship,
  FileText,
  Activity,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { NavigationTab } from '../../types/navigation';

interface LeftSidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSystemStatus: () => void;
  onOpenSettings: () => void;
  icebergAlertCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenSystemStatus,
  onOpenSettings,
  icebergAlertCount,
}) => {
  const navItems = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: Compass, badge: null },
    { id: 'navigation' as NavigationTab, label: 'Navigation', icon: RouteIcon, badge: null },
    { id: 'seaice' as NavigationTab, label: 'Sea Ice', icon: Layers, badge: '34%' },
    { id: 'icebergs' as NavigationTab, label: 'Icebergs', icon: Mountain, badge: icebergAlertCount > 0 ? `${icebergAlertCount}` : null, badgeColor: 'bg-[#E05B5B]' },
    { id: 'weather' as NavigationTab, label: 'Weather & Ocean', icon: Waves, badge: null },
    { id: 'missions' as NavigationTab, label: 'Missions', icon: Ship, badge: null },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileText, badge: null },
  ];

  return (
    <aside
      className={`border-r border-[#1B2A35] bg-[#071018] flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-2 space-y-1">
        <div className="px-2 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#60737E] uppercase tracking-wider">
          {!isCollapsed && <span>Navigation Console</span>}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721] transition cursor-pointer ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-mono transition text-left cursor-pointer group relative ${
                  isActive
                    ? 'bg-[#0B1721] text-[#5DADE2] border border-[#1B2A35] shadow-inner font-medium'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721]/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#5DADE2]' : 'text-[#91A4AE] group-hover:text-[#E8F0F3]'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Badge alert indicator */}
                {item.badge && !isCollapsed && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : 'bg-[#152535] text-[#91A4AE] border border-[#1B2A35]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#5DADE2] rounded-r" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav Items: System Status & Settings */}
      <div className="p-2 border-t border-[#1B2A35] space-y-1">
        <button
          onClick={onOpenSystemStatus}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-mono text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721] transition cursor-pointer group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="System Status"
        >
          <Activity className="w-4 h-4 shrink-0 text-[#43C98B] group-hover:text-[#43C98B]" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>System Status</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B]" />
            </div>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-mono text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721] transition cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Configuration & Settings"
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Small operational notice in expanded mode */}
        {!isCollapsed && (
          <div className="pt-2 pb-1 px-3 text-[10px] font-mono text-[#60737E] leading-relaxed border-t border-[#1B2A35]/50">
            <div className="flex items-center justify-between">
              <span>ECDIS LINK</span>
              <span className="text-[#43C98B]">STANDBY</span>
            </div>
            <div className="text-[9px] text-[#60737E]/70 mt-0.5">IMO POLAR CODE CAT B</div>
          </div>
        )}
      </div>
    </aside>
  );
};

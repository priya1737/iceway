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
  X,
  Menu,
  Cpu,
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
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenSystemStatus,
  onOpenSettings,
  icebergAlertCount,
  mobileOpen = false,
  onCloseMobile,
  onOpenMobile,
}) => {
  const navItems = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: Compass, badge: null },
    { id: 'navigation' as NavigationTab, label: 'Navigation', icon: RouteIcon, badge: null },
    { id: 'engine' as NavigationTab, label: 'Processing Engine', icon: Cpu, badge: 'CORE', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' },
    { id: 'seaice' as NavigationTab, label: 'Sea Ice', icon: Layers, badge: '34%' },
    { id: 'icebergs' as NavigationTab, label: 'Icebergs', icon: Mountain, badge: icebergAlertCount > 0 ? `${icebergAlertCount}` : null, badgeColor: 'bg-[#E05B5B]' },
    { id: 'weather' as NavigationTab, label: 'Weather & Ocean', icon: Waves, badge: null },
    { id: 'missions' as NavigationTab, label: 'Missions', icon: Ship, badge: null },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileText, badge: null },
  ];

  return (
    <>
      {/* 1. Desktop Operational Sidebar (Hidden on mobile) */}
      <aside
        className={`hidden lg:flex border-r border-[#1B2A35] bg-[#071018] flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 font-mono ${
          isCollapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Top Nav Items */}
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 flex items-center justify-between text-[10px] text-[#60737E] uppercase tracking-wider">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition text-left cursor-pointer group relative ${
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721] transition cursor-pointer group ${
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721] transition cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Configuration & Settings"
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          {/* Small operational notice in expanded mode */}
          {!isCollapsed && (
            <div className="pt-2 pb-1 px-3 text-[10px] text-[#60737E] leading-relaxed border-t border-[#1B2A35]/50">
              <div className="flex items-center justify-between">
                <span>ECDIS LINK</span>
                <span className="text-[#43C98B]">STANDBY</span>
              </div>
              <div className="text-[9px] text-[#60737E]/70 mt-0.5">IMO POLAR CODE CAT B</div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Mobile Drawer Overlay (Slide-over for mobile) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex font-mono select-none">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#071018] border-r border-[#1B2A35] flex flex-col justify-between h-full shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="p-3 border-b border-[#1B2A35] flex items-center justify-between bg-[#0B1721]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#E8F0F3]">OPERATIONS CONSOLE</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav list */}
            <div className="p-2 space-y-1 overflow-y-auto flex-1">
              <div className="px-2 py-1 text-[10px] text-[#60737E] uppercase tracking-wider">
                Console Views
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#0B1721] text-[#5DADE2] border border-[#1B2A35] font-semibold'
                        : 'text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0B1721]/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5DADE2]' : 'text-[#91A4AE]'}`}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          item.badgeColor ? `${item.badgeColor} text-white` : 'bg-[#152535] text-[#91A4AE]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#1B2A35] space-y-1.5 bg-[#0B1721]/50">
              <button
                onClick={() => {
                  onOpenSystemStatus();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#43C98B]" />
                  System Status
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B]" />
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings & Safety Margin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (Persistent at bottom on screens < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071018]/95 backdrop-blur-md border-t border-[#1B2A35] px-1 py-1 flex items-center justify-around font-mono select-none">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer ${
            activeTab === 'overview' ? 'text-[#5DADE2]' : 'text-[#91A4AE] hover:text-[#E8F0F3]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Overview</span>
        </button>

        <button
          onClick={() => onTabChange('navigation')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer ${
            activeTab === 'navigation' ? 'text-[#5DADE2]' : 'text-[#91A4AE] hover:text-[#E8F0F3]'
          }`}
        >
          <RouteIcon className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Routes</span>
        </button>

        <button
          onClick={() => onTabChange('seaice')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer ${
            activeTab === 'seaice' ? 'text-[#5DADE2]' : 'text-[#91A4AE] hover:text-[#E8F0F3]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Sea Ice</span>
        </button>

        <button
          onClick={() => onTabChange('icebergs')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer relative ${
            activeTab === 'icebergs' ? 'text-[#5DADE2]' : 'text-[#91A4AE] hover:text-[#E8F0F3]'
          }`}
        >
          <Mountain className="w-4 h-4" />
          {icebergAlertCount > 0 && (
            <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-[#E05B5B] animate-ping" />
          )}
          <span className="text-[9px] mt-0.5 font-medium">Icebergs</span>
        </button>

        <button
          onClick={() => {
            if (onOpenMobile) {
              onOpenMobile();
            } else {
              onTabChange('weather');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded transition cursor-pointer ${
            activeTab === 'weather' || activeTab === 'missions' || activeTab === 'reports'
              ? 'text-[#5DADE2]'
              : 'text-[#91A4AE] hover:text-[#E8F0F3]'
          }`}
          title="Open all navigation views"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">All Views</span>
        </button>
      </nav>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ChevronDown, 
  Clock, 
  Wind, 
  Radio, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  Ship
} from 'lucide-react';
import { Mission, SimulationState } from '../../types/navigation';

interface TopHeaderProps {
  currentMission: Mission;
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
  simulation: SimulationState;
  onToggleSimulation: () => void;
  onSetSimulationStep: (step: 0 | 6 | 12 | 18 | 24) => void;
  onResetSimulation: () => void;
  onOpenVesselModal: () => void;
  onOpenSystemStatus: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentMission,
  missions,
  onSelectMission,
  simulation,
  onToggleSimulation,
  onSetSimulationStep,
  onResetSimulation,
  onOpenVesselModal,
  onOpenSystemStatus,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [missionDropdownOpen, setMissionDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-[#1B2A35] bg-[#071018] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand Identity & Operational Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          {/* Minimal geometric mark: Ice Shelf + Vessel Track */}
          <div className="w-8 h-8 rounded bg-[#0B1721] border border-[#1B2A35] flex items-center justify-center p-1 relative overflow-hidden group">
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              {/* Continental ice shelf contour */}
              <polygon points="2,28 14,24 22,27 30,22 30,30 2,30" fill="#203a4c" />
              <polyline points="2,28 14,24 22,27 30,22" stroke="#5DADE2" strokeWidth="1.5" strokeLinecap="round" />
              {/* Navigation route vector */}
              <path d="M4 8 L13 14 L22 11 L28 19" stroke="#43C98B" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="2 1.5" />
              {/* Destination waypoint / vessel node */}
              <circle cx="28" cy="19" r="2.2" fill="#5DADE2" />
              <circle cx="4" cy="8" r="1.8" fill="#43C98B" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-[#E8F0F3] text-sm leading-none">
                ICEWAY
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#43C98B]/10 text-[#43C98B] border border-[#43C98B]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B] animate-pulse" />
                OPERATIONAL
              </span>
            </div>
            <p className="text-[10px] text-[#91A4AE] tracking-wide uppercase font-mono">
              Antarctic Navigation & Decision Support
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-[#1B2A35] mx-1 hidden lg:block" />

        {/* Vessel Badge Quick Access */}
        <button
          onClick={onOpenVesselModal}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B1721] border border-[#1B2A35] hover:border-[#5DADE2]/50 hover:bg-[#122230] transition text-left cursor-pointer"
          title="Inspect RV Sagar bridge telemetry"
        >
          <Ship className="w-3.5 h-3.5 text-[#5DADE2]" />
          <div className="text-[11px] font-mono leading-none">
            <span className="text-[#E8F0F3] font-medium">RV Sagar</span>
            <span className="text-[#91A4AE] ml-1.5">12.4 kn · PC 5</span>
          </div>
        </button>
      </div>

      {/* Center: Mission Selector */}
      <div className="relative">
        <button
          onClick={() => setMissionDropdownOpen(!missionDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#0B1721] border border-[#1B2A35] hover:border-[#5DADE2]/50 transition text-xs font-mono text-[#E8F0F3] cursor-pointer"
        >
          <span className="text-[#5DADE2] text-[11px] font-semibold">MISSION</span>
          <span className="font-semibold tracking-wide text-sm">{currentMission.missionNumber.replace('MISSION ', '')}</span>
          <span className="text-[#91A4AE] font-normal truncate max-w-[140px] sm:max-w-[200px]">
            — {currentMission.title}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#91A4AE]" />
        </button>

        {missionDropdownOpen && (
          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-80 bg-[#0B1721] border border-[#1B2A35] rounded-md shadow-2xl p-1.5 z-50">
            <div className="px-2.5 py-1 text-[10px] font-mono text-[#60737E] uppercase tracking-wider border-b border-[#1B2A35] mb-1">
              Antarctic Mission Registry
            </div>
            {missions.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMission(m);
                  setMissionDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                  m.id === currentMission.id
                    ? 'bg-[#152535] text-[#5DADE2] font-medium'
                    : 'text-[#E8F0F3] hover:bg-[#122230]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{m.missionNumber}</span>
                    <span className="text-[10px] text-[#91A4AE]">— {m.destinationName}</span>
                  </div>
                  <p className="text-[10px] text-[#60737E] truncate max-w-[220px]">
                    {m.vesselName} · {m.objective.substring(0, 45)}...
                  </p>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono ${
                    m.status === 'Active'
                      ? 'bg-[#43C98B]/10 text-[#43C98B] border-[#43C98B]/30'
                      : m.status === 'Planned'
                      ? 'bg-[#E5B84B]/10 text-[#E5B84B] border-[#E5B84B]/30'
                      : 'bg-[#60737E]/10 text-[#91A4AE] border-[#1B2A35]'
                  }`}
                >
                  {m.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Simulation Toggle, Live Clock, Sync Status & Watch Officer */}
      <div className="flex items-center gap-3 font-mono">
        {/* Simulation Mode Toggle Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition cursor-pointer border ${
              simulation.active
                ? 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/50 hover:bg-[#E5B84B]/25'
                : 'bg-[#0B1721] text-[#91A4AE] border-[#1B2A35] hover:text-[#E8F0F3] hover:border-[#5DADE2]/40'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${simulation.active ? 'text-[#E5B84B] animate-spin' : ''}`} />
            <span className="font-semibold">SIMULATION</span>
            {simulation.active && (
              <span className="text-[10px] bg-[#E5B84B] text-[#071018] px-1 rounded font-bold">
                T+{String(simulation.timeStep).padStart(2, '0')}
              </span>
            )}
          </button>
        </div>

        {/* Live UTC Time */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1721] border border-[#1B2A35] text-xs text-[#E8F0F3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5DADE2]" />
          <span>{utcTime || '14:32:00 UTC'}</span>
        </div>

        {/* Data Sync Status */}
        <button
          onClick={onOpenSystemStatus}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1721] border border-[#1B2A35] hover:border-[#5DADE2]/50 text-xs text-[#91A4AE] hover:text-[#E8F0F3] transition cursor-pointer"
          title="Satellite SAR and ocean model sync status"
        >
          <Radio className="w-3.5 h-3.5 text-[#43C98B]" />
          <span className="text-[11px]">14:32 UTC</span>
          <span className="text-[9px] text-[#43C98B]">● SYNCED</span>
        </button>

        {/* Watch Officer / Station Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#1B2A35]">
          <div className="w-7 h-7 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-xs font-bold text-[#5DADE2]">
            SR
          </div>
          <div className="hidden 2xl:block text-left text-[10px] leading-tight">
            <div className="text-[#E8F0F3] font-medium">Lt. Cdr. S. Rao</div>
            <div className="text-[#60737E]">Bridge Watch I</div>
          </div>
        </div>
      </div>
    </header>
  );
};

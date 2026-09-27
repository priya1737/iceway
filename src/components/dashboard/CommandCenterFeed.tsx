import React, { useState } from 'react';
import { useApp, ActivityLog } from '../../context/AppContext';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Sliders,
  Plus,
  Trash2,
  Download,
  Filter,
  Radio,
  Zap,
} from 'lucide-react';

export const CommandCenterFeed: React.FC = () => {
  const {
    activityLogs,
    addActivityLog,
    clearActivityLogs,
    setRegisterIcebergModalOpen,
    setNewMissionModalOpen,
    setSensorCalibrationModalOpen,
    setExportModalOpen,
    setRecalculateModalOpen,
    addToast,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'critical' | 'warning' | 'info' | 'success'>('ALL');
  const [activeChartTab, setActiveChartTab] = useState<'ice' | 'fuel' | 'hazard' | 'baro'>('ice');

  const filteredLogs = activityLogs.filter((log) =>
    severityFilter === 'ALL' ? true : log.severity === severityFilter
  );

  const handleSimulateAlert = () => {
    const randomTypes = [
      {
        severity: 'critical' as const,
        source: 'RADAR' as const,
        message: 'Acoustic Sonar detected Growler fragment 0.4 NM off starboard bow.',
        details: 'Estimated mass 450t. Recommend 5° port rudder avoidance trim.',
      },
      {
        severity: 'warning' as const,
        source: 'SAR_SAT' as const,
        message: 'Fast-ice compression pressure surge detected in Prydz Bay lead.',
        details: 'Pressure index elevated to 0.42 MPa. Watch for ridge hummocking.',
      },
      {
        severity: 'info' as const,
        source: 'AUTOPILOT' as const,
        message: 'Optimal Doppler Heading aligned with 1.2 kn coastal current assist.',
        details: 'Fuel consumption reduced by 1.4 tons/day.',
      },
    ];

    const pick = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    addActivityLog(pick);
    addToast('Telemetry Event Ingested', pick.message, pick.severity === 'critical' ? 'error' : pick.severity);
  };

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs select-none">
      {/* 1. Quick-Action Shortcuts Bar */}
      <div className="p-2.5 rounded-xl bg-[#0B1721] border border-[#1B2A35] glass-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#60737E] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Quick Command Actions
          </span>
          <span className="text-[9px] text-[#60737E]">Bridge Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            onClick={() => setRecalculateModalOpen(true)}
            className="p-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            ⚡ Avoidance
          </button>
          <button
            onClick={() => setRegisterIcebergModalOpen(true)}
            className="p-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-amber-300 border border-amber-500/30 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            📡 Log Radar
          </button>
          <button
            onClick={() => setNewMissionModalOpen(true)}
            className="p-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            🧭 New Mission
          </button>
          <button
            onClick={() => setSensorCalibrationModalOpen(true)}
            className="p-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-violet-300 border border-violet-500/30 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            ⚖️ Calibrate
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="p-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-[#E8F0F3] border border-[#1B2A35] text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            📑 Export
          </button>
        </div>
      </div>

      {/* 2. Interactive Dynamic Telemetry Graphs Widget */}
      <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35] glass-card space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#1B2A35] pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-[#E8F0F3] uppercase font-bold tracking-wider">
              Dynamic Telemetry Graph
            </span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setActiveChartTab('ice')}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                activeChartTab === 'ice'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-[#60737E] hover:text-[#91A4AE]'
              }`}
            >
              Sea Ice
            </button>
            <button
              onClick={() => setActiveChartTab('fuel')}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                activeChartTab === 'fuel'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-[#60737E] hover:text-[#91A4AE]'
              }`}
            >
              Fuel Burn
            </button>
            <button
              onClick={() => setActiveChartTab('hazard')}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                activeChartTab === 'hazard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#60737E] hover:text-[#91A4AE]'
              }`}
            >
              Hazard Risk
            </button>
          </div>
        </div>

        {/* Dynamic SVG Visualizer */}
        <div className="h-28 w-full bg-[#071018] rounded-lg border border-[#1B2A35]/60 p-2 relative flex flex-col justify-between overflow-hidden">
          {activeChartTab === 'ice' && (
            <>
              <div className="flex justify-between text-[9px] text-[#60737E]">
                <span>Ice Concentration Along Waypoint Leg (0 - 562 km)</span>
                <span className="text-cyan-400 font-bold">Peak: 54% @ WP-04</span>
              </div>
              <svg viewBox="0 0 300 70" className="w-full h-16 overflow-visible">
                {/* Danger zone threshold */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#E05B5B" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                <text x="240" y="16" fill="#E05B5B" fontSize="7" opacity="0.8">CAUTION &gt;50%</text>

                {/* Curve */}
                <path
                  d="M 10 55 Q 60 50 110 38 T 210 22 T 290 45"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Gradient area */}
                <path
                  d="M 10 55 Q 60 50 110 38 T 210 22 T 290 45 L 290 70 L 10 70 Z"
                  fill="url(#cyanGradient)"
                  opacity="0.25"
                />
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Points */}
                <circle cx="10" cy="55" r="2.5" fill="#38bdf8" />
                <circle cx="110" cy="38" r="2.5" fill="#38bdf8" />
                <circle cx="210" cy="22" r="3.5" fill="#f59e0b" stroke="#071018" strokeWidth="1" />
                <circle cx="290" cy="45" r="2.5" fill="#38bdf8" />
              </svg>
              <div className="flex justify-between text-[8px] text-[#60737E]">
                <span>WP-01 (Departure)</span>
                <span>WP-03 (Prydz North)</span>
                <span>WP-05 (Bharati Ingress)</span>
              </div>
            </>
          )}

          {activeChartTab === 'fuel' && (
            <>
              <div className="flex justify-between text-[9px] text-[#60737E]">
                <span>Speed (kn) vs Fuel Consumption (Tons/Day)</span>
                <span className="text-emerald-400 font-bold">Optimal Eco: 11.8 kn</span>
              </div>
              <svg viewBox="0 0 300 70" className="w-full h-16 overflow-visible">
                <path
                  d="M 10 60 Q 90 52 160 42 T 250 20 T 290 8"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <circle cx="160" cy="42" r="3.5" fill="#34d399" stroke="#071018" strokeWidth="1" />
                <text x="145" y="32" fill="#34d399" fontSize="8" fontWeight="bold">12.4 kn / 22.8 t/d</text>
              </svg>
              <div className="flex justify-between text-[8px] text-[#60737E]">
                <span>8.0 kn (Idle)</span>
                <span>12.4 kn (Cruising)</span>
                <span>16.0 kn (Max Ice Ramming)</span>
              </div>
            </>
          )}

          {activeChartTab === 'hazard' && (
            <>
              <div className="flex justify-between text-[9px] text-[#60737E]">
                <span>Collision Proximity Density vs Time Horizon</span>
                <span className="text-amber-400 font-bold">Critical Peak: T+12h</span>
              </div>
              <svg viewBox="0 0 300 70" className="w-full h-16 overflow-visible">
                <path
                  d="M 10 58 Q 70 55 140 45 T 190 15 T 250 35 T 290 50"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <circle cx="190" cy="15" r="4" fill="#ef4444" stroke="#071018" strokeWidth="1.5" />
                <text x="175" y="10" fill="#ef4444" fontSize="8" fontWeight="bold">B-31 CPA 2.8 NM</text>
              </svg>
              <div className="flex justify-between text-[8px] text-[#60737E]">
                <span>T+00h (Now)</span>
                <span>T+12h (Closest Point)</span>
                <span>T+24h (Cleared)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Live Telemetry Activity Feed */}
      <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35] glass-card space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#1B2A35] pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-[#E8F0F3] uppercase font-bold tracking-wider">
              Operational Activity Feed
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSimulateAlert}
              className="px-2 py-0.5 rounded bg-[#152535] hover:bg-[#20364a] text-cyan-300 text-[10px] font-bold transition cursor-pointer"
              title="Inject realistic sensor event"
            >
              + Ingest Event
            </button>
            <button
              onClick={clearActivityLogs}
              className="p-1 rounded text-[#60737E] hover:text-red-400 transition cursor-pointer"
              title="Clear activity log"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1 text-[9px]">
          {(['ALL', 'critical', 'warning', 'info', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-1.5 py-0.5 rounded font-bold uppercase transition cursor-pointer ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-[#60737E] hover:text-[#91A4AE]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isCrit = log.severity === 'critical';
            const isWarn = log.severity === 'warning';
            const isSucc = log.severity === 'success';

            const borderClass = isCrit
              ? 'border-red-500/40 bg-red-950/20 text-red-300'
              : isWarn
              ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
              : isSucc
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
              : 'border-[#1B2A35] bg-[#071018] text-[#91A4AE]';

            return (
              <div
                key={log.id}
                className={`p-2 rounded-lg border transition ${borderClass}`}
              >
                <div className="flex items-center justify-between text-[9px] mb-1">
                  <span className="font-bold px-1 rounded bg-[#0B1721] border border-current">
                    {log.source}
                  </span>
                  <span className="text-[#60737E]">{log.timestamp}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#E8F0F3] leading-snug">
                  {log.message}
                </div>
                {log.details && (
                  <div className="text-[10px] text-[#91A4AE] mt-0.5 leading-tight">
                    {log.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

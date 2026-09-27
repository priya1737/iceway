import React, { useState } from 'react';
import {
  Iceberg,
  Vessel,
  ResearchStation,
  RouteOption,
  SimulationState,
} from '../../types/navigation';
import { AntarcticMap } from '../map/AntarcticMap';
import {
  Mountain,
  AlertTriangle,
  RotateCw,
  Eye,
  CheckCircle2,
  Compass,
  Radio,
  ArrowRight,
  ShieldAlert,
  Plus,
  Download,
  Trash2,
  Search,
} from 'lucide-react';
import { formatLatitude, formatLongitude } from '../../utils/geoProjection';
import { useApp } from '../../context/AppContext';

interface IcebergsViewProps {
  icebergs: Iceberg[];
  selectedIceberg: Iceberg | null;
  onSelectIceberg: (iceberg: Iceberg | null) => void;
  vessel: Vessel;
  stations: ResearchStation[];
  activeRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  simulation: SimulationState;
  seaIceConcentrationPct: number;
  onRecalculateRoute: () => void;
  onNavigateToNavigationTab: () => void;
}

export const IcebergsView: React.FC<IcebergsViewProps> = ({
  icebergs,
  selectedIceberg,
  onSelectIceberg,
  vessel,
  stations,
  activeRoute,
  alternativeRoutes,
  simulation,
  seaIceConcentrationPct,
  onRecalculateRoute,
  onNavigateToNavigationTab,
}) => {
  const { setRegisterIcebergModalOpen, exportIcebergs, deleteIceberg } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK' | 'PROXIMITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'targets' | 'map'>('targets');

  // Filter and search list
  const filteredIcebergs = icebergs.filter((berg) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!berg.name.toLowerCase().includes(q) && !berg.id.toLowerCase().includes(q) && !berg.type.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filter === 'HIGH_RISK') return berg.riskLevel === 'HIGH';
    if (filter === 'PROXIMITY') return (berg.proximityToRouteNm || 99) < 15;
    return true;
  });

  // Current active inspected iceberg
  const inspectedBerg = selectedIceberg || icebergs.find((b) => b.id === 'IB-1042') || icebergs[0];
  const hasRouteIntersection = (inspectedBerg?.proximityToRouteNm || 99) <= 3.0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#071018] font-mono">
      {/* Top Header Statistics Strip */}
      <div className="h-auto min-h-14 py-2 border-b border-[#1B2A35] bg-[#0B1721] px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-red-400 shrink-0">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#E8F0F3] leading-none">
              ICEBERG INTELLIGENCE & TRAJECTORY PREDICTION
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#91A4AE] mt-0.5 truncate max-w-[280px] sm:max-w-none">
              NIC / Sentinel-1 SAR Tracking · Hydrodynamic drift modeling with uncertainty corridor
            </p>
          </div>
        </div>

        {/* Header Actions & Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto max-w-full pb-1 md:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportIcebergs('csv')}
              className="px-2.5 py-1 rounded text-[11px] text-[#91A4AE] hover:text-[#E8F0F3] bg-[#071018] border border-[#1B2A35] flex items-center gap-1 transition cursor-pointer"
              title="Export Iceberg CSV"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setRegisterIcebergModalOpen(true)}
              className="px-2.5 py-1 rounded text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-500 flex items-center gap-1 shadow-md shadow-amber-950/40 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Log Contact</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#1B2A35] shrink-0" />

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-xs shrink-0">
            <div className="text-left shrink-0">
              <span className="text-[9px] text-[#60737E] uppercase block leading-none">
                TRACKED
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#E8F0F3] mt-0.5 block">{icebergs.length}</span>
            </div>
            <div className="text-left shrink-0">
              <span className="text-[9px] text-[#60737E] uppercase block leading-none">
                HIGH RISK
              </span>
              <span className="text-xs sm:text-sm font-bold text-red-400 mt-0.5 block">
                {icebergs.filter((i) => i.riskLevel === 'HIGH').length}
              </span>
            </div>
            <div className="text-left shrink-0">
              <span className="text-[9px] text-[#60737E] uppercase block leading-none">
                INTERSECTS
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5 block">
                {icebergs.filter((i) => (i.proximityToRouteNm || 99) <= 5.0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between p-1.5 bg-[#0B1721] border-b border-[#1B2A35] shrink-0 text-xs">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setMobileTab('targets')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'targets'
                ? 'bg-[#152535] text-cyan-400 border border-cyan-500/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Target Inspector ({filteredIcebergs.length})</span>
          </button>

          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'map'
                ? 'bg-[#152535] text-cyan-400 border border-cyan-500/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <span>Radar Map</span>
          </button>
        </div>
      </div>

      {/* Main Screen: Left Inspector Panel + Center/Right GIS Map */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Side: Iceberg Details & Trajectory Inspector */}
        <div
          className={`w-full lg:w-96 border-r border-[#1B2A35] bg-[#071018] flex flex-col h-full overflow-y-auto shrink-0 text-xs ${
            mobileTab === 'targets' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-[#1B2A35] bg-[#0B1721]/50 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#60737E] absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search iceberg ID or type..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] placeholder-[#60737E] focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#60737E] uppercase font-semibold">FILTER:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    filter === 'ALL'
                      ? 'bg-[#152535] text-cyan-300 font-bold'
                      : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                  }`}
                >
                  All ({icebergs.length})
                </button>
                <button
                  onClick={() => setFilter('HIGH_RISK')}
                  className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    filter === 'HIGH_RISK'
                      ? 'bg-red-500/20 text-red-300 font-bold'
                      : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                  }`}
                >
                  High Risk
                </button>
                <button
                  onClick={() => setFilter('PROXIMITY')}
                  className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    filter === 'PROXIMITY'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                  }`}
                >
                  Near Route (&lt;15 NM)
                </button>
              </div>
            </div>
          </div>

          {/* Target Selector Horizontal Cards */}
          <div className="p-2 border-b border-[#1B2A35] flex gap-1.5 overflow-x-auto">
            {filteredIcebergs.map((berg) => {
              const isSelected = inspectedBerg?.id === berg.id;
              return (
                <button
                  key={berg.id}
                  onClick={() => onSelectIceberg(berg)}
                  className={`px-2.5 py-1.5 rounded border text-left shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#152535] border-cyan-400 text-[#E8F0F3]'
                      : 'bg-[#0B1721] border-[#1B2A35] text-[#91A4AE] hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        berg.riskLevel === 'HIGH'
                          ? 'bg-red-400'
                          : berg.riskLevel === 'CAUTION'
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                    />
                    <span className="font-bold text-[11px]">{berg.name}</span>
                  </div>
                  <span className="text-[9px] text-[#60737E] block mt-0.5">
                    {berg.estimatedSizeKm} km · {berg.type}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Iceberg Inspection Card for Selected Target */}
          {inspectedBerg && (
            <div className="p-4 border-b border-[#1B2A35] bg-[#0B1721]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#60737E] uppercase block leading-none">
                    SELECTED TARGET
                  </span>
                  <h2 className="text-base font-bold text-[#E8F0F3] mt-1">{inspectedBerg.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      inspectedBerg.riskLevel === 'HIGH'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : inspectedBerg.riskLevel === 'CAUTION'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {inspectedBerg.riskLevel} RISK
                  </span>

                  <button
                    onClick={() => deleteIceberg(inspectedBerg.id)}
                    className="p-1 rounded text-[#60737E] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                    title="Dismiss / Remove this target"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Position</span>
                  <span className="text-[#E8F0F3] font-semibold block mt-0.5">
                    {formatLatitude(inspectedBerg.lat)}
                    <br />
                    {formatLongitude(inspectedBerg.lon)}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Estimated Size</span>
                  <span className="text-[#E8F0F3] font-semibold block mt-0.5">
                    {inspectedBerg.estimatedSizeKm} km
                    <span className="text-[9px] text-[#60737E] ml-1">({inspectedBerg.type})</span>
                  </span>
                </div>

                <div className="p-2 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Velocity & Heading</span>
                  <span className="text-[#E8F0F3] font-semibold block mt-0.5">
                    {inspectedBerg.velocityMs} m/s · {inspectedBerg.headingDeg}°
                  </span>
                </div>

                <div className="p-2 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Last Observed</span>
                  <span className="text-[#E8F0F3] font-semibold block mt-0.5">
                    {inspectedBerg.lastObservedUtc}
                  </span>
                </div>
              </div>

              {/* Trajectory Confidence */}
              <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#60737E] uppercase">TRAJECTORY CONFIDENCE</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {inspectedBerg.trajectoryConfidencePct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#152535] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${inspectedBerg.trajectoryConfidencePct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Iceberg Trajectory Timeline */}
          {inspectedBerg && inspectedBerg.trajectory && (
            <div className="p-4 border-b border-[#1B2A35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#60737E] uppercase font-semibold">
                  PREDICTED DRIFT TRAJECTORY
                </span>
                <span className="text-[9px] text-cyan-400">
                  ± Uncert Corridor
                </span>
              </div>

              <div className="space-y-2">
                {inspectedBerg.trajectory.map((pt) => (
                  <div
                    key={pt.timeLabel}
                    className="flex items-center justify-between p-2 rounded bg-[#071018] border border-[#1B2A35]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="font-bold text-[#E8F0F3]">{pt.timeLabel}</span>
                    </div>
                    <div className="text-right text-[10px] text-[#91A4AE]">
                      <span>{formatLatitude(pt.lat)} {formatLongitude(pt.lon)}</span>
                      <span className="text-[#60737E] ml-2">
                        (±{pt.uncertaintyRadiusKm} km)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded bg-[#152535]/50 text-[10px] text-[#91A4AE] leading-relaxed">
                Uncertainty ellipse expands with simulation horizon due to Coriolis acceleration and tidal fluctuations.
              </div>
            </div>
          )}

          {/* Route Intersection Warning Banner */}
          {hasRouteIntersection && inspectedBerg && (
            <div className="p-4 bg-red-950/20 border-b border-red-500/40 space-y-2.5">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-red-400">ROUTE INTERSECTION ALERT</h3>
                  <p className="text-[11px] text-[#E8F0F3] mt-0.5 leading-snug">
                    {inspectedBerg.name} is projected to enter the safety clearance margin of the active route.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[10px] text-[#60737E] block">Projected Intersection:</span>
                  <span className="font-bold text-[#E8F0F3]">
                    {inspectedBerg.timeToClosestApproachHours ? `${String(Math.floor(inspectedBerg.timeToClosestApproachHours)).padStart(2, '0')}h 42m` : '09h 42m'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#60737E] block">Separation:</span>
                  <span className="font-bold text-red-400">
                    {inspectedBerg.proximityToRouteNm} NM
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMobileTab('map')}
                  className="flex-1 py-1.5 px-2 rounded bg-[#0B1721] border border-[#1B2A35] hover:bg-[#152535] text-[#E8F0F3] text-xs font-bold transition text-center cursor-pointer"
                >
                  VIEW ON MAP
                </button>
                <button
                  onClick={onRecalculateRoute}
                  className="flex-1 py-1.5 px-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow"
                >
                  <RotateCw className="w-3 h-3" />
                  RECALCULATE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Map Centered on Iceberg Field & Selected Trajectory */}
        <div
          className={`flex-1 h-full relative ${
            mobileTab === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <AntarcticMap
            vessel={vessel}
            icebergs={icebergs}
            stations={stations}
            activeRoute={activeRoute}
            alternativeRoutes={alternativeRoutes}
            selectedIceberg={inspectedBerg}
            onSelectIceberg={onSelectIceberg}
            onSelectStation={() => {}}
            onSelectVessel={() => {}}
            simulation={simulation}
            seaIceConcentrationPct={seaIceConcentrationPct}
            highlightIntersection={hasRouteIntersection}
            customClass="h-full w-full"
          />

          {/* Mobile Top Target Pill */}
          {inspectedBerg && (
            <div className="absolute top-2 left-2 right-16 sm:left-4 z-10 bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded px-2.5 py-1.5 font-mono text-[11px] shadow-lg lg:hidden flex items-center justify-between">
              <div className="truncate">
                <span className="text-red-400 font-bold">{inspectedBerg.name}</span>
                <span className="text-[#91A4AE] ml-1.5">{inspectedBerg.estimatedSizeKm} km · {inspectedBerg.headingDeg}°</span>
              </div>
              <button
                onClick={() => setMobileTab('targets')}
                className="text-[10px] text-cyan-400 hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
              >
                List →
              </button>
            </div>
          )}

          {/* Floating Selected Iceberg Tag */}
          {inspectedBerg && (
            <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1.5 text-xs shadow-lg hidden md:block">
              <span className="text-[#60737E]">TARGET TRACK: </span>
              <span className="text-red-400 font-bold">{inspectedBerg.name}</span>
              <span className="text-[#91A4AE] ml-2">
                (Trajectory Confidence {inspectedBerg.trajectoryConfidencePct}% · Velocity {inspectedBerg.velocityMs} m/s)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
} from 'lucide-react';
import { formatLatitude, formatLongitude } from '../../utils/geoProjection';

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
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK' | 'PROXIMITY'>('ALL');

  // Filter list
  const filteredIcebergs = icebergs.filter((berg) => {
    if (filter === 'HIGH_RISK') return berg.riskLevel === 'HIGH';
    if (filter === 'PROXIMITY') return (berg.proximityToRouteNm || 99) < 15;
    return true;
  });

  // Current active inspected iceberg (default to IB-1042 if none selected)
  const inspectedBerg = selectedIceberg || icebergs.find((b) => b.id === 'IB-1042') || icebergs[0];
  const hasRouteIntersection = (inspectedBerg.proximityToRouteNm || 99) <= 3.0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#071018] font-mono">
      {/* Top Header Statistics Strip */}
      <div className="h-14 border-b border-[#1B2A35] bg-[#0B1721] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#E05B5B]">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#E8F0F3] leading-none">
              ICEBERG INTELLIGENCE & TRAJECTORY PREDICTION
            </h1>
            <p className="text-[10px] text-[#91A4AE] mt-0.5">
              NIC / Sentinel-1 SAR Tracking · Hydrodynamic drift modeling with uncertainty corridor
            </p>
          </div>
        </div>

        {/* 4 Header Key Metrics */}
        <div className="flex items-center gap-4 lg:gap-8 text-xs">
          <div className="text-left">
            <span className="text-[10px] text-[#60737E] uppercase block leading-none">
              ACTIVE ICEBERGS
            </span>
            <span className="text-sm font-bold text-[#E8F0F3] mt-0.5 block">147</span>
          </div>
          <div className="h-4 w-px bg-[#1B2A35]" />
          <div className="text-left">
            <span className="text-[10px] text-[#60737E] uppercase block leading-none">TRACKED</span>
            <span className="text-sm font-bold text-[#5DADE2] mt-0.5 block">132</span>
          </div>
          <div className="h-4 w-px bg-[#1B2A35]" />
          <div className="text-left">
            <span className="text-[10px] text-[#60737E] uppercase block leading-none">
              HIGH RISK
            </span>
            <span className="text-sm font-bold text-[#E05B5B] mt-0.5 block">8</span>
          </div>
          <div className="h-4 w-px bg-[#1B2A35]" />
          <div className="text-left">
            <span className="text-[10px] text-[#60737E] uppercase block leading-none">
              ROUTE INTERSECTIONS
            </span>
            <span className="text-sm font-bold text-[#E5B84B] mt-0.5 block">3</span>
          </div>
        </div>
      </div>

      {/* Main Screen: Left Inspector Panel + Center/Right GIS Map */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Side: Iceberg Details & Trajectory Inspector */}
        <div className="w-full lg:w-96 border-r border-[#1B2A35] bg-[#071018] flex flex-col h-full overflow-y-auto shrink-0 text-xs">
          {/* Filter Pills */}
          <div className="p-3 border-b border-[#1B2A35] bg-[#0B1721]/50 flex items-center justify-between">
            <span className="text-[10px] text-[#60737E] uppercase font-semibold">TARGET FILTER:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-[#152535] text-[#5DADE2] font-bold'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                All (147)
              </button>
              <button
                onClick={() => setFilter('HIGH_RISK')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  filter === 'HIGH_RISK'
                    ? 'bg-[#E05B5B]/20 text-[#E05B5B] font-bold'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                High Risk (8)
              </button>
              <button
                onClick={() => setFilter('PROXIMITY')}
                className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                  filter === 'PROXIMITY'
                    ? 'bg-[#E5B84B]/20 text-[#E5B84B] font-bold'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                Near Route (&lt;15 NM)
              </button>
            </div>
          </div>

          {/* Target Selector Horizontal Cards */}
          <div className="p-2 border-b border-[#1B2A35] flex gap-1.5 overflow-x-auto">
            {filteredIcebergs.slice(0, 6).map((berg) => {
              const isSelected = inspectedBerg.id === berg.id;
              return (
                <button
                  key={berg.id}
                  onClick={() => onSelectIceberg(berg)}
                  className={`px-2.5 py-1.5 rounded border text-left shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#152535] border-[#5DADE2] text-[#E8F0F3]'
                      : 'bg-[#0B1721] border-[#1B2A35] text-[#91A4AE] hover:border-[#5DADE2]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        berg.riskLevel === 'HIGH'
                          ? 'bg-[#E05B5B]'
                          : berg.riskLevel === 'CAUTION'
                          ? 'bg-[#E5B84B]'
                          : 'bg-[#5DADE2]'
                      }`}
                    />
                    <span className="font-bold text-[11px]">{berg.id}</span>
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
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    inspectedBerg.riskLevel === 'HIGH'
                      ? 'bg-[#E05B5B]/15 text-[#E05B5B] border-[#E05B5B]/30'
                      : inspectedBerg.riskLevel === 'CAUTION'
                      ? 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/30'
                      : 'bg-[#5DADE2]/15 text-[#5DADE2] border-[#5DADE2]/30'
                  }`}
                >
                  {inspectedBerg.riskLevel} RISK
                </span>
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
                    {inspectedBerg.velocityMs} m/s · {inspectedBerg.headingDeg}° SW
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
                  <span className="text-xs font-bold text-[#43C98B]">
                    {inspectedBerg.trajectoryConfidencePct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#152535] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#43C98B]"
                    style={{ width: `${inspectedBerg.trajectoryConfidencePct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Iceberg Trajectory Timeline (Current, +6H, +12H, +24H, +48H) */}
          {inspectedBerg && inspectedBerg.trajectory && (
            <div className="p-4 border-b border-[#1B2A35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#60737E] uppercase font-semibold">
                  PREDICTED DRIFT TRAJECTORY
                </span>
                <span className="text-[9px] text-[#5DADE2]">
                  ± Uncert Corridor
                </span>
              </div>

              <div className="space-y-2">
                {inspectedBerg.trajectory.map((pt, idx) => (
                  <div
                    key={pt.timeLabel}
                    className="flex items-center justify-between p-2 rounded bg-[#071018] border border-[#1B2A35]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E05B5B]" />
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
                Notice: Uncertainty cone expands over time due to turbulent eddy diffusion and Ekman layer wind shear.
              </div>
            </div>
          )}

          {/* Route Intersection Warning Banner */}
          {hasRouteIntersection && (
            <div className="p-4 bg-[#E05B5B]/10 border-b border-[#E05B5B]/40 space-y-2.5">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E05B5B] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#E05B5B]">ROUTE INTERSECTION ALERT</h3>
                  <p className="text-[11px] text-[#E8F0F3] mt-0.5 leading-snug">
                    {inspectedBerg.id} is projected to enter the safety clearance margin of the active route.
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
                  <span className="font-bold text-[#E05B5B]">
                    {inspectedBerg.proximityToRouteNm} NM
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onNavigateToNavigationTab}
                  className="flex-1 py-1.5 px-2 rounded bg-[#0B1721] border border-[#1B2A35] hover:bg-[#152535] text-[#E8F0F3] text-xs font-bold transition text-center cursor-pointer"
                >
                  VIEW ON MAP
                </button>
                <button
                  onClick={onRecalculateRoute}
                  className="flex-1 py-1.5 px-2 rounded bg-[#E05B5B] hover:bg-[#c94b4b] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow"
                >
                  <RotateCw className="w-3 h-3" />
                  RECALCULATE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Map Centered on Iceberg Field & Selected Trajectory */}
        <div className="flex-1 h-full relative">
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

          {/* Floating Selected Iceberg Tag */}
          <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1.5 text-xs shadow-lg hidden md:block">
            <span className="text-[#60737E]">TARGET TRACK: </span>
            <span className="text-[#E05B5B] font-bold">{inspectedBerg.id}</span>
            <span className="text-[#91A4AE] ml-2">
              (Trajectory Confidence {inspectedBerg.trajectoryConfidencePct}% · Velocity {inspectedBerg.velocityMs} m/s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

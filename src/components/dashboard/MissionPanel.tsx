import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Navigation,
  Compass,
  Fuel,
  Ship,
  MapPin,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Vessel, Mission, RouteOption, Iceberg, SimulationState } from '../../types/navigation';

interface MissionPanelProps {
  currentMission: Mission;
  vessel: Vessel;
  activeRoute: RouteOption;
  riskScore: number;
  riskLevel: 'LOW' | 'CAUTION' | 'HIGH';
  simulation: SimulationState;
  onOpenRoutePlanner: () => void;
  onRecalculateClick: () => void;
  onOpenIcebergsTab: () => void;
  onOpenVesselModal: () => void;
  selectedIceberg: Iceberg | null;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  currentMission,
  vessel,
  activeRoute,
  riskScore,
  riskLevel,
  simulation,
  onOpenRoutePlanner,
  onRecalculateClick,
  onOpenIcebergsTab,
  onOpenVesselModal,
  selectedIceberg,
}) => {
  const isEncounterAlert = simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated;

  return (
    <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-[#1B2A35] bg-[#071018] flex flex-col h-full select-none shrink-0 overflow-y-auto">
      {/* 1. Mission Header Card */}
      <div className="p-4 border-b border-[#1B2A35] bg-[#0B1721]/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono tracking-widest text-[#60737E] uppercase">
            CURRENT MISSION
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1.5 border ${
              isEncounterAlert
                ? 'bg-[#E05B5B]/15 text-[#E05B5B] border-[#E05B5B]/30'
                : 'bg-[#43C98B]/10 text-[#43C98B] border-[#43C98B]/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isEncounterAlert ? 'bg-[#E05B5B] animate-ping' : 'bg-[#43C98B]'
              }`}
            />
            {isEncounterAlert ? 'CAUTION: PROXIMITY ALERT' : '● ON SCHEDULE'}
          </span>
        </div>

        <h2 className="text-base font-bold text-[#E8F0F3] font-mono tracking-wide leading-tight">
          {currentMission.missionNumber}
        </h2>
        <p className="text-xs text-[#5DADE2] font-mono font-medium tracking-wide mt-0.5">
          {currentMission.title}
        </p>

        {/* Mission Destination & ETA Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-[#1B2A35]/80">
          <div className="bg-[#071018] border border-[#1B2A35] rounded p-2">
            <span className="text-[10px] font-mono text-[#60737E] block uppercase">Destination</span>
            <span className="text-xs font-mono font-semibold text-[#E8F0F3] truncate block mt-0.5">
              {currentMission.destinationName}
            </span>
          </div>
          <div className="bg-[#071018] border border-[#1B2A35] rounded p-2">
            <span className="text-[10px] font-mono text-[#60737E] block uppercase">Distance Remaining</span>
            <span className="text-xs font-mono font-semibold text-[#E8F0F3] block mt-0.5">
              {activeRoute.distanceKm} km
              <span className="text-[10px] text-[#60737E] font-normal ml-1">
                ({activeRoute.distanceNm.toFixed(0)} NM)
              </span>
            </span>
          </div>
          <div className="bg-[#071018] border border-[#1B2A35] rounded p-2">
            <span className="text-[10px] font-mono text-[#60737E] block uppercase">Estimated ETA</span>
            <span className="text-xs font-mono font-semibold text-[#E8F0F3] block mt-0.5">
              {activeRoute.etaFormatted}
            </span>
          </div>
          <div className="bg-[#071018] border border-[#1B2A35] rounded p-2">
            <span className="text-[10px] font-mono text-[#60737E] block uppercase">Fuel Remaining</span>
            <span className="text-xs font-mono font-semibold text-[#43C98B] block mt-0.5">
              {vessel.fuelPct}%
              <span className="text-[10px] text-[#60737E] font-normal ml-1">
                ({vessel.fuelRemainingTons}t)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Condition & Risk Meter */}
      <div className="p-4 border-b border-[#1B2A35]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#60737E] uppercase">
            NAVIGATION CONDITION
          </span>
          <span
            className={`text-xs font-mono font-bold ${
              riskLevel === 'HIGH'
                ? 'text-[#E05B5B]'
                : riskLevel === 'CAUTION'
                ? 'text-[#E5B84B]'
                : 'text-[#43C98B]'
            }`}
          >
            {riskLevel} RISK
          </span>
        </div>

        {/* Risk Score display */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono text-[#E8F0F3] tracking-tight">
            {riskScore}
            <span className="text-xs font-normal text-[#60737E] ml-1">/ 100</span>
          </span>
          <span className="text-[10px] font-mono text-[#91A4AE]">
            {riskScore < 25 ? 'OPTIMAL MARGIN' : riskScore < 50 ? 'ELEVATED WATCH' : 'CRITICAL CORRIDOR'}
          </span>
        </div>

        {/* Horizontal Risk Meter Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-[#152535] rounded-full overflow-hidden relative">
            {/* Color threshold zones background */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 bg-[#43C98B]/25" />
              <div className="w-1/3 bg-[#E5B84B]/25" />
              <div className="w-1/3 bg-[#E05B5B]/25" />
            </div>
            {/* Active filled indicator */}
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                riskScore > 50 ? 'bg-[#E05B5B]' : riskScore > 25 ? 'bg-[#E5B84B]' : 'bg-[#43C98B]'
              }`}
              style={{ width: `${Math.max(6, Math.min(100, riskScore))}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-[#60737E] px-0.5">
            <span>0 SAFE</span>
            <span>35 CAUTION</span>
            <span>70 DANGER</span>
            <span>100</span>
          </div>
        </div>

        {/* Route Exposure Metrics */}
        <div className="mt-3.5 pt-3 border-t border-[#1B2A35] grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#60737E] block">Ice Exposure</span>
            <span className="text-[#E8F0F3] font-semibold">{activeRoute.iceExposurePct}%</span>
          </div>
          <div>
            <span className="text-[10px] text-[#60737E] block">Active Track</span>
            <span className="text-[#5DADE2] font-semibold">{activeRoute.name}</span>
          </div>
        </div>
      </div>

      {/* 3. Proximity Alert Banner (Triggered during T+12 encounter with IB-1042) */}
      {isEncounterAlert && (
        <div className="p-4 bg-[#E05B5B]/10 border-b border-[#E05B5B]/40 animate-soft-pulse">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E05B5B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-[#E05B5B]">
                ROUTE INTERSECTION ALERT
              </div>
              <p className="text-[11px] font-mono text-[#E8F0F3] leading-snug">
                Iceberg <strong className="text-[#E05B5B]">IB-1042</strong> is projected to approach
                the active route at T+12.
              </p>
              <div className="text-[10px] font-mono text-[#91A4AE] pt-0.5">
                Separation: <span className="text-[#E05B5B] font-bold">2.8 NM</span> · Condition:{' '}
                <span className="text-[#E5B84B] font-bold">CAUTION</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onRecalculateClick}
              className="w-full py-1.5 px-3 rounded bg-[#E05B5B] hover:bg-[#c94b4b] text-white text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <RotateCw className="w-3.5 h-3.5" />
              RECALCULATE ROUTE
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Route Assessment Summary */}
      <div className="p-4 border-b border-[#1B2A35] flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#60737E] uppercase">
            ROUTE ASSESSMENT
          </span>
          <button
            onClick={onOpenRoutePlanner}
            className="text-[10px] font-mono text-[#5DADE2] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Compare All <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {activeRoute.rationale.slice(0, 4).map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-[11px] font-mono text-[#91A4AE]">
              <span className="text-[#43C98B] font-bold mt-0.5">✓</span>
              <span className="leading-snug text-[#CBD5E1]">{point}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-[#1B2A35] flex gap-2">
          <button
            onClick={onOpenRoutePlanner}
            className="flex-1 py-1.5 px-2.5 rounded bg-[#0B1721] border border-[#1B2A35] hover:border-[#5DADE2]/50 hover:bg-[#152535] text-xs font-mono text-[#E8F0F3] transition text-center cursor-pointer"
          >
            Route Planner
          </button>
          <button
            onClick={onOpenIcebergsTab}
            className="flex-1 py-1.5 px-2.5 rounded bg-[#0B1721] border border-[#1B2A35] hover:border-[#5DADE2]/50 hover:bg-[#152535] text-xs font-mono text-[#E8F0F3] transition text-center cursor-pointer"
          >
            Iceberg Intel
          </button>
        </div>
      </div>

      {/* 5. Vessel Telemetry Card */}
      <div className="p-3 bg-[#0B1721] border-t border-[#1B2A35] text-xs font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-3.5 h-3.5 text-[#5DADE2]" />
            <span className="font-bold text-[#E8F0F3]">{vessel.name}</span>
          </div>
          <button
            onClick={onOpenVesselModal}
            className="text-[10px] text-[#5DADE2] hover:underline cursor-pointer"
          >
            Bridge Card →
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-[#91A4AE] flex items-center justify-between">
          <span>Speed: {vessel.speedKnots} kn</span>
          <span>Heading: {vessel.headingDeg}°</span>
          <span>Class: PC 5</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AntarcticMap } from '../map/AntarcticMap';
import { MissionPanel } from './MissionPanel';
import { EnvironmentStrip } from './EnvironmentStrip';
import {
  Vessel,
  Iceberg,
  ResearchStation,
  RouteOption,
  Mission,
  SimulationState,
  WeatherOceanData,
  SeaIceData,
} from '../../types/navigation';
import { Compass, Ship, Waves, AlertTriangle, Layers, ArrowRight, RotateCw } from 'lucide-react';

interface OverviewViewProps {
  currentMission: Mission;
  vessel: Vessel;
  activeRoute: RouteOption;
  availableRoutes: RouteOption[];
  icebergs: Iceberg[];
  stations: ResearchStation[];
  selectedIceberg: Iceberg | null;
  onSelectIceberg: (iceberg: Iceberg | null) => void;
  onSelectStation: (station: ResearchStation | null) => void;
  onSelectVessel: () => void;
  simulation: SimulationState;
  seaIce: SeaIceData;
  weather: WeatherOceanData;
  onOpenRoutePlanner: () => void;
  onRecalculateClick: () => void;
  onOpenIcebergsTab: () => void;
  onOpenWeatherTab: () => void;
  onOpenSeaIceTab: () => void;
  onOpenVesselModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentMission,
  vessel,
  activeRoute,
  availableRoutes,
  icebergs,
  stations,
  selectedIceberg,
  onSelectIceberg,
  onSelectStation,
  onSelectVessel,
  simulation,
  seaIce,
  weather,
  onOpenRoutePlanner,
  onRecalculateClick,
  onOpenIcebergsTab,
  onOpenWeatherTab,
  onOpenSeaIceTab,
  onOpenVesselModal,
}) => {
  // Mobile sub-tab view switcher
  const [mobileTab, setMobileTab] = useState<'map' | 'mission' | 'conditions'>('map');

  // Compute risk score based on whether simulation is at T+12 with un-recalculated iceberg encounter
  const isT12Hazard = simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated;
  const currentRiskScore = isT12Hazard ? 67 : activeRoute.riskScore;
  const currentRiskLevel = isT12Hazard ? 'HIGH' : currentRiskScore > 35 ? 'CAUTION' : 'LOW';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#071018] font-mono">
      {/* Mobile Top Segmented Sub-View Switcher (< lg only) */}
      <div className="lg:hidden flex items-center justify-between p-1.5 bg-[#0B1721] border-b border-[#1B2A35] shrink-0 text-xs">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'map'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setMobileTab('mission')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold relative ${
              mobileTab === 'mission'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Mission</span>
            {isT12Hazard && (
              <span className="w-2 h-2 rounded-full bg-[#E05B5B] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setMobileTab('conditions')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'conditions'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Conditions</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row h-full lg:h-[calc(100%-3.5rem)] overflow-hidden relative">
        {/* Map Centerpiece (Always visible on desktop, toggleable on mobile) */}
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
            alternativeRoutes={availableRoutes.filter((r) => r.id !== activeRoute.id)}
            selectedIceberg={selectedIceberg}
            onSelectIceberg={onSelectIceberg}
            onSelectStation={onSelectStation}
            onSelectVessel={onSelectVessel}
            simulation={simulation}
            seaIceConcentrationPct={seaIce.currentConcentrationPct}
            highlightIntersection={isT12Hazard}
            onRecalculateClick={onRecalculateClick}
            customClass="h-full w-full"
          />

          {/* Quick HUD Tag in top-center (desktop) */}
          <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1 font-mono text-xs shadow-lg hidden xl:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B]" />
            <span className="text-[#91A4AE]">TRANSIT CORRIDOR: </span>
            <span className="text-[#E8F0F3] font-semibold">
              {vessel.name} → {currentMission.destinationName}
            </span>
            <span className="text-[#60737E]">|</span>
            <span className="text-[#5DADE2]">562 km Remaining</span>
          </div>

          {/* Mobile Bottom Floating Mission Mini-Bar */}
          <div className="lg:hidden absolute bottom-14 left-2 right-2 z-20">
            {isT12Hazard ? (
              <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#E05B5B] rounded-lg p-2.5 shadow-2xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E05B5B] shrink-0 animate-bounce" />
                  <div>
                    <span className="text-[10px] text-[#E05B5B] font-bold block uppercase leading-none">
                      HAZARD INTERSECTION
                    </span>
                    <span className="text-[#E8F0F3] text-[11px] block mt-0.5">
                      IB-1042 · 2.8 NM to Route
                    </span>
                  </div>
                </div>
                <button
                  onClick={onRecalculateClick}
                  className="py-1 px-2.5 rounded bg-[#E05B5B] text-white font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer shadow"
                >
                  <RotateCw className="w-3 h-3" />
                  RECALCULATE
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMobileTab('mission')}
                className="w-full bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] hover:border-[#5DADE2]/50 rounded-lg p-2 shadow-xl flex items-center justify-between text-xs text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#43C98B]" />
                  <div>
                    <span className="text-[10px] text-[#91A4AE] block uppercase leading-none">
                      {currentMission.missionNumber}
                    </span>
                    <span className="text-[#E8F0F3] font-semibold text-xs block mt-0.5">
                      {currentMission.destinationName} · {activeRoute.distanceKm} km
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#43C98B]/10 text-[#43C98B] border border-[#43C98B]/30 font-bold">
                    {activeRoute.riskScore} RISK
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#91A4AE]" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Right Information Panel (Always visible on desktop, toggleable on mobile) */}
        <div
          className={`h-full ${
            mobileTab === 'mission' ? 'block w-full flex-1 overflow-y-auto' : 'hidden lg:block'
          }`}
        >
          <MissionPanel
            currentMission={currentMission}
            vessel={vessel}
            activeRoute={activeRoute}
            riskScore={currentRiskScore}
            riskLevel={currentRiskLevel}
            simulation={simulation}
            onOpenRoutePlanner={onOpenRoutePlanner}
            onRecalculateClick={onRecalculateClick}
            onOpenIcebergsTab={onOpenIcebergsTab}
            onOpenVesselModal={onOpenVesselModal}
            selectedIceberg={selectedIceberg}
          />
        </div>

        {/* Mobile Conditions Sub-View (Mobile only) */}
        {mobileTab === 'conditions' && (
          <div className="lg:hidden flex-1 overflow-y-auto p-3 space-y-3 bg-[#071018]">
            <div className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#60737E] uppercase block">Prydz Bay Sector</span>
                <h3 className="text-sm font-bold text-[#E8F0F3] mt-0.5">METEOROLOGICAL CONDITIONS</h3>
              </div>
              <button
                onClick={onOpenWeatherTab}
                className="text-[11px] text-[#5DADE2] hover:underline flex items-center gap-1"
              >
                Weather Hub <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Grid of condition cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenSeaIceTab}
                className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35] text-left hover:border-[#5DADE2]/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#5DADE2] mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-[9px] text-[#E5B84B] font-bold">↗ {seaIce.trend}</span>
                </div>
                <span className="text-[10px] text-[#60737E] block uppercase">Sea Ice Conc.</span>
                <span className="text-base font-bold text-[#E8F0F3] block mt-0.5">
                  {seaIce.currentConcentrationPct}%
                </span>
                <span className="text-[10px] text-[#91A4AE] block mt-1">Tap for SAR forecast</span>
              </button>

              <button
                onClick={onOpenWeatherTab}
                className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35] text-left hover:border-[#5DADE2]/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#91A4AE] mb-1">
                  <Waves className="w-4 h-4 text-[#5DADE2]" />
                  <span className="text-[9px] text-[#60737E]">{weather.wavePeriodSec}s</span>
                </div>
                <span className="text-[10px] text-[#60737E] block uppercase">Wave Height</span>
                <span className="text-base font-bold text-[#E8F0F3] block mt-0.5">
                  {weather.waveHeightMeters} m
                </span>
                <span className="text-[10px] text-[#91A4AE] block mt-1">Swell: S-SE</span>
              </button>

              <div className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block uppercase">Surface Wind</span>
                <span className="text-base font-bold text-[#E8F0F3] block mt-0.5">
                  {weather.windKnots} kn
                </span>
                <span className="text-[10px] text-[#91A4AE] block mt-1">↗ {weather.windCardinal}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block uppercase">Ocean Current</span>
                <span className="text-base font-bold text-[#E8F0F3] block mt-0.5">
                  {weather.oceanCurrentKnots} kn
                </span>
                <span className="text-[10px] text-[#91A4AE] block mt-1">→ {weather.oceanCurrentDirection}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block uppercase">Air / Sea Temp</span>
                <span className="text-sm font-bold text-[#E8F0F3] block mt-0.5">
                  {weather.airTempC}°C / {weather.seaTempC}°C
                </span>
                <span className="text-[10px] text-[#91A4AE] block mt-1">Freezing risk: MOD</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block uppercase">Visibility</span>
                <span className="text-base font-bold text-[#E8F0F3] block mt-0.5">
                  {weather.visibilityKm} km
                </span>
                <span className="text-[10px] text-[#43C98B] block mt-1">GOOD CLEAR</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Environment Information Strip (Hidden on mobile, visible on desktop lg+) */}
      <div className="hidden lg:block shrink-0">
        <EnvironmentStrip
          weather={weather}
          seaIce={seaIce}
          onOpenWeatherTab={onOpenWeatherTab}
          onOpenSeaIceTab={onOpenSeaIceTab}
        />
      </div>
    </div>
  );
};

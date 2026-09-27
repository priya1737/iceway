import React from 'react';
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
  // Compute risk score based on whether simulation is at T+12 with un-recalculated iceberg encounter
  const isT12Hazard = simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated;
  const currentRiskScore = isT12Hazard ? 67 : activeRoute.riskScore;
  const currentRiskLevel = isT12Hazard ? 'HIGH' : currentRiskScore > 35 ? 'CAUTION' : 'LOW';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#071018]">
      {/* Upper Area: Centerpiece Antarctic Map (~70-75%) + Right Mission Panel (~25-30%) */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100%-3.5rem)] overflow-hidden">
        {/* Map Centerpiece */}
        <div className="flex-1 h-full relative">
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

          {/* Quick HUD Tag in top-center */}
          <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1 font-mono text-xs shadow-lg hidden xl:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B]" />
            <span className="text-[#91A4AE]">TRANSIT CORRIDOR: </span>
            <span className="text-[#E8F0F3] font-semibold">
              {vessel.name} → {currentMission.destinationName}
            </span>
            <span className="text-[#60737E]">|</span>
            <span className="text-[#5DADE2]">562 km Remaining</span>
          </div>
        </div>

        {/* Right Information Panel */}
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

      {/* Bottom Environment Information Strip */}
      <EnvironmentStrip
        weather={weather}
        seaIce={seaIce}
        onOpenWeatherTab={onOpenWeatherTab}
        onOpenSeaIceTab={onOpenSeaIceTab}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  SeaIceData,
  Vessel,
  Iceberg,
  ResearchStation,
  RouteOption,
  SimulationState,
} from '../../types/navigation';
import { AntarcticMap } from '../map/AntarcticMap';
import {
  Layers,
  Clock,
  Radio,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface SeaIceViewProps {
  seaIce: SeaIceData;
  vessel: Vessel;
  icebergs: Iceberg[];
  stations: ResearchStation[];
  activeRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  simulation: SimulationState;
  onSetSeaIceConcentration: (conc: number) => void;
}

export const SeaIceView: React.FC<SeaIceViewProps> = ({
  seaIce,
  vessel,
  icebergs,
  stations,
  activeRoute,
  alternativeRoutes,
  simulation,
  onSetSeaIceConcentration,
}) => {
  const [selectedForecastIndex, setSelectedForecastIndex] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'forecast' | 'map'>('forecast');

  const forecast = seaIce.forecast;
  const currentPoint = forecast[selectedForecastIndex] || forecast[0];

  const handleSelectTime = (index: number) => {
    setSelectedForecastIndex(index);
    onSetSeaIceConcentration(forecast[index].concentrationPct);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#071018] font-mono">
      {/* Top Forecast Timeline Header */}
      <div className="h-auto min-h-14 py-2 border-b border-[#1B2A35] bg-[#0B1721] px-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#5DADE2] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#E8F0F3] leading-none">
              SEA-ICE CONDITIONS & FORECAST
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#91A4AE] mt-0.5 truncate max-w-[280px] sm:max-w-none">
              SAR Backscatter Analysis · Dynamic concentration tracking along Prydz Bay fairway
            </p>
          </div>
        </div>

        {/* Timeline Buttons: NOW, +6H, +12H, +24H, +48H */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-[#071018] border border-[#1B2A35] rounded-md overflow-x-auto max-w-full">
          <span className="text-[9px] sm:text-[10px] text-[#60737E] uppercase px-1.5 shrink-0 hidden xs:inline">HORIZON:</span>
          {forecast.map((pt, idx) => {
            const isSelected = selectedForecastIndex === idx;
            return (
              <button
                key={pt.timeLabel}
                onClick={() => handleSelectTime(idx)}
                className={`px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs transition cursor-pointer font-bold shrink-0 ${
                  isSelected
                    ? 'bg-[#5DADE2] text-[#071018] shadow'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535]'
                }`}
              >
                {pt.timeLabel}
              </button>
            );
          })}
        </div>

        {/* Satellite Sync Badge */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-[#91A4AE]">
          <Radio className="w-3.5 h-3.5 text-[#43C98B]" />
          <span>Sentinel-1B EW · 14:15 UTC</span>
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center justify-between p-1.5 bg-[#0B1721] border-b border-[#1B2A35] shrink-0 text-xs">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setMobileTab('forecast')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'forecast'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Concentration & Types</span>
          </button>

          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'map'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <span>Polar Ice Map</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Side Panel + Map */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Side Panel */}
        <div
          className={`w-full lg:w-84 border-r border-[#1B2A35] bg-[#071018] flex flex-col h-full overflow-y-auto shrink-0 text-xs ${
            mobileTab === 'forecast' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Section: Sea-Ice Concentration Progression */}
          <div className="p-4 border-b border-[#1B2A35] bg-[#0B1721]/50">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider block font-semibold mb-2">
              SEA-ICE CONCENTRATION
            </span>

            <div className="space-y-1.5">
              {forecast.map((pt, idx) => {
                const isSelected = selectedForecastIndex === idx;
                return (
                  <div
                    key={pt.timeLabel}
                    onClick={() => handleSelectTime(idx)}
                    className={`flex items-center justify-between p-2 rounded border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#152535] border-[#5DADE2] text-[#E8F0F3]'
                        : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#5DADE2]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5DADE2]" />
                      <span className="font-semibold">{pt.timeLabel}:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#E8F0F3]">
                        {pt.concentrationPct}%
                      </span>
                      <div className="w-16 h-1.5 bg-[#0B1721] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5DADE2]"
                          style={{ width: `${pt.concentrationPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Forecast Confidence & Route Ice Exposure */}
          <div className="p-4 border-b border-[#1B2A35] space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#60737E] uppercase tracking-wider">
                  FORECAST CONFIDENCE
                </span>
                <span className="text-sm font-bold text-[#43C98B]">
                  {seaIce.forecastConfidencePct}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#152535] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#43C98B]"
                  style={{ width: `${seaIce.forecastConfidencePct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#60737E] mt-1">
                Grounded on multi-sensor SAR polar orbit fusion + ECMWF sea-ice drift model.
              </p>
            </div>

            {/* Ice Exposure Comparison */}
            <div className="p-3 rounded bg-[#0B1721] border border-[#1B2A35] space-y-2">
              <span className="text-[10px] text-[#60737E] uppercase tracking-wider block font-semibold">
                ICE EXPOSURE
              </span>

              <div className="flex justify-between items-center">
                <span className="text-[#CBD5E1]">Current route:</span>
                <span className="text-[#43C98B] font-bold">
                  {seaIce.currentRouteIceExposurePct}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#CBD5E1]">Alternative route:</span>
                <span className="text-[#E5B84B] font-bold">
                  {seaIce.alternativeRouteIceExposurePct}%
                </span>
              </div>
            </div>
          </div>

          {/* Section: Pack Ice Type Distribution */}
          <div className="p-4 border-b border-[#1B2A35] space-y-2">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider block font-semibold">
              ICE COMPOSITION BREAKDOWN
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#91A4AE]">Thin First-Year (30-70cm):</span>
                <span className="text-[#E8F0F3] font-semibold">{seaIce.typesBreakdown.firstYearThin}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#91A4AE]">Medium First-Year (70-120cm):</span>
                <span className="text-[#E8F0F3] font-semibold">{seaIce.typesBreakdown.firstYearMedium}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#91A4AE]">Multi-Year Ice (&gt;200cm):</span>
                <span className="text-[#E05B5B] font-semibold">{seaIce.typesBreakdown.multiYear}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#91A4AE]">Open Water Leads:</span>
                <span className="text-[#5DADE2] font-semibold">{seaIce.typesBreakdown.openWater}%</span>
              </div>
            </div>
          </div>

          {/* Operational Advisory */}
          <div className="p-4 bg-[#0B1721] flex-1 text-[11px] text-[#91A4AE] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#5DADE2] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>POLAR CODE COMPLIANCE</span>
            </div>
            <p className="leading-relaxed">
              At {currentPoint.concentrationPct}% concentration, RV Sagar's PC 5 hull rating permits continuous passage at up to 10.5 kn without icebreaker escort.
            </p>
          </div>
        </div>

        {/* Right Map View synced with selected forecast */}
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
            selectedIceberg={null}
            onSelectIceberg={() => {}}
            onSelectStation={() => {}}
            onSelectVessel={() => {}}
            simulation={simulation}
            seaIceConcentrationPct={currentPoint.concentrationPct}
            highlightIntersection={false}
            customClass="h-full w-full"
          />

          {/* Floating Horizon Pill */}
          <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1 text-xs shadow-lg hidden md:block">
            <span className="text-[#60737E]">DISPLAYING: </span>
            <span className="text-[#5DADE2] font-bold">{currentPoint.timeLabel} FORECAST</span>
            <span className="text-[#E8F0F3] ml-2">({currentPoint.concentrationPct}% Pack Ice Extent)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

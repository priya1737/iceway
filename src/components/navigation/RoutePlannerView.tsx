import React, { useState } from 'react';
import {
  RouteOption,
  Vessel,
  ResearchStation,
  SimulationState,
  Iceberg,
} from '../../types/navigation';
import {
  Compass,
  Ship,
  Fuel,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AntarcticMap } from '../map/AntarcticMap';

interface RoutePlannerViewProps {
  vessel: Vessel;
  stations: ResearchStation[];
  activeRoute: RouteOption;
  availableRoutes: RouteOption[];
  onSelectRoute: (route: RouteOption) => void;
  simulation: SimulationState;
  icebergs: Iceberg[];
  seaIceConcentrationPct: number;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  vessel,
  stations,
  activeRoute,
  availableRoutes,
  onSelectRoute,
  simulation,
  icebergs,
  seaIceConcentrationPct,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('bharati');
  const [vesselSpeed, setVesselSpeed] = useState<number>(12);
  const [iceClass, setIceClass] = useState<string>('PC 5 Polar Class');
  const [priority, setPriority] = useState<'BALANCED' | 'FUEL_EFFICIENT' | 'SAFETY_PRIORITY'>('BALANCED');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'plan' | 'map'>('plan');

  const handleGenerateRoutes = () => {
    setIsGenerating(true);
    setGenerationNotice('Optimizing waypoints through polar ice field and tidal current vectors...');
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationNotice(null);
      // Auto-select route matching priority
      const matched = availableRoutes.find((r) => r.tag === priority);
      if (matched) {
        onSelectRoute(matched);
      }
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden select-none bg-[#071018] font-mono">
      {/* Mobile Tab Switcher (< xl screens) */}
      <div className="xl:hidden flex items-center justify-between p-1.5 bg-[#0B1721] border-b border-[#1B2A35] shrink-0 text-xs">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setMobileTab('plan')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'plan'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parameters & Routes</span>
          </button>

          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
              mobileTab === 'map'
                ? 'bg-[#152535] text-[#5DADE2] border border-[#5DADE2]/40'
                : 'text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map Preview</span>
          </button>
        </div>
      </div>

      {/* Left Planning & Comparison Column */}
      <div
        className={`w-full xl:w-[480px] border-r border-[#1B2A35] flex flex-col h-full bg-[#071018] overflow-y-auto shrink-0 ${
          mobileTab === 'plan' ? 'flex' : 'hidden xl:flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1B2A35] bg-[#0B1721]/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5DADE2]">
              VOYAGE OPTIMIZATION
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#E8F0F3] mt-1">ROUTE PLANNER</h1>
          <p className="text-[11px] text-[#91A4AE] mt-0.5">
            Multi-variable routing engine integrating SAR ice concentration, iceberg drift vectors, and vessel polar capability.
          </p>
        </div>

        {/* Input Parameters Form */}
        <div className="p-4 border-b border-[#1B2A35] space-y-3.5 text-xs">
          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-[#60737E] uppercase block mb-1">ORIGIN</label>
              <div className="p-2 rounded bg-[#0B1721] border border-[#1B2A35] text-[#E8F0F3] font-semibold flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-[#5DADE2]" />
                <span className="truncate">{vessel.name} (Current)</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#60737E] uppercase block mb-1">DESTINATION</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full p-2 rounded bg-[#0B1721] border border-[#1B2A35] text-[#E8F0F3] font-semibold cursor-pointer focus:outline-none focus:border-[#5DADE2]"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Speed & Ice Capability */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-[#60737E] uppercase">VESSEL SPEED</label>
                <span className="text-[#5DADE2] font-bold">{vesselSpeed} kn</span>
              </div>
              <input
                type="range"
                min="8"
                max="16"
                step="0.5"
                value={vesselSpeed}
                onChange={(e) => setVesselSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#5DADE2] bg-[#152535] h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#60737E] uppercase block mb-1">ICE CAPABILITY</label>
              <select
                value={iceClass}
                onChange={(e) => setIceClass(e.target.value)}
                className="w-full p-1.5 rounded bg-[#0B1721] border border-[#1B2A35] text-[#E8F0F3] text-xs cursor-pointer focus:outline-none focus:border-[#5DADE2]"
              >
                <option value="PC 4">PC 4 (Year-round thick ice)</option>
                <option value="PC 5 Polar Class">PC 5 (Year-round medium first-year)</option>
                <option value="PC 6">PC 6 (Summer/autumn medium ice)</option>
                <option value="DNV Ice-1A Super">DNV Ice-1A Super</option>
              </select>
            </div>
          </div>

          {/* Optimization Priority Segmented Control */}
          <div>
            <label className="text-[10px] text-[#60737E] uppercase block mb-1.5">
              OPTIMIZATION PRIORITY
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B1721] border border-[#1B2A35] rounded">
              <button
                onClick={() => setPriority('BALANCED')}
                className={`py-1.5 px-2 rounded text-[11px] font-mono transition cursor-pointer ${
                  priority === 'BALANCED'
                    ? 'bg-[#152535] text-[#5DADE2] font-bold shadow'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setPriority('FUEL_EFFICIENT')}
                className={`py-1.5 px-2 rounded text-[11px] font-mono transition cursor-pointer ${
                  priority === 'FUEL_EFFICIENT'
                    ? 'bg-[#152535] text-[#5DADE2] font-bold shadow'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                Fuel
              </button>
              <button
                onClick={() => setPriority('SAFETY_PRIORITY')}
                className={`py-1.5 px-2 rounded text-[11px] font-mono transition cursor-pointer ${
                  priority === 'SAFETY_PRIORITY'
                    ? 'bg-[#152535] text-[#5DADE2] font-bold shadow'
                    : 'text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                Safety
              </button>
            </div>
          </div>

          {/* Button: Generate Routes */}
          <button
            onClick={handleGenerateRoutes}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded bg-[#5DADE2] hover:bg-[#4a9ac9] text-[#071018] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                CALCULATING VOYAGE CORRIDORS...
              </>
            ) : (
              'GENERATE ROUTES'
            )}
          </button>

          {generationNotice && (
            <div className="text-[10px] text-[#5DADE2] text-center italic">
              {generationNotice}
            </div>
          )}
        </div>

        {/* Route Comparison Cards */}
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between text-[10px] text-[#60737E] uppercase tracking-wider">
            <span>AVAILABLE ROUTE OPTIONS ({availableRoutes.length})</span>
            <span>CLICK TO ACTIVATE ON BRIDGE</span>
          </div>

          {availableRoutes.map((route) => {
            const isSelected = activeRoute.id === route.id;
            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`p-3.5 rounded border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#0B1721] border-[#43C98B] shadow-lg ring-1 ring-[#43C98B]/30'
                    : 'bg-[#0B1721]/50 border-[#1B2A35] hover:border-[#5DADE2]/40 hover:bg-[#0B1721]'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#E8F0F3]">{route.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#152535] text-[#91A4AE] border border-[#1B2A35]">
                      {route.tag.replace('_', ' ')}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-[#43C98B] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE ROUTE
                    </span>
                  )}
                </div>

                {/* Metrics 4-cell table */}
                <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-[#1B2A35]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#60737E] block">Distance</span>
                    <span className="text-[#E8F0F3] font-semibold">{route.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#60737E] block">ETA</span>
                    <span className="text-[#E8F0F3] font-semibold">{route.etaFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#60737E] block">Fuel</span>
                    <span className="text-[#E8F0F3] font-semibold">{route.fuelUnits} u</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#60737E] block">Risk</span>
                    <span
                      className={`font-bold ${
                        route.riskScore > 35
                          ? 'text-[#E05B5B]'
                          : route.riskScore > 15
                          ? 'text-[#E5B84B]'
                          : 'text-[#43C98B]'
                      }`}
                    >
                      {route.riskScore} / 100
                    </span>
                  </div>
                </div>

                {/* Ice Exposure */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#91A4AE]">
                  <span>Ice Exposure: <strong className="text-[#E8F0F3]">{route.iceExposurePct}%</strong></span>
                  <span className="text-[10px] text-[#60737E]">{route.waypoints.length} Charted Waypoints</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Route Explanation Panel (Factual Checkmarks) */}
        <div className="p-4 border-t border-[#1B2A35] bg-[#0B1721] text-xs">
          <div className="text-[10px] text-[#60737E] uppercase tracking-wider mb-2 font-semibold">
            ROUTE ASSESSMENT — WHY THIS ROUTE?
          </div>
          <div className="space-y-1.5">
            {activeRoute.rationale.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[#91A4AE] text-[11px]">
                <span className="text-[#43C98B] font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-snug text-[#CBD5E1]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Action to Jump to Map */}
        <div className="xl:hidden p-3 bg-[#0B1721] border-t border-[#1B2A35]">
          <button
            onClick={() => setMobileTab('map')}
            className="w-full py-2.5 px-3 rounded bg-[#5DADE2] hover:bg-[#4999c7] text-[#071018] font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow transition"
          >
            <Compass className="w-4 h-4" />
            <span>Inspect Route on Polar Map</span>
          </button>
        </div>
      </div>

      {/* Right Column: Visual Polar Route Map */}
      <div
        className={`flex-1 h-full relative ${
          mobileTab === 'map' ? 'block' : 'hidden xl:block'
        }`}
      >
        <AntarcticMap
          vessel={vessel}
          icebergs={icebergs}
          stations={stations}
          activeRoute={activeRoute}
          alternativeRoutes={availableRoutes.filter((r) => r.id !== activeRoute.id)}
          selectedIceberg={null}
          onSelectIceberg={() => {}}
          onSelectStation={() => {}}
          onSelectVessel={() => {}}
          simulation={simulation}
          seaIceConcentrationPct={seaIceConcentrationPct}
          highlightIntersection={false}
          customClass="h-full w-full"
        />

        {/* Mobile Top Route Pill */}
        <div className="absolute top-2 left-2 right-16 sm:left-4 z-10 bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded px-2.5 py-1.5 font-mono text-[11px] shadow-lg xl:hidden flex items-center justify-between">
          <div className="truncate">
            <span className="text-[#43C98B] font-bold">{activeRoute.name}</span>
            <span className="text-[#91A4AE] ml-1.5">{activeRoute.distanceKm} km · {activeRoute.etaFormatted}</span>
          </div>
          <button
            onClick={() => setMobileTab('plan')}
            className="text-[10px] text-[#5DADE2] hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
          >
            Options →
          </button>
        </div>

        {/* Floating Route Summary Overlay (Desktop) */}
        <div className="absolute top-4 left-60 z-10 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-3 py-1.5 font-mono text-xs shadow-lg hidden xl:block">
          <span className="text-[#60737E]">SELECTED: </span>
          <span className="text-[#43C98B] font-bold">{activeRoute.displayName}</span>
          <span className="text-[#91A4AE] ml-2">
            ({activeRoute.distanceKm} km · {activeRoute.etaFormatted} · Risk {activeRoute.riskScore})
          </span>
        </div>
      </div>
    </div>
  );
};

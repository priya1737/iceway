import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Ship,
  Route as RouteIcon,
  Shield,
  Layers,
  Mountain,
  Waves,
  Cpu,
  ArrowRight,
  Check,
  ChevronRight,
  Sliders,
  Activity,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Zap,
  Globe2,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const {
    setActiveTab,
    vessel,
    currentMission,
    stations,
    setSelectedStation,
    seaIce,
    activeRoute,
  } = useApp();

  const [activeVisualizerMode, setActiveVisualizerMode] = useState<'radar' | 'ice'>('radar');
  const [selectedStationPreview, setSelectedStationPreview] = useState<string>('bharati');
  const [radarAngle, setRadarAngle] = useState<number>(0);

  // Smooth radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 1.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const currentPreviewStation = stations.find((s) => s.id === selectedStationPreview) || stations[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b11] text-[#E8F0F3] overflow-y-auto select-none font-sans scroll-smooth">
      {/* 1. Top Portal Header Bar */}
      <header className="sticky top-0 z-40 bg-[#071018]/90 backdrop-blur-md border-b border-[#1B2A35] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1721] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-inner">
            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
              <polygon points="2,28 14,24 22,27 30,22 30,30 2,30" fill="#203a4c" />
              <polyline points="2,28 14,24 22,27 30,22" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 8 L13 14 L22 11 L28 19" stroke="#34d399" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="2 1.5" />
              <circle cx="28" cy="19" r="2.2" fill="#38bdf8" />
              <circle cx="4" cy="8" r="1.8" fill="#34d399" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm sm:text-base text-[#E8F0F3]">
                ICEWAY
              </span>
              <span className="text-[11px] text-[#60737E] font-mono">/</span>
              <span className="text-xs text-[#91A4AE] font-mono">POLAR MARITIME SYSTEM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#91A4AE] font-mono mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NCPOR BRIDGE READY</span>
            <span className="text-[#60737E]">·</span>
            <span>EAST ANTARCTICA</span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <span>Launch Bridge Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section: Cinematic Polar Maritime Command Showcase */}
      <section className="relative px-4 sm:px-8 py-10 lg:py-16 max-w-7xl mx-auto w-full">
        {/* Ambient atmospheric backdrop glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed domain metadata kicker */}
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <span className="tracking-widest uppercase font-semibold">IMO Polar Code Tier 1</span>
              <span aria-hidden="true" className="text-[#60737E]">·</span>
              <span className="text-[#91A4AE]">Autonomous Decision Support</span>
              <span aria-hidden="true" className="text-[#60737E]">·</span>
              <span className="text-emerald-400">Prydz Bay Sector</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#E8F0F3] tracking-tight leading-[1.15]">
              Navigating the Frozen Frontier with Real-Time Precision
            </h1>

            <p className="text-sm sm:text-base text-[#91A4AE] leading-relaxed max-w-2xl font-normal">
              ICEWAY is an operational polar maritime platform engineered for Antarctic research
              vessels. It combines high-resolution Sentinel-1 SAR ice concentration, Kashteljan physical resistance routing, and Monte Carlo iceberg drift forecasting to guarantee safe passage through hazardous pack ice.
            </p>

            {/* Vessel Status Strip (Unboxed metadata with separators) */}
            <div className="p-3.5 rounded-xl bg-[#0B1721] border border-[#1B2A35] flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#91A4AE]">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[#E8F0F3] font-semibold">{vessel.name}</span>
              </div>
              <span aria-hidden="true" className="text-[#60737E] hidden sm:inline">·</span>
              <span>IMO {vessel.imo}</span>
              <span aria-hidden="true" className="text-[#60737E] hidden sm:inline">·</span>
              <span>{vessel.iceClass}</span>
              <span aria-hidden="true" className="text-[#60737E] hidden sm:inline">·</span>
              <span className="text-emerald-400 font-semibold">{vessel.speedKnots} kn SOG</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('overview')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xl shadow-cyan-500/25 cursor-pointer"
              >
                <span>Launch Bridge Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('engine')}
                className="px-5 py-3 rounded-xl bg-[#0B1721] hover:bg-[#152535] text-[#E8F0F3] border border-[#1B2A35] hover:border-cyan-500/40 font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Processing Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('navigation')}
                className="px-4 py-3 rounded-xl text-[#91A4AE] hover:text-[#E8F0F3] text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RouteIcon className="w-4 h-4" />
                <span>Inspect Routes</span>
              </button>
            </div>
          </div>

          {/* Hero Right Column: Interactive Polar Radar & Route Visualizer */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#071018] border border-[#1B2A35] shadow-2xl relative overflow-hidden flex flex-col justify-between">
              {/* Top Selector within Visualizer */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1B2A35] mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-[#E8F0F3] uppercase tracking-wider">
                    {activeVisualizerMode === 'radar' ? 'Acoustic Radar & Sonar' : 'SAR Ice Concentration'}
                  </span>
                </div>

                <div className="flex gap-1 bg-[#0B1721] p-0.5 rounded-lg border border-[#1B2A35]">
                  <button
                    onClick={() => setActiveVisualizerMode('radar')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition cursor-pointer ${
                      activeVisualizerMode === 'radar'
                        ? 'bg-[#152535] text-cyan-300 shadow-sm'
                        : 'text-[#60737E] hover:text-[#91A4AE]'
                    }`}
                  >
                    Radar
                  </button>
                  <button
                    onClick={() => setActiveVisualizerMode('ice')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition cursor-pointer ${
                      activeVisualizerMode === 'ice'
                        ? 'bg-[#152535] text-emerald-300 shadow-sm'
                        : 'text-[#60737E] hover:text-[#91A4AE]'
                    }`}
                  >
                    Sea Ice
                  </button>
                </div>
              </div>

              {/* Polar Scope SVG Visualizer */}
              <div className="relative aspect-square w-full max-w-[340px] mx-auto rounded-full bg-[#04080D] border border-[#1B2A35] overflow-hidden flex items-center justify-center shadow-inner">
                {/* Concentric distance rings */}
                <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
                <div className="absolute inset-14 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-24 rounded-full border border-cyan-500/25" />
                <div className="absolute inset-32 rounded-full border border-cyan-500/30" />

                {/* Range markers */}
                <span className="absolute top-5 font-mono text-[8px] text-[#60737E]">20 NM</span>
                <span className="absolute top-15 font-mono text-[8px] text-[#60737E]">10 NM</span>
                <span className="absolute top-25 font-mono text-[8px] text-[#60737E]">5 NM</span>

                {/* Crosshairs */}
                <div className="absolute w-full h-px bg-cyan-500/10" />
                <div className="absolute h-full w-px bg-cyan-500/10" />

                {/* Simulated Radar Sweep Line */}
                {activeVisualizerMode === 'radar' && (
                  <div
                    className="absolute w-1/2 h-0.5 origin-left top-1/2 left-1/2"
                    style={{
                      transform: `rotate(${radarAngle}deg)`,
                      background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.9) 0%, rgba(56, 189, 248, 0) 100%)',
                      boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
                    }}
                  />
                )}

                {/* Sea Ice Concentration Gradient overlay (when in ice mode) */}
                {activeVisualizerMode === 'ice' && (
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 65% 75%, rgba(52, 211, 153, 0.5) 0%, rgba(56, 189, 248, 0.3) 40%, transparent 75%)',
                    }}
                  />
                )}

                {/* Active Transit Waypoint Path */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  {/* Waypoint Polyline */}
                  <polyline
                    points="60,260 110,210 160,170 215,120 270,75"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {/* Active Ship Position */}
                  <circle cx="160" cy="170" r="5" fill="#38bdf8" />
                  <circle cx="160" cy="170" r="9" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" className="animate-ping" />

                  {/* Iceberg Hazard Contact (B-31) */}
                  <polygon
                    points="210,140 216,134 224,142 218,148"
                    fill="#ef4444"
                    stroke="#fee2e2"
                    strokeWidth="1"
                  />
                  <text x="228" y="145" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    B-31 (TABULAR)
                  </text>

                  {/* Destination Station */}
                  <circle cx="270" cy="75" r="4" fill="#34d399" />
                  <text x="240" y="65" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    BHARATI
                  </text>
                </svg>

                {/* Center origin */}
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 z-10" />
              </div>

              {/* Bottom Quick Metric Footer within Visualizer */}
              <div className="mt-3 pt-3 border-t border-[#1B2A35] flex items-center justify-between text-xs font-mono text-[#91A4AE]">
                <div>
                  <span className="text-[10px] text-[#60737E] block uppercase">Transit To</span>
                  <span className="text-[#E8F0F3] font-semibold">Bharati Roadstead</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#60737E] block uppercase">Distance Remaining</span>
                  <span className="text-cyan-400 font-bold">{activeRoute.distanceKm} km ({activeRoute.distanceNm} NM)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Fleet & Mission Overview Matrix */}
      <section className="px-4 sm:px-8 py-8 border-y border-[#1B2A35] bg-[#071018]/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
              <span className="text-[11px] text-[#60737E] font-mono uppercase block mb-1">
                Active Waypoint Leg
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#E8F0F3] font-mono">
                {activeRoute.distanceKm} <span className="text-xs text-[#91A4AE]">km</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" />
                <span>-1h 40m via A* lead</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
              <span className="text-[11px] text-[#60737E] font-mono uppercase block mb-1">
                Mean Pack-Ice Density
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#E8F0F3] font-mono">
                {seaIce.currentConcentrationPct}% <span className="text-xs text-[#91A4AE]">concentration</span>
              </div>
              <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                <span>First-year medium ice</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
              <span className="text-[11px] text-[#60737E] font-mono uppercase block mb-1">
                Safety Clearance Buffer
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#E8F0F3] font-mono">
                3.0 <span className="text-xs text-[#91A4AE]">NM</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span>POLARIS RIO: +3.8 (Approved)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
              <span className="text-[11px] text-[#60737E] font-mono uppercase block mb-1">
                Bunker MGO Reserve
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#E8F0F3] font-mono">
                412.5 <span className="text-xs text-[#91A4AE]">tons</span>
              </div>
              <div className="text-[11px] text-[#91A4AE] mt-1 flex items-center gap-1 font-mono">
                <span>Burn rate: 18.4 t/day eco</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Route Optimization Showcase: Direct vs A* Avoidance */}
      <section className="px-4 sm:px-8 py-12 lg:py-16 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-2">
            <span className="tracking-widest uppercase font-semibold">Algorithmic Advantage</span>
            <span aria-hidden="true" className="text-[#60737E]">·</span>
            <span className="text-[#91A4AE]">Kashteljan Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8F0F3]">
            Intelligent Ice Penetration vs Standard Great-Circle
          </h2>
          <p className="text-sm text-[#91A4AE] mt-1 max-w-2xl">
            In polar waters, the shortest geometric line frequently traps vessels in fast-ice pressure hummocks. ICEWAY synthesizes minimum-resistance leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Direct Baseline */}
          <div className="p-5 rounded-2xl bg-[#071018] border border-[#1B2A35] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B2A35]">
              <div>
                <span className="text-xs text-[#60737E] font-mono uppercase block">Baseline Route</span>
                <h3 className="text-base font-bold text-[#E8F0F3]">Direct Rhumb Line</h3>
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30">
                UNSAFE IN PACK ICE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Distance</span>
                <span className="text-[#E8F0F3] font-bold">580 km</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Fuel Burn</span>
                <span className="text-rose-400 font-bold">162.8 T</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1721] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Hazard CPA</span>
                <span className="text-rose-400 font-bold">0.8 NM</span>
              </div>
            </div>

            <p className="text-xs text-[#91A4AE] leading-relaxed">
              Penetrates 68% concentration multi-year floes. Passes within 0.8 NM of grounded iceberg B-31. Triggers mandatory IMO speed reduction to 4 knots.
            </p>
          </div>

          {/* Card 2: A* Polar Route */}
          <div className="p-5 rounded-2xl bg-[#0B1721] border border-cyan-500/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#1B2A35]">
              <div>
                <span className="text-xs text-cyan-400 font-mono uppercase block">ICEWAY Optimized</span>
                <h3 className="text-base font-bold text-[#E8F0F3]">A* Shore Polynya Corridor</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                RECOMMENDED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#071018] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Distance</span>
                <span className="text-[#E8F0F3] font-bold">548 km</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#071018] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Fuel Burn</span>
                <span className="text-emerald-400 font-bold">138.2 T</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#071018] border border-[#1B2A35]">
                <span className="text-[10px] text-[#60737E] block">Hazard CPA</span>
                <span className="text-cyan-400 font-bold">4.2 NM</span>
              </div>
            </div>

            <p className="text-xs text-[#91A4AE] leading-relaxed">
              Follows offshore coastal leads with 24% mean concentration. Maintains 4.2 NM safety margin from B-31. Conserves 24.6 tons of MGO fuel.
            </p>

            <button
              onClick={() => setActiveTab('navigation')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>Load Corridor in Route Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Scientific Architecture & Key Capabilities */}
      <section className="px-4 sm:px-8 py-12 lg:py-16 border-t border-[#1B2A35] bg-[#071018]/40">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-2">
              <span className="tracking-widest uppercase font-semibold">Subsystem Capabilities</span>
              <span aria-hidden="true" className="text-[#60737E]">·</span>
              <span className="text-[#91A4AE]">Hydrodynamic & Geodetic</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8F0F3]">
              Built for Harsh High-Latitude Operating Environments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Cpu,
                title: 'Heuristic Hybrid A* Routing',
                desc: 'Continuous state-lattice search that minimizes ice resistance, crushing forces, and fuel consumption per PC5 hull lines.',
                tab: 'engine',
              },
              {
                icon: Layers,
                title: 'Sentinel-1 SAR Radar Ingestion',
                desc: 'Calibrates sigma-0 dual-polarization backscatter matrices to differentiate open water leads from compression ridges.',
                tab: 'seaice',
              },
              {
                icon: Mountain,
                title: 'Monte Carlo Iceberg Drift',
                desc: 'Projects 48-hour collision envelopes for tabular bergs and growler clusters using Ekman ocean-wind drag integration.',
                tab: 'icebergs',
              },
              {
                icon: Shield,
                title: 'IMO POLARIS Risk Assessment',
                desc: 'Calculates Risk Index Outcome (RIO) for every corridor segment, ensuring compliance with Polar Waters Operational Manual.',
                tab: 'reports',
              },
              {
                icon: Waves,
                title: 'Ocean Hydrodynamics & Wind Chill',
                desc: 'Real-time monitoring of swell heights, sea surface temperature, barometric plunges, and structural hull icing rates.',
                tab: 'weather',
              },
              {
                icon: FileText,
                title: 'Expedition Roster & Logging',
                desc: 'Searchable high-density mission database with multi-column sorting, bulk actions, and instant CSV/JSON audit exports.',
                tab: 'missions',
              },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(cap.tab as any)}
                  className="p-5 rounded-2xl bg-[#0B1721] border border-[#1B2A35] hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#E8F0F3] group-hover:text-cyan-300 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-[#91A4AE] leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold">
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Antarctic Research Station Directory Preview */}
      <section className="px-4 sm:px-8 py-12 lg:py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <span className="tracking-widest uppercase font-semibold">Indian Antarctic Program</span>
              <span aria-hidden="true" className="text-[#60737E]">·</span>
              <span className="text-[#91A4AE]">Station Coordinates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8F0F3]">
              Polar Research Stations & Logistical Terminals
            </h2>
            <p className="text-sm text-[#91A4AE] leading-relaxed">
              Select an Antarctic outpost to preview charted coordinates, berth depth, runway facilities, and designated approach sectors.
            </p>

            <div className="space-y-2 pt-2">
              {stations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStationPreview(st.id)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedStationPreview === st.id
                      ? 'bg-[#0B1721] border-cyan-500/60 text-[#E8F0F3] shadow-md'
                      : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#2a3f4e]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{st.name}</span>
                    <span className="text-[10px] text-[#60737E] font-mono">
                      {st.lat.toFixed(2)}°S, {st.lon.toFixed(2)}°E · {st.operator}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#60737E]" />
                </button>
              ))}
            </div>
          </div>

          {/* Station Detail Card */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-2xl bg-[#071018] border border-[#1B2A35] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1B2A35]">
                <div>
                  <span className="text-xs text-cyan-400 font-mono uppercase block">Active Target Station</span>
                  <h3 className="text-lg font-bold text-[#E8F0F3]">{currentPreviewStation.name}</h3>
                </div>
                <div className="text-right font-mono text-xs text-[#91A4AE]">
                  <span>EST. {currentPreviewStation.established}</span>
                  <span className="block text-emerald-400 font-bold">{currentPreviewStation.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block">Latitude</span>
                  <span className="text-[#E8F0F3] font-bold">{currentPreviewStation.lat}° S</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block">Longitude</span>
                  <span className="text-[#E8F0F3] font-bold">{currentPreviewStation.lon}° E</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block">Berth Depth</span>
                  <span className="text-cyan-400 font-bold">{currentPreviewStation.berthDepthMeters || 'Anchorage'} m</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block">Air Support</span>
                  <span className="text-emerald-400 font-bold">{currentPreviewStation.airSupport ? 'Ski Runway' : 'Helo Only'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1721] border border-[#1B2A35] text-xs text-[#91A4AE] space-y-1">
                <span className="font-bold text-[#E8F0F3] block">Navigational Advisory:</span>
                <p>
                  Approaches to {currentPreviewStation.name} require monitoring fast-ice leads in Prydz Bay. Vessels must verify acoustic sonar clearances before entering the roadstead channel.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStation(currentPreviewStation);
                  setActiveTab('navigation');
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Compass className="w-4 h-4" />
                <span>Plot Voyage Route to {currentPreviewStation.name}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="px-4 sm:px-8 py-16 border-t border-[#1B2A35] bg-gradient-to-b from-[#071018] to-[#04080D] text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-xl">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E8F0F3] tracking-tight">
            Ready to Take the Polar Watch?
          </h2>
          <p className="text-sm text-[#91A4AE] leading-relaxed">
            Enter the bridge command console to inspect real-time satellite telemetry, run autonomous A* path searches, or audit active expedition manifests.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-bold text-sm transition flex items-center gap-2 shadow-2xl shadow-cyan-500/30 cursor-pointer"
            >
              <span>Enter Operational Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className="px-6 py-3.5 rounded-xl bg-[#0B1721] hover:bg-[#152535] text-[#E8F0F3] border border-[#1B2A35] font-semibold text-sm transition cursor-pointer"
            >
              <span>Browse Expedition Manifest</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="px-4 sm:px-8 py-6 border-t border-[#1B2A35] bg-[#04080D] text-xs font-mono text-[#60737E] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#E8F0F3]">ICEWAY</span>
          <span>·</span>
          <span>National Centre for Polar and Ocean Research (NCPOR)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>IMO Res. MSC.385(94)</span>
          <span>·</span>
          <span>WGS 84 / EPSG:3031</span>
          <span>·</span>
          <span>Bridge Watch v4.2</span>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  projectLatLon,
  inverseProject,
  formatLatitude,
  formatLongitude,
  BASE_MAP_WIDTH,
  BASE_MAP_HEIGHT,
  coordinatesToSvgPath,
  smoothCoordinatesToSvgPath,
} from '../../utils/geoProjection';
import {
  Vessel,
  Iceberg,
  ResearchStation,
  RouteOption,
  MapLayerState,
  LatLon,
  SimulationState,
} from '../../types/navigation';
import {
  ANTARCTICA_COASTLINE,
  AMERY_ICE_SHELF,
  OCEAN_CURRENT_VECTORS,
  WIND_VECTORS,
  RISK_ZONES,
} from '../../data/mockAntarcticData';
import { MapControls } from './MapControls';
import { LayerControl } from './LayerControl';
import { Ship, Mountain, AlertTriangle, Info, MapPin } from 'lucide-react';

interface AntarcticMapProps {
  vessel: Vessel;
  icebergs: Iceberg[];
  stations: ResearchStation[];
  activeRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  selectedIceberg: Iceberg | null;
  onSelectIceberg: (iceberg: Iceberg | null) => void;
  onSelectStation: (station: ResearchStation | null) => void;
  onSelectVessel: () => void;
  simulation: SimulationState;
  seaIceConcentrationPct: number;
  highlightIntersection: boolean;
  onRecalculateClick?: () => void;
  customClass?: string;
}

export const AntarcticMap: React.FC<AntarcticMapProps> = ({
  vessel,
  icebergs,
  stations,
  activeRoute,
  alternativeRoutes,
  selectedIceberg,
  onSelectIceberg,
  onSelectStation,
  onSelectVessel,
  simulation,
  seaIceConcentrationPct,
  highlightIntersection,
  onRecalculateClick,
  customClass = 'h-full w-full',
}) => {
  // Pan and Zoom transform state
  const [zoom, setZoom] = useState<number>(1.25);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -40, y: -20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorGeo, setCursorGeo] = useState<LatLon | null>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<{
    name: string;
    dist: number;
    eta: string;
    ice: string;
    x: number;
    y: number;
    note?: string;
  } | null>(null);
  const [hoveredStation, setHoveredStation] = useState<ResearchStation | null>(null);
  const [hoveredIceberg, setHoveredIceberg] = useState<Iceberg | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Layer Visibility State
  const [layers, setLayers] = useState<MapLayerState>({
    seaIce: true,
    icebergs: true,
    vesselRoute: true,
    oceanCurrents: true,
    wind: false,
    researchStations: true,
    riskZones: true,
    bathymetry: true,
    graticule: true,
  });

  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute dynamic vessel position along route based on simulation timeStep
  const effectiveVesselPos = useMemo(() => {
    if (!simulation.active || simulation.timeStep === 0) {
      return { lat: vessel.lat, lon: vessel.lon, heading: vessel.headingDeg };
    }

    // Determine position along pathCoordinates based on time step fraction
    const path = activeRoute.pathCoordinates;
    if (path.length === 0) return { lat: vessel.lat, lon: vessel.lon, heading: vessel.headingDeg };

    const fraction = Math.min(1, simulation.timeStep / 24);
    const floatIndex = fraction * (path.length - 1);
    const idx0 = Math.floor(floatIndex);
    const idx1 = Math.min(path.length - 1, idx0 + 1);
    const subFrac = floatIndex - idx0;

    const p0 = path[idx0];
    const p1 = path[idx1];

    const lat = p0.lat + (p1.lat - p0.lat) * subFrac;
    const lon = p0.lon + (p1.lon - p0.lon) * subFrac;

    // Approximate heading towards p1
    const dLon = p1.lon - p0.lon;
    const dLat = p1.lat - p0.lat;
    const heading = ((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;

    return { lat, lon, heading: Math.round(heading) || 142 };
  }, [simulation.active, simulation.timeStep, activeRoute, vessel]);

  // Compute simulated icebergs positions based on drift at timeStep
  const effectiveIcebergs = useMemo(() => {
    if (!simulation.active || simulation.timeStep === 0) {
      return icebergs;
    }

    return icebergs.map((berg) => {
      // Find closest trajectory points
      const traj = berg.trajectory;
      if (!traj || traj.length === 0) return berg;

      // Find matching or interpolated point
      const targetTime = simulation.timeStep;
      let matchedPoint = traj.find((p) => p.tHours === targetTime);
      if (!matchedPoint) {
        // Find surrounding
        const prev = [...traj].reverse().find((p) => p.tHours <= targetTime) || traj[0];
        const next = traj.find((p) => p.tHours >= targetTime) || traj[traj.length - 1];
        if (prev.tHours === next.tHours) {
          matchedPoint = prev;
        } else {
          const ratio = (targetTime - prev.tHours) / (next.tHours - prev.tHours);
          return {
            ...berg,
            lat: prev.lat + (next.lat - prev.lat) * ratio,
            lon: prev.lon + (next.lon - prev.lon) * ratio,
          };
        }
      }

      return {
        ...berg,
        lat: matchedPoint.lat,
        lon: matchedPoint.lon,
      };
    });
  }, [simulation.active, simulation.timeStep, icebergs]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, z * 1.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, z / 1.25));
  const handleResetView = () => {
    setZoom(1.25);
    setPan({ x: -40, y: -20 });
  };
  const handleCenterVessel = () => {
    const vesselProj = projectLatLon(effectiveVesselPos.lat, effectiveVesselPos.lon);
    setPan({
      x: BASE_MAP_WIDTH / 2 - vesselProj.x,
      y: BASE_MAP_HEIGHT / 2 - vesselProj.y,
    });
    setZoom(1.6);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse & Touch drag pan handlers
  const [touchPinchDist, setTouchPinchDist] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Compute Lat/Lon under cursor
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Transform from screen coords to SVG base coords
      const svgX = (clientX - rect.width / 2 - pan.x) / zoom + BASE_MAP_WIDTH / 2;
      const svgY = (clientY - rect.height / 2 - pan.y) / zoom + BASE_MAP_HEIGHT / 2;

      const geo = inverseProject(svgX, svgY);
      setCursorGeo(geo);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setTouchPinchDist(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchPinchDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;
        const svgX = (clientX - rect.width / 2 - pan.x) / zoom + BASE_MAP_WIDTH / 2;
        const svgY = (clientY - rect.height / 2 - pan.y) / zoom + BASE_MAP_HEIGHT / 2;
        const geo = inverseProject(svgX, svgY);
        setCursorGeo(geo);
      }
    } else if (e.touches.length === 2 && touchPinchDist !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchPinchDist;
      setZoom((z) => Math.min(3.8, Math.max(0.6, z * ratio)));
      setTouchPinchDist(currentDist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchPinchDist(null);
  };

  // Wheel zoom with focal point
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((z) => Math.min(3.8, Math.max(0.6, z * factor)));
  };

  // SVG Paths for Antarctica Land & Shelf
  const continentCoastlinePath = useMemo(() => {
    return coordinatesToSvgPath(ANTARCTICA_COASTLINE) + ' Z';
  }, []);

  const ameryShelfPath = useMemo(() => {
    return coordinatesToSvgPath(AMERY_ICE_SHELF) + ' Z';
  }, []);

  // Graticule Polar Parallels: 60°S, 65°S, 70°S, 75°S, 80°S, 85°S
  const parallels = useMemo(() => {
    const lats = [-60, -65, -70, -75, -80, -85];
    return lats.map((lat) => {
      // Circle centered at South Pole
      const poleProj = projectLatLon(-90, 0);
      const sampleProj = projectLatLon(lat, 70); // 70°E
      const radius = Math.abs(sampleProj.y - poleProj.y);
      return {
        lat,
        label: `${Math.abs(lat)}°S`,
        cx: poleProj.x,
        cy: poleProj.y,
        r: radius,
      };
    });
  }, []);

  // Graticule Meridians: 0°, 30°E, 60°E, 90°E, 120°E, 150°E, 180°, 30°W, etc.
  const meridians = useMemo(() => {
    const lons = [0, 30, 60, 90, 120, 150, 180, -150, -120, -90, -60, -30];
    return lons.map((lon) => {
      const p1 = projectLatLon(-58, lon);
      const p2 = projectLatLon(-88, lon);
      return {
        lon,
        label: lon === 0 ? '0°' : lon === 180 ? '180°' : lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`,
        p1,
        p2,
      };
    });
  }, []);

  // Projected vessel position
  const vesselScreenPos = useMemo(() => {
    return projectLatLon(effectiveVesselPos.lat, effectiveVesselPos.lon);
  }, [effectiveVesselPos]);

  // Projected Destination (Bharati Station)
  const bharatiStation = stations.find((s) => s.id === 'bharati');
  const bharatiPos = useMemo(() => {
    return bharatiStation ? projectLatLon(bharatiStation.lat, bharatiStation.lon) : { x: 0, y: 0 };
  }, [bharatiStation]);

  // Intersection Alert coordinates (IB-1042 crossing zone near WP-01 / WP-02)
  const intersectionPoint = useMemo(() => {
    return projectLatLon(-66.50, 66.80);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative overflow-hidden bg-[#050B11] cursor-${isDragging ? 'grabbing' : 'grab'} select-none touch-none ${customClass}`}
    >
      {/* Map Control Buttons */}
      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onCenterVessel={handleCenterVessel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Layer Control Dropdown */}
      <LayerControl layers={layers} onToggleLayer={handleToggleLayer} />

      {/* Navigation Condition Legend */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-lg text-[10px] sm:text-[11px] font-mono pointer-events-auto">
        <div className="text-[9px] sm:text-[10px] text-[#91A4AE] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
          <span>CONDITIONS</span>
          {simulation.active && (
            <span className="text-[8px] sm:text-[9px] px-1 rounded bg-[#E5B84B]/20 text-[#E5B84B]">
              T+{simulation.timeStep}h
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#43C98B]" />
            <span className="text-[#E8F0F3] text-[9px] sm:text-[11px]">LOW</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#E5B84B]" />
            <span className="text-[#E8F0F3] text-[9px] sm:text-[11px]">CAUT</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#E05B5B]" />
            <span className="text-[#E8F0F3] text-[9px] sm:text-[11px]">HIGH</span>
          </div>
        </div>
      </div>

      {/* Compass Indicator & True South Pole orientation */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex flex-col items-end gap-1.5 font-mono pointer-events-none select-none">
        {/* Scale & Coordinate HUD (Compact on mobile) */}
        <div className="bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] text-[#91A4AE] flex items-center gap-2 sm:gap-3 shadow-lg">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-16 h-1 bg-[#5DADE2] relative">
              <span className="absolute -top-3 left-0 text-[9px] text-[#60737E]">0</span>
              <span className="absolute -top-3 right-0 text-[9px] text-[#60737E]">100 NM</span>
            </div>
            <span className="text-[9px] text-[#60737E]">/ 185 km</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-[#1B2A35]" />
          <div>
            {cursorGeo ? (
              <span className="text-[#E8F0F3]">
                {formatLatitude(cursorGeo.lat)}, {formatLongitude(cursorGeo.lon)}
              </span>
            ) : (
              <span>64°49'S, 62°54'E</span>
            )}
          </div>
        </div>

        {/* Polar North Compass Indicator */}
        <div className="bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center relative shadow-lg">
          <div className="w-4 h-4 sm:w-5 sm:h-5 relative flex items-center justify-center">
            {/* North pointing needle toward top-left according to polar rotation */}
            <div className="w-0.5 sm:w-1 h-2.5 sm:h-3.5 bg-[#E05B5B] rounded-t origin-bottom transform -rotate-45 mb-1" />
            <div className="w-0.5 sm:w-1 h-2.5 sm:h-3.5 bg-[#91A4AE] rounded-b origin-top transform -rotate-45 mt-1" />
            <span className="absolute -top-1 text-[7px] sm:text-[8px] font-bold text-[#E05B5B]">N</span>
          </div>
        </div>
      </div>

      {/* Main Vector GIS Map (SVG) */}
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${BASE_MAP_WIDTH} ${BASE_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Sea Ice pattern / gradients */}
          <radialGradient id="oceanBgGradient" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor="#081724" />
            <stop offset="70%" stopColor="#050B11" />
            <stop offset="100%" stopColor="#03070A" />
          </radialGradient>

          {/* Ice pack concentration texture */}
          <pattern id="packIcePattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="10" x2="20" y2="10" stroke="#5DADE2" strokeWidth="0.5" strokeOpacity="0.15" />
            <line x1="10" y1="0" x2="10" y2="20" stroke="#5DADE2" strokeWidth="0.5" strokeOpacity="0.15" />
            <circle cx="10" cy="10" r="1.5" fill="#A0D2EB" fillOpacity="0.25" />
          </pattern>

          {/* Safe Corridor pattern */}
          <pattern id="safeZonePattern" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#43C98B" strokeWidth="1" strokeOpacity="0.2" />
          </pattern>

          {/* Caution Zone pattern */}
          <pattern id="cautionZonePattern" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#E5B84B" strokeWidth="1" strokeOpacity="0.25" />
          </pattern>

          {/* Danger Zone pattern */}
          <pattern id="dangerZonePattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#E05B5B" strokeWidth="1.2" strokeOpacity="0.3" />
          </pattern>

          {/* Radar Heading Cone Gradient */}
          <radialGradient id="radarHeadingCone" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#5DADE2" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#5DADE2" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#5DADE2" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter for active route */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean Background */}
        <rect width={BASE_MAP_WIDTH} height={BASE_MAP_HEIGHT} fill="url(#oceanBgGradient)" />

        {/* 1. Graticule Lines (Lat/Lon) */}
        {layers.graticule && (
          <g className="graticule select-none">
            {/* Latitude Parallels */}
            {parallels.map((p) => (
              <g key={`parallel-${p.lat}`}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={p.r}
                  fill="none"
                  stroke="#1B2A35"
                  strokeWidth="0.75"
                  strokeDasharray="4 3"
                />
                <text
                  x={p.cx + p.r * 0.7}
                  y={p.cy - p.r * 0.7}
                  fill="#60737E"
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {p.label}
                </text>
              </g>
            ))}

            {/* Longitude Meridians */}
            {meridians.map((m) => (
              <g key={`meridian-${m.lon}`}>
                <line
                  x1={m.p1.x}
                  y1={m.p1.y}
                  x2={m.p2.x}
                  y2={m.p2.y}
                  stroke="#1B2A35"
                  strokeWidth="0.75"
                  strokeDasharray="3 4"
                />
                <text
                  x={m.p1.x}
                  y={m.p1.y - 4}
                  fill="#60737E"
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {m.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 2. Sea-Ice Concentration Extent (Dynamic based on percentage) */}
        {layers.seaIce && (
          <g className="sea-ice-layer">
            {/* Marginal Ice Zone (10-35% concentration) */}
            <path
              d="M 220 380 Q 420 340 680 390 T 1050 480 L 1050 780 L 220 780 Z"
              fill="#A0D2EB"
              fillOpacity={0.08 + (seaIceConcentrationPct / 100) * 0.08}
            />
            {/* Medium Pack Ice Zone (35-65% concentration) */}
            <path
              d="M 310 460 Q 520 420 760 480 T 1000 580 L 1000 780 L 310 780 Z"
              fill="#5DADE2"
              fillOpacity={0.12 + (seaIceConcentrationPct / 100) * 0.12}
            />
            {/* Consolidated Fast Ice & Amery Inflow (>65% concentration) */}
            <path
              d="M 430 540 Q 610 520 830 570 T 960 670 L 960 780 L 430 780 Z"
              fill="url(#packIcePattern)"
            />

            {/* Sea Ice Lead Annotation */}
            <text
              x="620"
              y="450"
              fill="#5DADE2"
              fontSize="9"
              fontFamily="IBM Plex Mono, monospace"
              letterSpacing="2"
              opacity="0.6"
            >
              PACK ICE FIELD · CONC: {seaIceConcentrationPct}%
            </text>
          </g>
        )}

        {/* 3. Antarctic Continental Landmass & Ice Shelves */}
        <g className="antarctic-landmass">
          {/* Main Continent Polygon */}
          <path
            d={continentCoastlinePath}
            fill="#0B1721"
            stroke="#1F3342"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Amery Ice Shelf Front */}
          <path
            d={ameryShelfPath}
            fill="#142636"
            stroke="#5DADE2"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* Ice Shelf Labels */}
          <text
            x="670"
            y="640"
            fill="#91A4AE"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="2.5"
            opacity="0.8"
            textAnchor="middle"
          >
            AMERY ICE SHELF
          </text>
          <text
            x="480"
            y="690"
            fill="#60737E"
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="3"
            opacity="0.7"
          >
            EAST ANTARCTICA (QUEEN MAUD LAND)
          </text>
          <text
            x="840"
            y="670"
            fill="#60737E"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="2"
            opacity="0.7"
          >
            PRINCESS ELIZABETH LAND
          </text>
          <text
            x="710"
            y="560"
            fill="#5DADE2"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="2"
            opacity="0.85"
            textAnchor="middle"
          >
            PRYDZ BAY
          </text>
        </g>

        {/* 4. Risk Zones Overlay */}
        {layers.riskZones && (
          <g className="risk-zones-layer select-none">
            {RISK_ZONES.map((zone) => {
              const pathD = coordinatesToSvgPath(zone.coordinates) + ' Z';
              const fillColor =
                zone.level === 'HIGH'
                  ? 'url(#dangerZonePattern)'
                  : zone.level === 'CAUTION'
                  ? 'url(#cautionZonePattern)'
                  : 'url(#safeZonePattern)';
              const strokeColor =
                zone.level === 'HIGH' ? '#E05B5B' : zone.level === 'CAUTION' ? '#E5B84B' : '#43C98B';

              return (
                <g key={zone.id}>
                  <path
                    d={pathD}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="1"
                    strokeDasharray={zone.level === 'LOW' ? '4 3' : 'none'}
                    opacity="0.85"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Ocean Currents Stream Vectors */}
        {layers.oceanCurrents && (
          <g className="ocean-currents-layer">
            {OCEAN_CURRENT_VECTORS.map((vec, i) => {
              const { x, y } = projectLatLon(vec.lat, vec.lon);
              const rad = (vec.headingDeg * Math.PI) / 180;
              const len = vec.speedKnots * 14;
              const x2 = x + len * Math.sin(rad);
              const y2 = y - len * Math.cos(rad);

              return (
                <g key={`current-${i}`} opacity="0.75">
                  <line
                    x1={x}
                    y1={y}
                    x2={x2}
                    y2={y2}
                    stroke="#5DADE2"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  {/* Arrow tip */}
                  <circle cx={x2} cy={y2} r="2" fill="#5DADE2" />
                </g>
              );
            })}
          </g>
        )}

        {/* 6. Wind Vectors (When toggled) */}
        {layers.wind && (
          <g className="wind-layer">
            {WIND_VECTORS.map((w, i) => {
              const { x, y } = projectLatLon(w.lat, w.lon);
              const rad = (w.headingDeg * Math.PI) / 180;
              const len = (w.speedKnots / 25) * 20;
              const x2 = x + len * Math.sin(rad);
              const y2 = y - len * Math.cos(rad);

              return (
                <g key={`wind-${i}`} opacity="0.6">
                  <line
                    x1={x}
                    y1={y}
                    x2={x2}
                    y2={y2}
                    stroke="#91A4AE"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={x2 + 4}
                    y={y2 + 2}
                    fill="#91A4AE"
                    fontSize="8"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {w.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 7. Alternative Routes (Dashed Lines) */}
        {layers.vesselRoute && (
          <g className="alternative-routes-layer">
            {alternativeRoutes.map((route) => {
              const pathD = smoothCoordinatesToSvgPath(route.pathCoordinates);
              return (
                <g key={route.id} opacity="0.6">
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#5DADE2"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 8. Active Route Line (Solid Line with Waypoint Nodes) */}
        {layers.vesselRoute && (
          <g className="active-route-layer">
            {/* Base glowing line */}
            <path
              d={smoothCoordinatesToSvgPath(activeRoute.pathCoordinates)}
              fill="none"
              stroke="#43C98B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#routeGlow)"
            />

            {/* Waypoints */}
            {activeRoute.waypoints.map((wp, index) => {
              const pt = projectLatLon(wp.lat, wp.lon);
              const isStart = index === 0;
              const isDest = index === activeRoute.waypoints.length - 1;

              return (
                <g
                  key={wp.id}
                  className="cursor-pointer group"
                  onMouseEnter={() =>
                    setHoveredWaypoint({
                      name: wp.name,
                      dist: wp.distanceFromStartKm,
                      eta: wp.etaFormatted,
                      ice: wp.iceExposure,
                      x: pt.x,
                      y: pt.y,
                      note: wp.navigationalNote,
                    })
                  }
                  onMouseLeave={() => setHoveredWaypoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isStart || isDest ? 5 : 3.5}
                    fill={isDest ? '#5DADE2' : '#43C98B'}
                    stroke="#071018"
                    strokeWidth="1.5"
                  />
                  {/* Waypoint label */}
                  <text
                    x={pt.x + 8}
                    y={pt.y - 6}
                    fill="#E8F0F3"
                    fontSize="9"
                    fontFamily="IBM Plex Mono, monospace"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {isStart ? 'START' : isDest ? 'BHARATI' : `WP-0${index}`}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 9. Iceberg Trajectory & Uncertainty Corridor (For selected iceberg, or IB-1042 during alert) */}
        {layers.icebergs && (selectedIceberg || highlightIntersection) && (
          <g className="iceberg-trajectory-layer">
            {(() => {
              const berg =
                selectedIceberg ||
                effectiveIcebergs.find((b) => b.id === 'IB-1042') ||
                effectiveIcebergs[0];
              if (!berg || !berg.trajectory) return null;

              const trajPoints = berg.trajectory.map((pt) => ({
                ...pt,
                pos: projectLatLon(pt.lat, pt.lon),
              }));

              // Uncertainty Corridor polygon (Left and right buffer offsets)
              const corridorPointsLeft = trajPoints.map((pt) => {
                const offset = pt.uncertaintyRadiusKm * 0.9;
                return `${pt.pos.x - offset},${pt.pos.y - offset * 0.6}`;
              });
              const corridorPointsRight = [...trajPoints]
                .reverse()
                .map((pt) => {
                  const offset = pt.uncertaintyRadiusKm * 0.9;
                  return `${pt.pos.x + offset},${pt.pos.y + offset * 0.6}`;
                });

              const corridorPath = `M ${corridorPointsLeft.join(' L ')} L ${corridorPointsRight.join(' L ')} Z`;

              return (
                <g>
                  {/* Shaded uncertainty corridor */}
                  <path
                    d={corridorPath}
                    fill="#E05B5B"
                    fillOpacity="0.12"
                    stroke="#E05B5B"
                    strokeWidth="0.75"
                    strokeDasharray="3 3"
                    strokeOpacity="0.4"
                  />

                  {/* Connected trajectory line */}
                  <polyline
                    points={trajPoints.map((p) => `${p.pos.x},${p.pos.y}`).join(' ')}
                    fill="none"
                    stroke="#E05B5B"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Trajectory Time Steps */}
                  {trajPoints.map((p, idx) => (
                    <g key={`traj-step-${idx}`}>
                      <circle
                        cx={p.pos.x}
                        cy={p.pos.y}
                        r={idx === 0 ? 4 : 2.5}
                        fill="#E05B5B"
                        stroke="#071018"
                        strokeWidth="1"
                      />
                      <text
                        x={p.pos.x + 6}
                        y={p.pos.y + 3}
                        fill="#E05B5B"
                        fontSize="8"
                        fontFamily="IBM Plex Mono, monospace"
                        opacity="0.85"
                      >
                        {p.timeLabel}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </g>
        )}

        {/* 10. Route Intersection Alert Marker (T+12 Encounter) */}
        {highlightIntersection && (
          <g className="intersection-warning-marker">
            <circle
              cx={intersectionPoint.x}
              cy={intersectionPoint.y}
              r="18"
              fill="#E05B5B"
              fillOpacity="0.15"
              stroke="#E05B5B"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              className="animate-pulse"
            />
            <circle
              cx={intersectionPoint.x}
              cy={intersectionPoint.y}
              r="6"
              fill="#E05B5B"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Warning Callout Box */}
            <g transform={`translate(${intersectionPoint.x + 16}, ${intersectionPoint.y - 32})`}>
              <rect
                width="160"
                height="48"
                rx="4"
                fill="#0B1721"
                stroke="#E05B5B"
                strokeWidth="1"
                filter="url(#routeGlow)"
              />
              <text
                x="8"
                y="14"
                fill="#E05B5B"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="bold"
              >
                ROUTE INTERSECTION 09h 42m
              </text>
              <text
                x="8"
                y="28"
                fill="#E8F0F3"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
              >
                IB-1042 Separation: 2.8 NM
              </text>
              <text
                x="8"
                y="40"
                fill="#E5B84B"
                fontSize="8"
                fontFamily="IBM Plex Mono, monospace"
              >
                STATUS: CAUTION / DIVERSIION
              </text>
            </g>
          </g>
        )}

        {/* 11. Iceberg Markers */}
        {layers.icebergs && (
          <g className="icebergs-layer">
            {effectiveIcebergs.map((berg) => {
              const pt = projectLatLon(berg.lat, berg.lon);
              const isSelected = selectedIceberg?.id === berg.id;
              // Size proportional to iceberg size (e.g. 1.8km -> radius ~4.5)
              const radius = Math.max(3, Math.min(8, berg.estimatedSizeKm * 2.2));
              const color =
                berg.riskLevel === 'HIGH'
                  ? '#E05B5B'
                  : berg.riskLevel === 'CAUTION'
                  ? '#E5B84B'
                  : '#5DADE2';

              return (
                <g
                  key={berg.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectIceberg(isSelected ? null : berg)}
                  onMouseEnter={() => setHoveredIceberg(berg)}
                  onMouseLeave={() => setHoveredIceberg(null)}
                >
                  {/* Selection pulse ring */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={radius + 5}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.25"
                      strokeDasharray="2 2"
                      className="animate-spin"
                    />
                  )}

                  {/* Iceberg Marker Symbol */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={radius}
                    fill={color}
                    fillOpacity={berg.trajectoryConfidencePct / 100}
                    stroke="#071018"
                    strokeWidth="1.2"
                  />

                  {/* Drift Vector Heading Stik */}
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x + 8 * Math.sin((berg.headingDeg * Math.PI) / 180)}
                    y2={pt.y - 8 * Math.cos((berg.headingDeg * Math.PI) / 180)}
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Iceberg Tag */}
                  <text
                    x={pt.x + radius + 4}
                    y={pt.y + 3}
                    fill="#E8F0F3"
                    fontSize="8"
                    fontFamily="IBM Plex Mono, monospace"
                    className="select-none pointer-events-none drop-shadow"
                    opacity={isSelected ? 1 : 0.75}
                  >
                    {berg.id}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 12. Research Stations */}
        {layers.researchStations && (
          <g className="research-stations-layer">
            {stations.map((st) => {
              const pt = projectLatLon(st.lat, st.lon);
              const isBharati = st.id === 'bharati';

              return (
                <g
                  key={st.id}
                  className="cursor-pointer"
                  onClick={() => onSelectStation(st)}
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  {/* Bharati Beacon Pulse */}
                  {isBharati && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke="#5DADE2"
                      strokeWidth="1"
                      className="animate-ping opacity-50"
                    />
                  )}

                  {/* Station Marker */}
                  <rect
                    x={pt.x - 4}
                    y={pt.y - 4}
                    width="8"
                    height="8"
                    fill={isBharati ? '#5DADE2' : '#E5B84B'}
                    stroke="#071018"
                    strokeWidth="1.2"
                    transform={`rotate(45 ${pt.x} ${pt.y})`}
                  />

                  {/* Station label */}
                  <text
                    x={pt.x + 8}
                    y={pt.y + 3}
                    fill={isBharati ? '#5DADE2' : '#E8F0F3'}
                    fontSize="9"
                    fontFamily="IBM Plex Mono, monospace"
                    fontWeight={isBharati ? 'bold' : 'normal'}
                    className="select-none drop-shadow pointer-events-none"
                  >
                    {st.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 13. Vessel: RV Sagar (Position, Heading Cone & Icon) */}
        <g
          className="vessel-marker-group cursor-pointer"
          onClick={onSelectVessel}
        >
          {/* Translucent Heading Cone (35° beam width) */}
          <path
            d={`M ${vesselScreenPos.x} ${vesselScreenPos.y} 
                L ${vesselScreenPos.x + 60 * Math.sin(((effectiveVesselPos.heading - 20) * Math.PI) / 180)} 
                  ${vesselScreenPos.y - 60 * Math.cos(((effectiveVesselPos.heading - 20) * Math.PI) / 180)} 
                A 60 60 0 0 1 
                  ${vesselScreenPos.x + 60 * Math.sin(((effectiveVesselPos.heading + 20) * Math.PI) / 180)} 
                  ${vesselScreenPos.y - 60 * Math.cos(((effectiveVesselPos.heading + 20) * Math.PI) / 180)} 
                Z`}
            fill="url(#radarHeadingCone)"
          />

          {/* Heading Vector Stik */}
          <line
            x1={vesselScreenPos.x}
            y1={vesselScreenPos.y}
            x2={vesselScreenPos.x + 28 * Math.sin((effectiveVesselPos.heading * Math.PI) / 180)}
            y2={vesselScreenPos.y - 28 * Math.cos((effectiveVesselPos.heading * Math.PI) / 180)}
            stroke="#5DADE2"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Vessel Symbol Circle & Ping */}
          <circle
            cx={vesselScreenPos.x}
            cy={vesselScreenPos.y}
            r="12"
            fill="none"
            stroke="#5DADE2"
            strokeWidth="1"
            className="animate-soft-pulse"
          />
          <circle
            cx={vesselScreenPos.x}
            cy={vesselScreenPos.y}
            r="6"
            fill="#5DADE2"
            stroke="#071018"
            strokeWidth="1.5"
          />

          {/* Directional ship bow indicator */}
          <polygon
            points={`${vesselScreenPos.x},${vesselScreenPos.y - 5} ${vesselScreenPos.x + 4},${vesselScreenPos.y + 4} ${vesselScreenPos.x - 4},${vesselScreenPos.y + 4}`}
            fill="#071018"
            transform={`rotate(${effectiveVesselPos.heading} ${vesselScreenPos.x} ${vesselScreenPos.y})`}
          />

          {/* Vessel Info Tag */}
          <g transform={`translate(${vesselScreenPos.x + 14}, ${vesselScreenPos.y - 18})`}>
            <rect
              width="135"
              height="34"
              rx="3"
              fill="#0B1721"
              fillOpacity="0.9"
              stroke="#5DADE2"
              strokeWidth="1"
            />
            <text
              x="6"
              y="13"
              fill="#E8F0F3"
              fontSize="9"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="bold"
            >
              {vessel.name.toUpperCase()} · {vessel.speedKnots} kn
            </text>
            <text
              x="6"
              y="25"
              fill="#91A4AE"
              fontSize="8"
              fontFamily="IBM Plex Mono, monospace"
            >
              {formatLatitude(effectiveVesselPos.lat)} {formatLongitude(effectiveVesselPos.lon)}
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Waypoint Hover Card */}
      {hoveredWaypoint && (
        <div
          className="absolute z-30 pointer-events-none bg-[#0B1721] border border-[#1B2A35] rounded p-2 text-xs font-mono shadow-2xl"
          style={{
            left: `${((hoveredWaypoint.x - BASE_MAP_WIDTH / 2) * zoom + BASE_MAP_WIDTH / 2 + pan.x)}px`,
            top: `${((hoveredWaypoint.y - BASE_MAP_HEIGHT / 2) * zoom + BASE_MAP_HEIGHT / 2 + pan.y) - 60}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-bold text-[#E8F0F3] border-b border-[#1B2A35] pb-1 mb-1">
            {hoveredWaypoint.name}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-[#91A4AE]">
            <span>Distance:</span>
            <span className="text-[#E8F0F3] text-right">{hoveredWaypoint.dist} km</span>
            <span>Estimated time:</span>
            <span className="text-[#E8F0F3] text-right">{hoveredWaypoint.eta}</span>
            <span>Ice exposure:</span>
            <span
              className={`text-right font-medium ${
                hoveredWaypoint.ice === 'High'
                  ? 'text-[#E05B5B]'
                  : hoveredWaypoint.ice === 'Moderate'
                  ? 'text-[#E5B84B]'
                  : 'text-[#43C98B]'
              }`}
            >
              {hoveredWaypoint.ice}
            </span>
          </div>
          {hoveredWaypoint.note && (
            <div className="mt-1 text-[10px] text-[#5DADE2] max-w-xs border-t border-[#1B2A35] pt-1">
              {hoveredWaypoint.note}
            </div>
          )}
        </div>
      )}

      {/* Floating Iceberg Hover Card */}
      {hoveredIceberg && !selectedIceberg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-[#0B1721] border border-[#1B2A35] rounded px-3 py-1.5 text-xs font-mono shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredIceberg.riskLevel === 'HIGH'
                  ? 'bg-[#E05B5B]'
                  : hoveredIceberg.riskLevel === 'CAUTION'
                  ? 'bg-[#E5B84B]'
                  : 'bg-[#5DADE2]'
              }`}
            />
            <span className="font-bold text-[#E8F0F3]">{hoveredIceberg.id}</span>
          </div>
          <span className="text-[#91A4AE]">
            Velocity: <span className="text-[#E8F0F3]">{hoveredIceberg.velocityMs} m/s</span>
          </span>
          <span className="text-[#91A4AE]">
            Trajectory: <span className="text-[#E8F0F3]">{hoveredIceberg.headingDeg}° SW</span>
          </span>
          <span className="text-[#91A4AE]">
            Confidence: <span className="text-[#43C98B]">{hoveredIceberg.trajectoryConfidencePct}%</span>
          </span>
        </div>
      )}

      {/* Floating Station Hover Card */}
      {hoveredStation && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-[#0B1721] border border-[#1B2A35] rounded px-3 py-2 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#5DADE2]">{hoveredStation.name}</span>
            <span className="text-[#91A4AE]">({hoveredStation.country})</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-[#152535] text-[#91A4AE] border border-[#1B2A35]">
              {hoveredStation.type}
            </span>
          </div>
          <div className="text-[10px] text-[#60737E] mt-0.5">
            Operator: {hoveredStation.operator} · Elev: {hoveredStation.elevationMeters}m
          </div>
        </div>
      )}
    </div>
  );
};

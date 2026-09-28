import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
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
  OCEAN_CURRENT_VECTORS,
  WIND_VECTORS,
  RISK_ZONES,
  ANTARCTICA_COASTLINE,
  AMERY_ICE_SHELF,
} from '../../data/mockAntarcticData';
import { MapControls } from './MapControls';
import { LayerControl, BaseMapType } from './LayerControl';
import {
  formatLatitude,
  formatLongitude,
  calculateDistanceKm,
  kmToNauticalMiles,
} from '../../utils/geoProjection';
import {
  Ship,
  AlertTriangle,
  MapPin,
  Compass,
  Layers,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  Crosshair,
  RotateCw,
  Navigation,
  Globe,
  Radio,
  Eye,
  Info,
  CheckCircle2,
  Wind,
  Waves,
} from 'lucide-react';

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

// Open Source Base Map Configurations
const BASE_MAP_PROVIDERS: Record<
  BaseMapType,
  {
    name: string;
    icon: string;
    url: string;
    options: L.TileLayerOptions;
    overlayUrl?: string;
    overlayOptions?: L.TileLayerOptions;
    attribution: string;
  }
> = {
  satellite: {
    name: 'Satellite (True Polar)',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
    },
    attribution: 'Esri Satellite Imagery',
  },
  ocean: {
    name: 'Ocean Bathymetry',
    icon: '🌊',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 13,
      attribution: '&copy; Esri, GEBCO, NOAA, National Geographic',
    },
    overlayOptions: {
      maxZoom: 13,
    },
    attribution: 'GEBCO / NOAA Ocean Bathymetry',
  },
  dark: {
    name: 'Tactical Bridge Radar',
    icon: '🌒',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    attribution: 'CartoDB Dark Matter / OpenStreetMap',
  },
  osm: {
    name: 'OpenStreetMap',
    icon: '🗺️',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    attribution: 'OpenStreetMap contributors',
  },
  topo: {
    name: 'Topographic Relief',
    icon: '🏔️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      subdomains: 'abc',
      maxZoom: 17,
      attribution: '&copy; OpenStreetMap contributors, SRTM | OpenTopoMap',
    },
    attribution: 'OpenTopoMap / SRTM',
  },
};

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
  // Base map & layer visibility states
  const [baseMap, setBaseMap] = useState<BaseMapType>('satellite');
  const [seaIceOpacity, setSeaIceOpacity] = useState<number>(0.65);
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

  const [cursorGeo, setCursorGeo] = useState<LatLon | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showQuickBasemapPicker, setShowQuickBasemapPicker] = useState<boolean>(false);

  // References for Leaflet map & layer groups
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const baseOverlayLayerRef = useRef<L.TileLayer | null>(null);

  const seaIceGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const vesselGroupRef = useRef<L.LayerGroup | null>(null);
  const icebergsGroupRef = useRef<L.LayerGroup | null>(null);
  const stationsGroupRef = useRef<L.LayerGroup | null>(null);
  const environmentGroupRef = useRef<L.LayerGroup | null>(null);
  const riskZonesGroupRef = useRef<L.LayerGroup | null>(null);
  const bathymetryGroupRef = useRef<L.LayerGroup | null>(null);
  const graticuleGroupRef = useRef<L.LayerGroup | null>(null);
  const collisionAlertGroupRef = useRef<L.LayerGroup | null>(null);

  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute dynamic vessel position along route based on simulation timeStep
  const effectiveVesselPos = useMemo(() => {
    if (!simulation.active || simulation.timeStep === 0) {
      return { lat: vessel.lat, lon: vessel.lon, heading: vessel.headingDeg };
    }

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
      const traj = berg.trajectory;
      if (!traj || traj.length === 0) return berg;

      const targetTime = simulation.timeStep;
      let matchedPoint = traj.find((p) => p.tHours === targetTime);
      if (!matchedPoint) {
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create Leaflet map centered at Southern Ocean / East Antarctica transit
    const map = L.map(containerRef.current, {
      center: [-67.2, 69.5],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    // Layer groups for marine features
    seaIceGroupRef.current = L.layerGroup().addTo(map);
    bathymetryGroupRef.current = L.layerGroup().addTo(map);
    riskZonesGroupRef.current = L.layerGroup().addTo(map);
    graticuleGroupRef.current = L.layerGroup().addTo(map);
    environmentGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);
    icebergsGroupRef.current = L.layerGroup().addTo(map);
    stationsGroupRef.current = L.layerGroup().addTo(map);
    collisionAlertGroupRef.current = L.layerGroup().addTo(map);
    vesselGroupRef.current = L.layerGroup().addTo(map);

    // Initial base tile layer
    const provider = BASE_MAP_PROVIDERS['satellite'];
    baseTileLayerRef.current = L.tileLayer(provider.url, provider.options).addTo(map);

    // Track zoom and mousemove
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('mousemove', (e) => {
      setCursorGeo({
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lon: parseFloat(e.latlng.lng.toFixed(4)),
      });
    });

    mapRef.current = map;

    // Resize observer to prevent tile gray-out
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Base Map Tile Switcher
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const provider = BASE_MAP_PROVIDERS[baseMap];

    // Remove existing base layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (baseOverlayLayerRef.current) {
      map.removeLayer(baseOverlayLayerRef.current);
      baseOverlayLayerRef.current = null;
    }

    // Add new primary base layer
    const newBase = L.tileLayer(provider.url, provider.options).addTo(map);
    newBase.bringToBack();
    baseTileLayerRef.current = newBase;

    // Add optional reference overlay (e.g. Ocean depth soundings & labels)
    if (provider.overlayUrl) {
      const newOverlay = L.tileLayer(provider.overlayUrl, provider.overlayOptions || provider.options).addTo(map);
      baseOverlayLayerRef.current = newOverlay;
    }
  }, [baseMap]);

  // Render Vessel Layer
  useEffect(() => {
    if (!vesselGroupRef.current || !mapRef.current) return;
    const group = vesselGroupRef.current;
    group.clearLayers();

    const { lat, lon, heading } = effectiveVesselPos;

    // 1. Vessel Safety Perimeter (3.0 NM Clearance Buffer)
    const safetyBufferMeters = (vessel.safetyClearanceNm || 3.0) * 1852;
    const safetyPerimeter = L.circle([lat, lon], {
      radius: safetyBufferMeters,
      color: '#38bdf8',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#38bdf8',
      fillOpacity: 0.08,
      interactive: false,
    });
    group.addLayer(safetyPerimeter);

    // 2. Heading Course Predictor Vector (3 NM ahead)
    const headingRad = (heading * Math.PI) / 180;
    const vectorDistKm = 5.5; // ~3 NM
    const dLat = (vectorDistKm / 6371) * (180 / Math.PI) * Math.cos(headingRad);
    const dLon =
      ((vectorDistKm / 6371) * (180 / Math.PI) * Math.sin(headingRad)) /
      Math.cos((lat * Math.PI) / 180);
    const endLat = lat + dLat;
    const endLon = lon + dLon;

    const headingVector = L.polyline(
      [
        [lat, lon],
        [endLat, endLon],
      ],
      {
        color: '#38bdf8',
        weight: 2,
        dashArray: '4, 4',
        opacity: 0.9,
      }
    );
    group.addLayer(headingVector);

    // 3. Custom Realistic Vessel Marker (Detailed Polar Research Vessel / Icebreaker)
    const vesselIcon = L.divIcon({
      className: 'vessel-marker-container',
      iconSize: [64, 64],
      iconAnchor: [32, 32],
      html: `
        <div class="relative w-16 h-16 flex items-center justify-center cursor-pointer select-none">
          <!-- Pulsing Radar Ping -->
          <div class="absolute inset-0 rounded-full border border-sky-400/40 animate-radar-ping pointer-events-none"></div>

          <!-- Radar Sweep Cone -->
          <div class="absolute w-14 h-14 rounded-full border border-sky-400/20 overflow-hidden pointer-events-none">
            <div class="w-full h-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(56,189,248,0.25)_360deg)]"></div>
          </div>

          <!-- Rotating Vessel Silhouette -->
          <div style="transform: rotate(${heading}deg);" class="relative z-10 transition-transform duration-300 ease-out">
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" class="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
              <!-- Ship Hull Base -->
              <path d="M50 8 C43 28, 38 48, 38 78 C38 88, 43 92, 50 92 C57 92, 62 88, 62 78 C62 48, 57 28, 50 8 Z" fill="#0C1B2A" stroke="#38BDF8" stroke-width="2.5" />
              <!-- Reinforced Icebreaker Bow Chine -->
              <path d="M47 12 L50 7 L53 12 L50 26 Z" fill="#38BDF8" />
              <!-- Superstructure / Wheelhouse Deck -->
              <rect x="42" y="38" width="16" height="22" rx="2" fill="#1E3A54" stroke="#7DD3FC" stroke-width="1.5" />
              <!-- Bridge Navigation Windows -->
              <line x1="44" y1="42" x2="56" y2="42" stroke="#38BDF8" stroke-width="2" />
              <!-- Helipad Deck -->
              <circle cx="50" cy="74" r="6" fill="#152738" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="2, 2" />
              <text x="50" y="76.5" font-size="6" font-family="monospace" font-weight="bold" fill="#38BDF8" text-anchor="middle">H</text>
              <!-- Bow Heading Direction Needle -->
              <polygon points="50,0 45,10 55,10" fill="#34D399" />
            </svg>
          </div>

          <!-- Vessel Label Tag -->
          <div class="absolute -bottom-2 bg-[#061018]/90 border border-sky-400/50 rounded px-1.5 py-0.5 text-[9px] font-mono text-sky-300 whitespace-nowrap shadow-lg">
            RV Sagar <span class="text-emerald-400 font-bold">12.4 kn</span>
          </div>
        </div>
      `,
    });

    const marker = L.marker([lat, lon], { icon: vesselIcon, zIndexOffset: 1000 });

    // Interactive Vessel Popup
    marker.bindPopup(`
      <div class="p-3 w-64 bg-[#091522] text-[#E8F0F3] font-mono text-xs rounded-lg select-none">
        <div class="flex items-center justify-between pb-2 border-b border-[#1B2A35]">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-bold text-sky-400 text-sm">RV SAGAR</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-[#152535] text-sky-300 font-medium">PC 5</span>
        </div>

        <div class="py-2 space-y-1 text-[11px]">
          <div class="flex justify-between">
            <span class="text-[#718290]">Call Sign / IMO:</span>
            <span class="font-semibold text-white">VTCY / 9841203</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">Coordinates:</span>
            <span class="text-white">${formatLatitude(lat)}, ${formatLongitude(lon)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">SOG / COG:</span>
            <span class="text-emerald-400 font-semibold">${vessel.speedKnots} kn / ${heading}°</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">Draft / Beam:</span>
            <span class="text-white">${vessel.draftMeters}m / ${vessel.beamMeters}m</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">Fuel Reserve:</span>
            <span class="text-amber-300">${vessel.fuelRemainingTons} T (${vessel.fuelPct}%)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">Destination:</span>
            <span class="text-sky-300 font-medium">${vessel.destination}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#718290]">Safety Buffer:</span>
            <span class="text-emerald-400">${vessel.safetyClearanceNm} NM Ring</span>
          </div>
        </div>

        <button id="inspect-vessel-btn" class="w-full mt-2 py-1.5 px-2 bg-sky-500 hover:bg-sky-400 text-[#071018] font-bold rounded text-[11px] transition text-center cursor-pointer shadow">
          INSPECT VESSEL SPECIFICATIONS
        </button>
      </div>
    `);

    marker.on('popupopen', () => {
      const btn = document.getElementById('inspect-vessel-btn');
      if (btn) {
        btn.onclick = () => onSelectVessel();
      }
    });

    group.addLayer(marker);
  }, [effectiveVesselPos, vessel, onSelectVessel]);

  // Render Active & Alternative Voyage Routes and Waypoints
  useEffect(() => {
    if (!routesGroupRef.current || !mapRef.current) return;
    const group = routesGroupRef.current;
    group.clearLayers();

    if (!layers.vesselRoute) return;

    // 1. Alternative Routes (Dashed lines with distinct tactical colors)
    alternativeRoutes.forEach((alt) => {
      const latlngs: L.LatLngTuple[] = alt.pathCoordinates.map((p) => [p.lat, p.lon]);
      const color =
        alt.tag === 'FUEL_EFFICIENT'
          ? '#fbbf24'
          : alt.tag === 'SAFETY_PRIORITY'
          ? '#34d399'
          : alt.tag === 'AVOIDANCE_RECALCULATED'
          ? '#a78bfa'
          : '#94a3b8';

      const polyline = L.polyline(latlngs, {
        color,
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.7,
      });

      polyline.bindTooltip(
        `<div class="font-mono text-xs">
          <div class="font-bold" style="color: ${color}">${alt.displayName}</div>
          <div class="text-[10px] text-gray-300">${alt.distanceNm.toFixed(0)} NM | ETA: ${alt.etaFormatted} | Risk: ${alt.riskScore}/100</div>
        </div>`,
        { sticky: true }
      );

      group.addLayer(polyline);
    });

    // 2. Active Route: Outer Glow Halo & Inner Nautical Track
    const activeLatLngs: L.LatLngTuple[] = activeRoute.pathCoordinates.map((p) => [p.lat, p.lon]);

    // Outer glow halo
    const haloLine = L.polyline(activeLatLngs, {
      color: '#38bdf8',
      weight: 8,
      opacity: 0.25,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    });
    group.addLayer(haloLine);

    // Inner sharp track line
    const coreLine = L.polyline(activeLatLngs, {
      color: '#38bdf8',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });
    coreLine.bindTooltip(
      `<div class="font-mono text-xs">
        <div class="font-bold text-sky-400">${activeRoute.displayName} (ACTIVE)</div>
        <div class="text-[10px] text-gray-300">${activeRoute.distanceNm.toFixed(0)} NM | ETA: ${activeRoute.etaFormatted}</div>
      </div>`,
      { sticky: true }
    );
    group.addLayer(coreLine);

    // 3. Waypoints along Active Route
    activeRoute.waypoints.forEach((wp, idx) => {
      const isStart = idx === 0;
      const isDest = idx === activeRoute.waypoints.length - 1;

      const wpIcon = L.divIcon({
        className: 'wp-marker',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        html: `
          <div class="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold shadow-lg border cursor-pointer select-none transition-transform hover:scale-125 ${
            isDest
              ? 'bg-[#E5B84B] text-[#071018] border-amber-300'
              : isStart
              ? 'bg-[#34D399] text-[#071018] border-emerald-300'
              : 'bg-[#0B1721] text-[#38BDF8] border-sky-400'
          }">
            ${isStart ? 'S' : isDest ? 'D' : idx}
          </div>
        `,
      });

      const wpMarker = L.marker([wp.lat, wp.lon], { icon: wpIcon });

      wpMarker.bindPopup(`
        <div class="p-2.5 w-56 bg-[#091522] text-[#E8F0F3] font-mono text-xs rounded-lg select-none">
          <div class="font-bold text-sky-400 text-xs border-b border-[#1B2A35] pb-1.5 flex justify-between">
            <span>${wp.name}</span>
            <span class="text-[10px] text-gray-400">WP-${idx}</span>
          </div>
          <div class="py-1.5 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-gray-400">Position:</span>
              <span>${formatLatitude(wp.lat)}, ${formatLongitude(wp.lon)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Dist from start:</span>
              <span class="text-white">${wp.distanceFromStartKm} km (${kmToNauticalMiles(wp.distanceFromStartKm).toFixed(0)} NM)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Estimated ETA:</span>
              <span class="text-emerald-400 font-semibold">${wp.etaFormatted}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Ice Exposure:</span>
              <span class="${wp.iceExposure === 'High' ? 'text-red-400' : wp.iceExposure === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'} font-semibold">
                ${wp.iceExposure}
              </span>
            </div>
          </div>
          ${
            wp.navigationalNote
              ? `<div class="mt-1 p-1 bg-[#102231] rounded text-[10px] text-sky-200 border-l-2 border-sky-400 leading-tight">
                  ${wp.navigationalNote}
                </div>`
              : ''
          }
        </div>
      `);

      group.addLayer(wpMarker);
    });
  }, [activeRoute, alternativeRoutes, layers.vesselRoute]);

  // Render Icebergs & Drift Vectors
  useEffect(() => {
    if (!icebergsGroupRef.current || !mapRef.current) return;
    const group = icebergsGroupRef.current;
    group.clearLayers();

    if (!layers.icebergs) return;

    effectiveIcebergs.forEach((berg) => {
      const isSelected = selectedIceberg?.id === berg.id;
      const riskColor =
        berg.riskLevel === 'HIGH' ? '#EF4444' : berg.riskLevel === 'CAUTION' ? '#F59E0B' : '#38BDF8';

      // 1. Iceberg Drift Velocity Vector (Arrow)
      const driftRad = (berg.headingDeg * Math.PI) / 180;
      const driftDistKm = berg.velocityMs * 3.6 * 8; // scaled visual 8h displacement
      const dLat = (driftDistKm / 6371) * (180 / Math.PI) * Math.cos(driftRad);
      const dLon =
        ((driftDistKm / 6371) * (180 / Math.PI) * Math.sin(driftRad)) /
        Math.cos((berg.lat * Math.PI) / 180);

      const vectorLine = L.polyline(
        [
          [berg.lat, berg.lon],
          [berg.lat + dLat, berg.lon + dLon],
        ],
        {
          color: riskColor,
          weight: 1.8,
          dashArray: '3, 3',
          opacity: 0.75,
        }
      );
      group.addLayer(vectorLine);

      // 2. Monte Carlo Uncertainty Forecast Trajectory (if available)
      if (berg.trajectory && berg.trajectory.length > 1) {
        const trajPoints: L.LatLngTuple[] = berg.trajectory.map((t) => [t.lat, t.lon]);
        const trajPolyline = L.polyline(trajPoints, {
          color: riskColor,
          weight: 1.2,
          dashArray: '4, 4',
          opacity: 0.5,
        });
        group.addLayer(trajPolyline);

        // Uncertainty radius circle for T+24 / T+48
        const finalPoint = berg.trajectory[berg.trajectory.length - 1];
        if (finalPoint && finalPoint.uncertaintyRadiusKm) {
          const uncertaintyCircle = L.circle([finalPoint.lat, finalPoint.lon], {
            radius: finalPoint.uncertaintyRadiusKm * 1000,
            color: riskColor,
            weight: 1,
            dashArray: '2, 4',
            fillColor: riskColor,
            fillOpacity: 0.05,
            interactive: false,
          });
          group.addLayer(uncertaintyCircle);
        }
      }

      // 3. Realistic Iceberg Symbol Marker
      const sizePx = Math.max(20, Math.min(36, Math.round(berg.estimatedSizeKm * 8 + 14)));
      const isTabular = berg.type === 'TABULAR';
      const isPinnacle = berg.type === 'PINNACLE';

      const bergIcon = L.divIcon({
        className: 'iceberg-marker',
        iconSize: [sizePx, sizePx],
        iconAnchor: [sizePx / 2, sizePx / 2],
        html: `
          <div class="relative w-full h-full flex items-center justify-center cursor-pointer group select-none">
            <!-- Pulsing Halo for HIGH risk or Selected -->
            ${
              berg.riskLevel === 'HIGH' || isSelected
                ? `<div class="absolute inset-0 rounded-full border border-red-500/60 animate-ping pointer-events-none"></div>`
                : ''
            }
            
            <div class="relative w-full h-full rounded transition-transform group-hover:scale-125 flex items-center justify-center ${
              isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
            }">
              <svg width="${sizePx}" height="${sizePx}" viewBox="0 0 40 40" fill="none">
                <!-- Outer Radar Detection Circle -->
                <circle cx="20" cy="20" r="18" fill="#0C1B2A" stroke="${riskColor}" stroke-width="${isSelected ? '2.5' : '1.5'}" fill-opacity="0.85" />
                
                <!-- Realistic Iceberg Core Shape -->
                ${
                  isTabular
                    ? `<rect x="10" y="12" width="20" height="15" rx="1.5" fill="#E2F1F8" stroke="#38BDF8" stroke-width="1.2" />
                       <line x1="10" y1="17" x2="30" y2="17" stroke="#93C5FD" stroke-width="1" />`
                    : isPinnacle
                    ? `<polygon points="20,8 31,28 9,28" fill="#E2F1F8" stroke="#38BDF8" stroke-width="1.2" />`
                    : `<path d="M12 26 C12 16, 28 16, 28 26 Z" fill="#E2F1F8" stroke="#38BDF8" stroke-width="1.2" />`
                }
              </svg>
            </div>

            <!-- Berg Name Tag -->
            <div class="absolute -bottom-3 bg-[#061018]/90 border border-gray-700 rounded px-1 text-[8px] font-mono whitespace-nowrap ${
              berg.riskLevel === 'HIGH' ? 'text-red-400 font-bold' : 'text-gray-300'
            }">
              ${berg.name.split(' ')[0]}
            </div>
          </div>
        `,
      });

      const bergMarker = L.marker([berg.lat, berg.lon], { icon: bergIcon });

      bergMarker.bindPopup(`
        <div class="p-3 w-64 bg-[#091522] text-[#E8F0F3] font-mono text-xs rounded-lg select-none">
          <div class="flex items-center justify-between pb-1.5 border-b border-[#1B2A35]">
            <span class="font-bold text-white text-xs">${berg.name}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${
              berg.riskLevel === 'HIGH'
                ? 'bg-red-950 text-red-400 border border-red-800'
                : berg.riskLevel === 'CAUTION'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-sky-950 text-sky-400 border border-sky-800'
            }">${berg.riskLevel} RISK</span>
          </div>

          <div class="py-2 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-gray-400">Classification:</span>
              <span class="text-white font-medium">${berg.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Dimensions:</span>
              <span class="text-sky-300 font-medium">${berg.estimatedSizeKm} km span</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Underwater Draft:</span>
              <span class="text-red-300 font-semibold">${berg.draftMeters} m depth</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Freeboard Height:</span>
              <span class="text-white">${berg.freeboardMeters} m</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Drift Vector:</span>
              <span class="text-emerald-400 font-medium">${berg.velocityMs} m/s @ ${berg.headingDeg}°</span>
            </div>
            ${
              berg.proximityToRouteNm !== undefined
                ? `<div class="flex justify-between">
                    <span class="text-gray-400">Route Proximity:</span>
                    <span class="${berg.proximityToRouteNm <= 3.0 ? 'text-red-400 font-bold' : 'text-white'}">
                      ${berg.proximityToRouteNm} NM
                    </span>
                  </div>`
                : ''
            }
          </div>

          <button id="select-berg-btn-${berg.id}" class="w-full mt-1.5 py-1 px-2 bg-[#1B2A35] hover:bg-sky-600 text-white rounded text-[10px] font-semibold transition text-center cursor-pointer">
            SELECT IN INTEL PANEL
          </button>
        </div>
      `);

      bergMarker.on('popupopen', () => {
        const btn = document.getElementById(`select-berg-btn-${berg.id}`);
        if (btn) {
          btn.onclick = () => onSelectIceberg(berg);
        }
      });

      bergMarker.on('click', () => {
        onSelectIceberg(berg);
      });

      group.addLayer(bergMarker);
    });
  }, [effectiveIcebergs, layers.icebergs, selectedIceberg, onSelectIceberg]);

  // Pan to selected iceberg when chosen in the Intel Panel or targets list
  useEffect(() => {
    if (selectedIceberg && mapRef.current) {
      mapRef.current.flyTo([selectedIceberg.lat, selectedIceberg.lon], Math.max(mapRef.current.getZoom(), 6.5), {
        duration: 1.0,
      });
    }
  }, [selectedIceberg]);

  // Render Research Stations
  useEffect(() => {
    if (!stationsGroupRef.current || !mapRef.current) return;
    const group = stationsGroupRef.current;
    group.clearLayers();

    if (!layers.researchStations) return;

    stations.forEach((st) => {
      const isBharati = st.id === 'bharati';

      const stationIcon = L.divIcon({
        className: 'station-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `
          <div class="relative w-7 h-7 flex items-center justify-center cursor-pointer group select-none">
            ${
              isBharati
                ? `<div class="absolute inset-0 rounded-full border border-amber-400 animate-ping pointer-events-none opacity-40"></div>`
                : ''
            }
            <div class="w-6 h-6 rounded-full bg-[#0B1721] border ${
              isBharati ? 'border-amber-400' : 'border-sky-400'
            } flex items-center justify-center shadow-lg transition-transform group-hover:scale-125">
              <span class="text-xs">${st.flagCode === 'IN' ? '🇮🇳' : st.flagCode === 'AU' ? '🇦🇺' : st.flagCode === 'CN' ? '🇨🇳' : st.flagCode === 'RU' ? '🇷🇺' : '⚓'}</span>
            </div>
            <div class="absolute -bottom-3 bg-[#061018]/90 border border-gray-700 rounded px-1 text-[8px] font-mono text-gray-200 whitespace-nowrap">
              ${st.name.replace(' Station', '')}
            </div>
          </div>
        `,
      });

      const marker = L.marker([st.lat, st.lon], { icon: stationIcon });

      marker.bindPopup(`
        <div class="p-3 w-64 bg-[#091522] text-[#E8F0F3] font-mono text-xs rounded-lg select-none">
          <div class="flex items-center justify-between pb-1.5 border-b border-[#1B2A35]">
            <div class="flex items-center gap-1.5">
              <span class="text-sm">${st.flagCode === 'IN' ? '🇮🇳' : st.flagCode === 'AU' ? '🇦🇺' : st.flagCode === 'CN' ? '🇨🇳' : st.flagCode === 'RU' ? '🇷🇺' : '⚓'}</span>
              <span class="font-bold text-white text-xs">${st.name}</span>
            </div>
            <span class="text-[9px] px-1 rounded bg-[#152535] text-amber-300 font-semibold">${st.type}</span>
          </div>

          <div class="py-2 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-gray-400">Operator:</span>
              <span class="text-white truncate max-w-[130px]">${st.operator}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Established:</span>
              <span class="text-white">${st.established}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Coordinates:</span>
              <span class="text-white">${formatLatitude(st.lat)}, ${formatLongitude(st.lon)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Elevation:</span>
              <span class="text-white">${st.elevationMeters} m</span>
            </div>
            ${
              st.berthDepthMeters
                ? `<div class="flex justify-between">
                    <span class="text-gray-400">Berth Depth:</span>
                    <span class="text-emerald-400 font-semibold">${st.berthDepthMeters} m</span>
                  </div>`
                : ''
            }
            <div class="flex justify-between">
              <span class="text-gray-400">Air Support:</span>
              <span class="${st.airSupport ? 'text-emerald-400' : 'text-gray-400'} font-semibold">
                ${st.airSupport ? 'Active Runway' : 'Helipad Only'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Status:</span>
              <span class="text-emerald-400 font-bold">${st.status}</span>
            </div>
          </div>

          <button id="select-station-btn-${st.id}" class="w-full mt-1.5 py-1 px-2 bg-sky-500 hover:bg-sky-400 text-[#071018] rounded text-[10px] font-bold transition text-center cursor-pointer">
            SET AS ACTIVE DESTINATION
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`select-station-btn-${st.id}`);
        if (btn) {
          btn.onclick = () => onSelectStation(st);
        }
      });

      marker.on('click', () => {
        onSelectStation(st);
      });

      group.addLayer(marker);
    });
  }, [stations, layers.researchStations, onSelectStation]);

  // Render Sea Ice Concentration Polygons (SAR Layer)
  useEffect(() => {
    if (!seaIceGroupRef.current || !mapRef.current) return;
    const group = seaIceGroupRef.current;
    group.clearLayers();

    if (!layers.seaIce) return;

    // Sea Ice Concentration contours matching Southern Ocean geography
    // 1. Coastal Fast Ice (>80% concentration)
    const fastIceCoords: L.LatLngTuple[] = [
      [-69.2, 68.0],
      [-69.6, 71.0],
      [-72.0, 71.5],
      [-72.5, 73.5],
      [-70.2, 75.0],
      [-69.3, 76.5],
      [-68.5, 78.0],
      [-68.8, 79.5],
      [-71.5, 78.0],
      [-73.5, 72.0],
      [-70.5, 67.0],
    ];

    const fastIcePoly = L.polygon(fastIceCoords, {
      color: '#A0D2EB',
      weight: 1.5,
      fillColor: '#D0EAF6',
      fillOpacity: seaIceOpacity * 0.75,
      dashArray: '3, 3',
    });
    fastIcePoly.bindTooltip('Fast Ice Zone (>80% Conc. - Fast to Coast)', { sticky: true });
    group.addLayer(fastIcePoly);

    // 2. Heavy Pack Ice Belt (50% to 75% concentration)
    const packIceCoords: L.LatLngTuple[] = [
      [-66.8, 63.5],
      [-67.5, 68.0],
      [-67.9, 73.0],
      [-68.6, 75.5],
      [-68.0, 78.0],
      [-66.9, 76.0],
      [-66.4, 71.0],
      [-66.2, 65.0],
    ];

    const packIcePoly = L.polygon(packIceCoords, {
      color: '#7EC1E3',
      weight: 1.2,
      fillColor: '#88CAEB',
      fillOpacity: seaIceOpacity * 0.5,
    });
    packIcePoly.bindTooltip(
      `Sea Ice Pack Corridor (${seaIceConcentrationPct}% Avg Concentration)`,
      { sticky: true }
    );
    group.addLayer(packIcePoly);

    // 3. Marginal Ice Zone (MIZ) 15% ice edge boundary
    const iceEdgeCoords: L.LatLngTuple[] = [
      [-64.0, 58.0],
      [-64.8, 63.0],
      [-65.5, 68.0],
      [-66.2, 74.0],
      [-65.8, 79.0],
      [-65.2, 85.0],
    ];

    const iceEdgeLine = L.polyline(iceEdgeCoords, {
      color: '#E0F2FE',
      weight: 2,
      dashArray: '5, 5',
      opacity: 0.8,
    });
    iceEdgeLine.bindTooltip('15% Marginal Ice Zone (MIZ) Edge - Ice Patrol Boundary', {
      sticky: true,
    });
    group.addLayer(iceEdgeLine);
  }, [layers.seaIce, seaIceOpacity, seaIceConcentrationPct]);

  // Render Navigation Risk Zones
  useEffect(() => {
    if (!riskZonesGroupRef.current || !mapRef.current) return;
    const group = riskZonesGroupRef.current;
    group.clearLayers();

    if (!layers.riskZones) return;

    RISK_ZONES.forEach((zone) => {
      const coords: L.LatLngTuple[] = zone.coordinates.map((c) => [c.lat, c.lon]);
      const color =
        zone.level === 'HIGH' ? '#EF4444' : zone.level === 'CAUTION' ? '#F59E0B' : '#10B981';

      const polygon = L.polygon(coords, {
        color,
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: color,
        fillOpacity: 0.1,
      });

      polygon.bindTooltip(
        `<div class="font-mono text-xs">
          <div class="font-bold" style="color: ${color}">${zone.label}</div>
          <div class="text-[10px] text-gray-300">Risk Profile: ${zone.level}</div>
        </div>`,
        { sticky: true }
      );

      group.addLayer(polygon);
    });
  }, [layers.riskZones]);

  // Render Bathymetry Hazard Zones (<50m depth shoals)
  useEffect(() => {
    if (!bathymetryGroupRef.current || !mapRef.current) return;
    const group = bathymetryGroupRef.current;
    group.clearLayers();

    if (!layers.bathymetry) return;

    // Larsemann Bank Shoal (<50m depth)
    const shoalCoords: L.LatLngTuple[] = [
      [-69.15, 75.8],
      [-69.25, 76.5],
      [-69.45, 76.4],
      [-69.35, 75.7],
    ];

    const shoalPoly = L.polygon(shoalCoords, {
      color: '#F87171',
      weight: 1.5,
      dashArray: '2, 4',
      fillColor: '#EF4444',
      fillOpacity: 0.12,
    });
    shoalPoly.bindTooltip('Larsemann Bank: Depth < 50m (Iceberg Keel Grounding Hazard)', {
      sticky: true,
    });
    group.addLayer(shoalPoly);

    // Prydz Deep Trench (>800m deep water navigation corridor)
    const trenchCoords: L.LatLngTuple[] = [
      [-66.5, 68.0],
      [-67.8, 73.0],
      [-68.5, 74.0],
      [-68.0, 71.0],
    ];

    const trenchPoly = L.polygon(trenchCoords, {
      color: '#38BDF8',
      weight: 1.2,
      dashArray: '4, 4',
      fillColor: '#0284C7',
      fillOpacity: 0.08,
    });
    trenchPoly.bindTooltip('Prydz Channel Trench: Depth > 800m (Clear Ice Keel Margin)', {
      sticky: true,
    });
    group.addLayer(trenchPoly);
  }, [layers.bathymetry]);

  // Render Ocean Current & Wind Field Vectors
  useEffect(() => {
    if (!environmentGroupRef.current || !mapRef.current) return;
    const group = environmentGroupRef.current;
    group.clearLayers();

    // 1. Ocean Currents (ACC & Coastal Drift)
    if (layers.oceanCurrents) {
      OCEAN_CURRENT_VECTORS.forEach((curr) => {
        const rad = (curr.headingDeg * Math.PI) / 180;
        const lengthKm = curr.speedKnots * 15;
        const dLat = (lengthKm / 6371) * (180 / Math.PI) * Math.cos(rad);
        const dLon =
          ((lengthKm / 6371) * (180 / Math.PI) * Math.sin(rad)) /
          Math.cos((curr.lat * Math.PI) / 180);

        const line = L.polyline(
          [
            [curr.lat, curr.lon],
            [curr.lat + dLat, curr.lon + dLon],
          ],
          {
            color: '#38BDF8',
            weight: 2,
            opacity: 0.85,
          }
        );
        line.bindTooltip(`${curr.label} (${curr.headingDeg}°)`, { sticky: true });
        group.addLayer(line);

        // Arrow head marker
        const arrowHead = L.circleMarker([curr.lat + dLat, curr.lon + dLon], {
          radius: 3.5,
          color: '#38BDF8',
          fillColor: '#38BDF8',
          fillOpacity: 1,
        });
        group.addLayer(arrowHead);
      });
    }

    // 2. Wind Vectors
    if (layers.wind) {
      WIND_VECTORS.forEach((w) => {
        const rad = (w.headingDeg * Math.PI) / 180;
        const lengthKm = w.speedKnots * 1.5;
        const dLat = (lengthKm / 6371) * (180 / Math.PI) * Math.cos(rad);
        const dLon =
          ((lengthKm / 6371) * (180 / Math.PI) * Math.sin(rad)) /
          Math.cos((w.lat * Math.PI) / 180);

        const line = L.polyline(
          [
            [w.lat, w.lon],
            [w.lat + dLat, w.lon + dLon],
          ],
          {
            color: '#94A3B8',
            weight: 2,
            dashArray: '3, 3',
            opacity: 0.8,
          }
        );
        line.bindTooltip(`Surface Wind: ${w.label}`, { sticky: true });
        group.addLayer(line);
      });
    }
  }, [layers.oceanCurrents, layers.wind]);

  // Render Polar Lat/Lon Graticule Lines
  useEffect(() => {
    if (!graticuleGroupRef.current || !mapRef.current) return;
    const group = graticuleGroupRef.current;
    group.clearLayers();

    if (!layers.graticule) return;

    // Parallels (60°S, 65°S, 70°S, 75°S)
    const parallels = [-60, -65, -70, -75];
    parallels.forEach((lat) => {
      const lineCoords: L.LatLngTuple[] = [];
      for (let lon = 50; lon <= 90; lon += 5) {
        lineCoords.push([lat, lon]);
      }
      const polyline = L.polyline(lineCoords, {
        color: '#475569',
        weight: 1,
        dashArray: '2, 6',
        opacity: 0.6,
        interactive: false,
      });
      group.addLayer(polyline);
    });

    // Meridians (55°E, 60°E, 65°E, 70°E, 75°E, 80°E, 85°E)
    const meridians = [55, 60, 65, 70, 75, 80, 85];
    meridians.forEach((lon) => {
      const lineCoords: L.LatLngTuple[] = [];
      for (let lat = -58; lat >= -76; lat -= 2) {
        lineCoords.push([lat, lon]);
      }
      const polyline = L.polyline(lineCoords, {
        color: '#475569',
        weight: 1,
        dashArray: '2, 6',
        opacity: 0.6,
        interactive: false,
      });
      group.addLayer(polyline);
    });
  }, [layers.graticule]);

  // Render Collision Hazard Alert (When route intersects iceberg buffer)
  useEffect(() => {
    if (!collisionAlertGroupRef.current || !mapRef.current) return;
    const group = collisionAlertGroupRef.current;
    group.clearLayers();

    const isCollisionHazard =
      highlightIntersection ||
      (simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated);

    if (!isCollisionHazard) return;

    const hazardLat = -66.18;
    const hazardLon = 66.75;

    // Pulsing Hazard Crosshairs Marker
    const alertIcon = L.divIcon({
      className: 'collision-alert-marker',
      iconSize: [60, 60],
      iconAnchor: [30, 30],
      html: `
        <div class="relative w-15 h-15 flex items-center justify-center cursor-pointer select-none">
          <div class="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
      `,
    });

    const alertMarker = L.marker([hazardLat, hazardLon], { icon: alertIcon });

    alertMarker.bindPopup(`
      <div class="p-3 w-64 bg-[#180A0A] text-[#FEE2E2] font-mono text-xs rounded-lg select-none border border-red-600/50">
        <div class="flex items-center gap-1.5 pb-2 border-b border-red-900 text-red-400 font-bold text-sm">
          <span>⚠️</span>
          <span>COLLISION HAZARD ALERT</span>
        </div>
        <div class="py-2 text-[11px] space-y-1 text-red-200">
          <div>Iceberg <span class="font-bold text-white">IB-1042</span> intersects active transit path within <span class="font-bold text-red-400">2.8 NM</span>.</div>
          <div class="text-[10px] text-gray-400">Under IMO Polar Code, safety separation minimum is 3.0 NM. Course alteration advised.</div>
        </div>
        ${
          onRecalculateClick
            ? `<button id="recalculate-alert-btn" class="w-full mt-2 py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] transition text-center cursor-pointer shadow">
                RECALCULATE SAFE CORRIDOR
              </button>`
            : ''
        }
      </div>
    `);

    alertMarker.on('popupopen', () => {
      const btn = document.getElementById('recalculate-alert-btn');
      if (btn && onRecalculateClick) {
        btn.onclick = () => onRecalculateClick();
      }
    });

    group.addLayer(alertMarker);
  }, [highlightIntersection, simulation, onRecalculateClick]);

  // Tactical Navigation Controls
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([-67.2, 69.5], 5, { duration: 1.2 });
    }
  };

  const handleCenterVessel = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([effectiveVesselPos.lat, effectiveVesselPos.lon], 7, { duration: 1 });
    }
  };

  const handleFitVoyage = () => {
    if (mapRef.current && activeRoute.pathCoordinates.length > 0) {
      const bounds = L.latLngBounds(
        activeRoute.pathCoordinates.map((p) => [p.lat, p.lon] as L.LatLngTuple)
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  };

  const handleCenterDestination = () => {
    const dest = stations.find((s) => s.id === 'bharati');
    if (dest && mapRef.current) {
      mapRef.current.flyTo([dest.lat, dest.lon], 8, { duration: 1.2 });
    }
  };

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

  const isCollisionActive =
    highlightIntersection ||
    (simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#060b11] select-none ${customClass}`}
    >
      {/* 1. Tactical Bridge Map Controls (Zoom, Fit Voyage, Center Vessel, Fullscreen) */}
      <MapControls
        zoom={currentZoom / 10}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onCenterVessel={handleCenterVessel}
        onFitVoyage={handleFitVoyage}
        onCenterDestination={handleCenterDestination}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 2. Layer & Base Map Selector Drawer */}
      <LayerControl
        layers={layers}
        onToggleLayer={handleToggleLayer}
        baseMap={baseMap}
        onSelectBaseMap={setBaseMap}
        seaIceOpacity={seaIceOpacity}
        onChangeSeaIceOpacity={setSeaIceOpacity}
      />

      {/* 3. Floating Quick Base Map Switcher Pill (Top Center) */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1 bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded-full p-1 shadow-xl pointer-events-auto">
        {(['satellite', 'ocean', 'dark', 'osm', 'topo'] as BaseMapType[]).map((type) => {
          const cfg = BASE_MAP_PROVIDERS[type];
          const active = baseMap === type;
          return (
            <button
              key={type}
              onClick={() => setBaseMap(type)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                active
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#152535] border border-transparent'
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Collision Hazard Warning Banner (When route intersects iceberg) */}
      {isCollisionActive && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-red-950/95 border border-red-500 rounded-lg px-4 py-2 shadow-2xl backdrop-blur-md text-red-200 font-mono text-xs animate-pulse pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <span className="font-bold text-white">COLLISION WARNING:</span> Iceberg IB-1042 within 2.8 NM. Recalculate route recommended.
          </div>
          {onRecalculateClick && (
            <button
              onClick={onRecalculateClick}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[10px] uppercase transition cursor-pointer shadow whitespace-nowrap ml-1"
            >
              RECALCULATE NOW
            </button>
          )}
        </div>
      )}

      {/* 5. Navigation Condition Legend (Bottom Left) */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded-lg px-3 py-2 shadow-2xl text-[10px] sm:text-[11px] font-mono pointer-events-auto">
        <div className="text-[9px] text-[#718290] uppercase tracking-wider mb-1 font-semibold flex items-center justify-between gap-3">
          <span>POLAR VOYAGE CONDITIONS</span>
          {simulation.active && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
              T+{simulation.timeStep}h
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-gray-200">SAFE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-gray-200">CAUTION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="text-gray-200">HIGH HAZARD</span>
          </div>
        </div>
      </div>

      {/* 6. Dual Scale Bar & Live Polar Cursor Coordinates (Bottom Right) */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex flex-col items-end gap-1.5 font-mono pointer-events-auto">
        {/* Scale & Coordinate HUD */}
        <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded-lg px-3 py-1.5 text-[10px] text-gray-300 flex items-center gap-3 shadow-2xl">
          {/* Nautical Distance Scale Bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1 bg-sky-400 relative rounded-full">
              <span className="absolute -top-3.5 left-0 text-[8px] text-gray-400">0</span>
              <span className="absolute -top-3.5 right-0 text-[8px] text-sky-400 font-bold">50 NM</span>
            </div>
            <span className="text-[9px] text-gray-400">/ 92.6 km</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-[#1B2A35]" />

          {/* Real-time Cursor Coordinates */}
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-white font-semibold">
              {cursorGeo
                ? `${formatLatitude(cursorGeo.lat)}, ${formatLongitude(cursorGeo.lon)}`
                : `${formatLatitude(effectiveVesselPos.lat)}, ${formatLongitude(effectiveVesselPos.lon)}`}
            </span>
          </div>

          <div className="hidden md:block h-3 w-px bg-[#1B2A35]" />

          {/* Active Basemap Badge */}
          <div className="hidden md:flex items-center gap-1 text-[9px] text-sky-300/80">
            <span>{BASE_MAP_PROVIDERS[baseMap].icon}</span>
            <span>{BASE_MAP_PROVIDERS[baseMap].attribution.split('/')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

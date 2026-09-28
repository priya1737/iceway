import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Eye, EyeOff, Globe, Sliders } from 'lucide-react';
import { MapLayerState } from '../../types/navigation';

export type BaseMapType = 'satellite' | 'ocean' | 'dark' | 'osm' | 'topo';

interface LayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  baseMap: BaseMapType;
  onSelectBaseMap: (type: BaseMapType) => void;
  seaIceOpacity?: number;
  onChangeSeaIceOpacity?: (val: number) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  onToggleLayer,
  baseMap,
  onSelectBaseMap,
  seaIceOpacity = 0.65,
  onChangeSeaIceOpacity,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const baseMapOptions: { id: BaseMapType; label: string; icon: string; desc: string }[] = [
    { id: 'satellite', label: 'Satellite', icon: '🛰️', desc: 'True polar ice imagery' },
    { id: 'ocean', label: 'Bathymetry', icon: '🌊', desc: 'Marine depth contours' },
    { id: 'dark', label: 'Dark Radar', icon: '🌒', desc: 'Bridge tactical display' },
    { id: 'osm', label: 'OpenStreetMap', icon: '🗺️', desc: 'Open source cartography' },
    { id: 'topo', label: 'Topo Relief', icon: '🏔️', desc: 'Glacial elevation' },
  ];

  const layerItems: { key: keyof MapLayerState; label: string; color: string; desc?: string }[] = [
    { key: 'seaIce', label: 'Sea Ice Concentration', color: '#A0D2EB', desc: 'SAR satellite ice pack' },
    { key: 'icebergs', label: 'Iceberg Radar Targets', color: '#E05B5B', desc: 'Active bergs & drift cones' },
    { key: 'vesselRoute', label: 'Vessel Track & Routes', color: '#38bdf8', desc: 'Active & alternative corridors' },
    { key: 'oceanCurrents', label: 'Ocean Currents (ACC)', color: '#5DADE2', desc: 'East & West drift jets' },
    { key: 'wind', label: 'Katabatic Wind Field', color: '#91A4AE', desc: 'Polar surface wind vectors' },
    { key: 'researchStations', label: 'Research Stations', color: '#E5B84B', desc: 'Bharati, Maitri, Davis, etc.' },
    { key: 'riskZones', label: 'Navigation Risk Zones', color: '#E05B5B', desc: 'Danger, caution & safe zones' },
    { key: 'bathymetry', label: 'Depth Hazards (<50m)', color: '#F87171', desc: 'Shoals & iceberg keel risks' },
    { key: 'graticule', label: 'Lat / Lon Polar Grid', color: '#60737E', desc: 'Parallels & meridians' },
  ];

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 select-none pointer-events-auto">
      <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded shadow-2xl w-48 sm:w-56 overflow-hidden transition-all">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 flex items-center justify-between border-b border-[#1B2A35] text-xs font-mono text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-semibold tracking-wider text-[11px] sm:text-xs">MAP & LAYERS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#152535] text-[#38bdf8] font-bold">
              {baseMapOptions.find((b) => b.id === baseMap)?.icon}
            </span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#91A4AE]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#91A4AE]" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-2 space-y-2.5 max-h-[420px] overflow-y-auto">
            {/* Open Source Base Map Selector */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#91A4AE] uppercase tracking-wider mb-1.5 px-1 font-semibold">
                <Globe className="w-3 h-3 text-[#38bdf8]" />
                <span>OPEN SOURCE BASEMAP</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {baseMapOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelectBaseMap(opt.id)}
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition text-left cursor-pointer ${
                      baseMap === opt.id
                        ? 'bg-[#152535] border border-[#38bdf8]/40 text-[#38bdf8] font-semibold'
                        : 'text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#0d1c28] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {baseMap === opt.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#1B2A35]" />

            {/* Tactical Marine Overlay Layers */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#91A4AE] uppercase tracking-wider mb-1 px-1 font-semibold">
                <Sliders className="w-3 h-3 text-[#34d399]" />
                <span>NAUTICAL LAYERS</span>
              </div>

              <div className="space-y-0.5">
                {layerItems.map((item) => {
                  const active = layers[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => onToggleLayer(item.key)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono transition text-left cursor-pointer ${
                        active
                          ? 'bg-[#152535]/80 text-[#E8F0F3]'
                          : 'text-[#60737E] hover:text-[#91A4AE] hover:bg-[#071018]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
                            active
                              ? 'border-[#38bdf8] bg-[#38bdf8]'
                              : 'border-[#1B2A35] bg-transparent'
                          }`}
                        >
                          {active && (
                            <svg className="w-2.5 h-2.5 text-[#071018]" viewBox="0 0 12 12" fill="none">
                              <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={`truncate ${active ? 'font-medium' : ''}`}>{item.label}</span>
                      </div>

                      <span
                        className="w-2 h-2 rounded-full shrink-0 ml-1"
                        style={{ backgroundColor: active ? item.color : '#1B2A35' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sea Ice Opacity Slider */}
            {layers.seaIce && onChangeSeaIceOpacity && (
              <div className="pt-1.5 border-t border-[#1B2A35] px-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#91A4AE] mb-1">
                  <span>ICE OVERLAY OPACITY</span>
                  <span className="text-[#38bdf8] font-bold">{(seaIceOpacity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.95"
                  step="0.05"
                  value={seaIceOpacity}
                  onChange={(e) => onChangeSeaIceOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#152535] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

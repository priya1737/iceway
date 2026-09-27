import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { MapLayerState } from '../../types/navigation';

interface LayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers, onToggleLayer }) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const layerItems: { key: keyof MapLayerState; label: string; color: string; desc?: string }[] = [
    { key: 'seaIce', label: 'Sea Ice', color: '#A0D2EB', desc: 'Concentration contours' },
    { key: 'icebergs', label: 'Icebergs', color: '#E05B5B', desc: 'Active radar targets' },
    { key: 'vesselRoute', label: 'Vessel Route', color: '#43C98B', desc: 'Active & alternative' },
    { key: 'oceanCurrents', label: 'Ocean Currents', color: '#5DADE2', desc: 'ACC & coastal drift' },
    { key: 'wind', label: 'Wind', color: '#91A4AE', desc: 'Surface wind field' },
    { key: 'researchStations', label: 'Research Stations', color: '#E5B84B', desc: 'Bharati, Maitri, etc.' },
    { key: 'riskZones', label: 'Risk Zones', color: '#E05B5B', desc: 'Low / Caution / High' },
    { key: 'graticule', label: 'Lat / Lon Grid', color: '#60737E', desc: 'Polar coordinate lines' },
  ];

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 select-none">
      <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded shadow-xl w-44 sm:w-52 overflow-hidden transition-all">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 flex items-center justify-between border-b border-[#1B2A35] text-xs font-mono text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#5DADE2]" />
            <span className="font-semibold tracking-wider">LAYERS</span>
          </div>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#91A4AE]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#91A4AE]" />}
        </button>

        {/* Layer Checkboxes */}
        {isOpen && (
          <div className="p-2 space-y-1 max-h-[320px] overflow-y-auto">
            {layerItems.map((item) => {
              const active = layers[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => onToggleLayer(item.key)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-mono transition text-left cursor-pointer ${
                    active
                      ? 'bg-[#152535]/80 text-[#E8F0F3]'
                      : 'text-[#60737E] hover:text-[#91A4AE] hover:bg-[#071018]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${
                        active
                          ? 'border-[#5DADE2] bg-[#5DADE2]'
                          : 'border-[#1B2A35] bg-transparent'
                      }`}
                    >
                      {active && (
                        <svg className="w-2.5 h-2.5 text-[#071018]" viewBox="0 0 12 12" fill="none">
                          <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className={active ? 'font-medium' : ''}>{item.label}</span>
                  </div>

                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: active ? item.color : '#1B2A35' }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

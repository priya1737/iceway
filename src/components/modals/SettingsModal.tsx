import React, { useState } from 'react';
import { X, Settings, Sliders, Shield, Layers } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  safetyMarginNm: number;
  onSetSafetyMargin: (margin: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  safetyMarginNm,
  onSetSafetyMargin,
}) => {
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'nm'>('km');
  const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');
  const [speedUnit, setSpeedUnit] = useState<'kn' | 'ms'>('kn');
  const [sarContrast, setSarContrast] = useState<number>(80);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#5DADE2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
              OPERATIONAL CONFIGURATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Safety Clearance Margin Slider */}
          <div className="p-3 rounded bg-[#071018] border border-[#1B2A35] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#60737E] uppercase font-semibold">
                ICEBERG SAFETY CLEARANCE MARGIN
              </span>
              <span className="text-sm font-bold text-[#E5B84B]">{safetyMarginNm.toFixed(1)} NM</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="10.0"
              step="0.5"
              value={safetyMarginNm}
              onChange={(e) => onSetSafetyMargin(parseFloat(e.target.value))}
              className="w-full accent-[#E5B84B] bg-[#152535] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#60737E]">
              <span>1.5 NM (Restricted lead)</span>
              <span>3.0 NM (Standard)</span>
              <span>10.0 NM (Open ocean)</span>
            </div>
          </div>

          {/* Unit Preferences */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider font-semibold block">
              MEASUREMENT CONVENTIONS
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-[#60737E] block mb-1">DISTANCE</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#071018] border border-[#1B2A35] rounded">
                  <button
                    onClick={() => setDistanceUnit('km')}
                    className={`py-1 text-[10px] rounded transition ${
                      distanceUnit === 'km' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    km
                  </button>
                  <button
                    onClick={() => setDistanceUnit('nm')}
                    className={`py-1 text-[10px] rounded transition ${
                      distanceUnit === 'nm' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    NM
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#60737E] block mb-1">TEMPERATURE</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#071018] border border-[#1B2A35] rounded">
                  <button
                    onClick={() => setTempUnit('c')}
                    className={`py-1 text-[10px] rounded transition ${
                      tempUnit === 'c' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setTempUnit('f')}
                    className={`py-1 text-[10px] rounded transition ${
                      tempUnit === 'f' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#60737E] block mb-1">SPEED</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#071018] border border-[#1B2A35] rounded">
                  <button
                    onClick={() => setSpeedUnit('kn')}
                    className={`py-1 text-[10px] rounded transition ${
                      speedUnit === 'kn' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    knots
                  </button>
                  <button
                    onClick={() => setSpeedUnit('ms')}
                    className={`py-1 text-[10px] rounded transition ${
                      speedUnit === 'ms' ? 'bg-[#152535] text-[#5DADE2] font-bold' : 'text-[#91A4AE]'
                    }`}
                  >
                    m/s
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SAR Ice Shader Contrast */}
          <div className="p-3 rounded bg-[#071018] border border-[#1B2A35] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#60737E] uppercase">SAR ICE MASK OPACITY</span>
              <span className="text-xs font-bold text-[#E8F0F3]">{sarContrast}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={sarContrast}
              onChange={(e) => setSarContrast(parseInt(e.target.value))}
              className="w-full accent-[#5DADE2] bg-[#152535] h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#071018] border-t border-[#1B2A35] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#5DADE2] hover:bg-[#4999c7] text-[#071018] font-bold text-xs transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

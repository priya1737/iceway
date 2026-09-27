import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sliders, Waves, Activity, Check, RotateCcw } from 'lucide-react';

export const SensorCalibrationModal: React.FC = () => {
  const {
    sensorCalibrationModalOpen,
    setSensorCalibrationModalOpen,
    vessel,
    updateVessel,
    settings,
    updateSettings,
    addToast,
    addActivityLog,
  } = useApp();

  const [sonarOffset, setSonarOffset] = useState<number>(0.0);
  const [sarGain, setSarGain] = useState<number>(settings.sarContrast || 85);
  const [speedCorrection, setSpeedCorrection] = useState<number>(0.0);
  const [safetyMargin, setSafetyMargin] = useState<number>(settings.safetyMarginNm || 3.0);

  if (!sensorCalibrationModalOpen) return null;

  const handleApply = () => {
    updateSettings({
      sarContrast: sarGain,
      safetyMarginNm: safetyMargin,
    });

    if (speedCorrection !== 0) {
      updateVessel({
        speedKnots: Math.max(0, +(vessel.speedKnots + speedCorrection).toFixed(1)),
      });
    }

    addToast('Telemetry Calibrated', 'Acoustic and SAR sensor offsets synced with vessel bridge navigation systems.', 'success');
    addActivityLog({
      severity: 'info',
      source: 'SONAR',
      message: `Shipboard Sensor Suite recalibrated. Multibeam offset: ${sonarOffset >= 0 ? '+' : ''}${sonarOffset}m. SAR Gain: ${sarGain}%.`,
      details: `Safety Clearance Margin updated to ${safetyMargin.toFixed(1)} NM.`,
    });

    setSensorCalibrationModalOpen(false);
  };

  const handleReset = () => {
    setSonarOffset(0.0);
    setSarGain(85);
    setSpeedCorrection(0.0);
    setSafetyMargin(3.0);
    addToast('Calibration Defaults Restored', 'Standard factory calibration loaded.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-md overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                HYDRO-ACOUSTIC SENSOR CALIBRATION
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                Multibeam Sonar & Doppler Acoustic Current Profiler (ADCP)
              </p>
            </div>
          </div>
          <button
            onClick={() => setSensorCalibrationModalOpen(false)}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Sonar Depth Bias */}
          <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#91A4AE] uppercase font-semibold">
                Under-Keel Multi-Beam Sonar Draught Bias
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {sonarOffset >= 0 ? `+${sonarOffset.toFixed(1)}` : sonarOffset.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={sonarOffset}
              onChange={(e) => setSonarOffset(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-[#152535] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#60737E]">
              <span>-2.0m (Shallow Sounding)</span>
              <span>0.0m (Nominal Draught)</span>
              <span>+2.0m (Deep Salinity Trim)</span>
            </div>
          </div>

          {/* SAR Satellite Radar Contrast */}
          <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#91A4AE] uppercase font-semibold">
                SAR Satellite Backscatter Sensitivity
              </span>
              <span className="text-xs font-bold text-emerald-400">{sarGain}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={sarGain}
              onChange={(e) => setSarGain(parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-[#152535] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#60737E]">
              <span>50% (High speckle filter)</span>
              <span>85% (Balanced)</span>
              <span>100% (Thin ice leads)</span>
            </div>
          </div>

          {/* Doppler SOG Speed Correction */}
          <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#91A4AE] uppercase font-semibold">
                Doppler Log Current Bias (SOG vs STW)
              </span>
              <span className="text-xs font-bold text-amber-400">
                {speedCorrection >= 0 ? `+${speedCorrection.toFixed(1)}` : speedCorrection.toFixed(1)} kn
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={speedCorrection}
              onChange={(e) => setSpeedCorrection(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-[#152535] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#60737E]">
              <span>-2.0 kn</span>
              <span>0.0 kn (Raw GPS)</span>
              <span>+2.0 kn</span>
            </div>
          </div>

          {/* Iceberg Safety Margin */}
          <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#91A4AE] uppercase font-semibold">
                Collision Proximity Perimeter
              </span>
              <span className="text-xs font-bold text-violet-400">{safetyMargin.toFixed(1)} NM</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={safetyMargin}
              onChange={(e) => setSafetyMargin(parseFloat(e.target.value))}
              className="w-full accent-violet-400 bg-[#152535] h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#60737E]">
              <span>1.0 NM (Narrow lead)</span>
              <span>3.0 NM (Standard)</span>
              <span>8.0 NM (Open drift)</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#91A4AE] hover:text-[#E8F0F3] flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSensorCalibrationModalOpen(false)}
              className="px-3.5 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Sensor Offsets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

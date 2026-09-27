import React from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle, RotateCw, X } from 'lucide-react';
import { SimulationState } from '../../types/navigation';

interface SimulationControlsProps {
  simulation: SimulationState;
  onStepChange: (step: 0 | 6 | 12 | 18 | 24) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onRecalculateClick: () => void;
  onClose: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulation,
  onStepChange,
  onTogglePlay,
  onReset,
  onRecalculateClick,
  onClose,
}) => {
  if (!simulation.active) return null;

  const steps: (0 | 6 | 12 | 18 | 24)[] = [0, 6, 12, 18, 24];
  const isT12Encounter = simulation.timeStep >= 12 && !simulation.routeRecalculated;

  return (
    <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-2 sm:px-4 select-none font-mono">
      <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#E5B84B]/40 rounded-lg shadow-2xl p-2.5 sm:p-3 space-y-2 sm:space-y-2.5 ring-1 ring-[#E5B84B]/20">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5B84B] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#E5B84B] uppercase tracking-wider">
              SIMULATION
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#91A4AE]">
              [T+{String(simulation.timeStep).padStart(2, '0')}h Horizon]
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePlay}
              className="p-1 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#E8F0F3] transition cursor-pointer"
              title={simulation.isPlaying ? 'Pause simulation' : 'Auto play timeline'}
            >
              {simulation.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onReset}
              className="p-1 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#91A4AE] hover:text-[#E8F0F3] transition cursor-pointer"
              title="Reset simulation to T+00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#152535] text-[#91A4AE] hover:text-[#E8F0F3] transition cursor-pointer ml-1"
              title="Exit simulation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Slider Buttons: T+00, T+06, T+12, T+18, T+24 */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
          {steps.map((st) => {
            const isCurrent = simulation.timeStep === st;
            const isHazardStep = st === 12;

            return (
              <button
                key={st}
                onClick={() => onStepChange(st)}
                className={`py-1 sm:py-1.5 px-1 sm:px-2 rounded text-[10px] sm:text-xs transition cursor-pointer font-bold relative flex flex-col items-center ${
                  isCurrent
                    ? 'bg-[#E5B84B] text-[#071018] shadow'
                    : 'bg-[#071018] border border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3] hover:border-[#E5B84B]/40'
                }`}
              >
                <span>T+{String(st).padStart(2, '0')}</span>
                {isHazardStep && !simulation.routeRecalculated && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isCurrent ? 'bg-[#071018]' : 'bg-[#E05B5B]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* T+12 Route Condition Update Alert Banner */}
        {isT12Encounter && (
          <div className="p-2.5 rounded bg-[#E05B5B]/15 border border-[#E05B5B]/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-soft-pulse">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E05B5B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#E05B5B] block">ROUTE CONDITION UPDATE</span>
                <span className="text-[#E8F0F3] text-[11px] block leading-snug">
                  Iceberg <strong>IB-1042</strong> is projected to approach the active route.
                  Separation: <strong className="text-[#E05B5B]">2.8 NM</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onRecalculateClick}
              className="py-1 px-3 rounded bg-[#E05B5B] hover:bg-[#c94b4b] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              RECALCULATE ROUTE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

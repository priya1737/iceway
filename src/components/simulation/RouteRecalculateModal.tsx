import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCw, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface RouteRecalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecalculatedRoute: () => void;
}

export const RouteRecalculateModal: React.FC<RouteRecalculateModalProps> = ({
  isOpen,
  onClose,
  onApplyRecalculatedRoute,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const analysisSteps = [
    { label: 'Sea-ice field', time: 350 },
    { label: 'Iceberg trajectories', time: 700 },
    { label: 'Ocean currents', time: 1050 },
    { label: 'Weather conditions', time: 1400 },
    { label: 'Vessel constraints', time: 1750 },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setIsCompleted(false);
      return;
    }

    // Step-by-step sequential verification
    analysisSteps.forEach((s, idx) => {
      setTimeout(() => {
        setStep(idx + 1);
      }, s.time);
    });

    const completionTimer = setTimeout(() => {
      setIsCompleted(true);
    }, 2100);

    return () => clearTimeout(completionTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className={`w-4 h-4 ${!isCompleted ? 'animate-spin text-[#5DADE2]' : 'text-[#43C98B]'}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
              {!isCompleted ? 'ANALYZING CURRENT CONDITIONS' : 'ROUTE RECALCULATION COMPLETE'}
            </h3>
          </div>
          {isCompleted && (
            <button
              onClick={onClose}
              className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Analysis Checklist */}
          <div className="p-3.5 rounded bg-[#071018] border border-[#1B2A35] space-y-2">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider font-semibold block mb-1">
              DYNAMIC MULTI-FACTOR RE-ROUTING MATRIX
            </span>

            {analysisSteps.map((item, idx) => {
              const isChecked = step > idx;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 transition-colors ${
                    isChecked ? 'text-[#E8F0F3]' : 'text-[#60737E]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isChecked
                        ? 'bg-[#43C98B] text-[#071018]'
                        : 'border border-[#1B2A35] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{item.label}</span>
                  {step === idx + 1 && !isCompleted && (
                    <span className="text-[10px] text-[#5DADE2] ml-auto animate-pulse">
                      evaluating...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Result Comparison Box (Revealed upon completion) */}
          {isCompleted && (
            <div className="space-y-3.5 pt-1 animate-soft-pulse">
              <div className="flex items-center justify-between border-b border-[#1B2A35] pb-2">
                <span className="text-xs font-bold text-[#43C98B] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  ROUTE UPDATED: ROUTE 01-MOD (AVOIDANCE CORRIDOR)
                </span>
              </div>

              {/* 4 Key Comparison Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Previous Risk</span>
                  <span className="text-base font-bold text-[#E05B5B] mt-0.5 block">67</span>
                </div>
                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Updated Risk</span>
                  <span className="text-base font-bold text-[#43C98B] mt-0.5 block">21</span>
                </div>
                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Distance Δ</span>
                  <span className="text-base font-bold text-[#E8F0F3] mt-0.5 block">+34 km</span>
                </div>
                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Additional Fuel</span>
                  <span className="text-base font-bold text-[#5DADE2] mt-0.5 block">+4.1%</span>
                </div>
              </div>

              {/* Operational Rationale summary */}
              <div className="p-2.5 rounded bg-[#152535]/50 border border-[#1B2A35] text-[11px] text-[#CBD5E1] space-y-1">
                <div>✓ IB-1042 closest point of approach increased to 8.4 NM</div>
                <div>✓ Avoids high-concentration compressive pack ice band at 67°S</div>
                <div>✓ Preserves arrival within Bharati Station fair-weather window</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#071018] border-t border-[#1B2A35] flex items-center justify-between">
          <span className="text-[10px] text-[#60737E]">
            {!isCompleted ? 'Calculating optimal waypoints...' : 'Ready for bridge execution'}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#91A4AE] hover:text-[#E8F0F3] text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyRecalculatedRoute();
                onClose();
              }}
              disabled={!isCompleted}
              className="px-4 py-1.5 rounded bg-[#43C98B] hover:bg-[#38b279] text-[#071018] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-40"
            >
              APPLY RECALCULATED ROUTE
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

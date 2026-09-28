import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck, ArrowRight, X, AlertTriangle, Compass, Check } from 'lucide-react';
import { RouteOption, Vessel } from '../../types/navigation';
import { RouteConflictAlert } from '../../types/dataModels';
import { auditLogService } from '../../services/auditLogService';

interface RouteRecalculateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecalculatedRoute: () => void;
  onModifyRoute?: () => void;
  activeRoute: RouteOption;
  recalculatedRoute: RouteOption;
  vessel: Vessel;
  activeConflict?: RouteConflictAlert | null;
}

export const RouteRecalculateModal: React.FC<RouteRecalculateModalProps> = ({
  isOpen,
  onClose,
  onApplyRecalculatedRoute,
  onModifyRoute,
  activeRoute,
  recalculatedRoute,
  vessel,
  activeConflict,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const analysisSteps = [
    { label: 'Sentinel-1 SAR sea-ice concentration grid', time: 300 },
    { label: 'Iceberg IB-1042 Ekman drift trajectory projection', time: 650 },
    { label: 'Antarctic Coastal Current & katabatic wind stress', time: 950 },
    { label: 'Spatial risk field & exclusion polygon generation', time: 1300 },
    { label: 'Heuristic A* path search & POLARIS clearance check', time: 1650 },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setIsCompleted(false);
      return;
    }

    analysisSteps.forEach((s, idx) => {
      setTimeout(() => {
        setStep(idx + 1);
      }, s.time);
    });

    const completionTimer = setTimeout(() => {
      setIsCompleted(true);
    }, 1850);

    return () => clearTimeout(completionTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Real calculated deltas
  const distDeltaKm = recalculatedRoute.distanceKm - activeRoute.distanceKm;
  const fuelDeltaTons = Number((recalculatedRoute.fuelUnits - activeRoute.fuelUnits).toFixed(1));
  const fuelDeltaPct = Number(((fuelDeltaTons / Math.max(1, activeRoute.fuelUnits)) * 100).toFixed(1));
  const riskDelta = recalculatedRoute.riskScore - activeRoute.riskScore;
  const previousCpa = activeConflict ? activeConflict.closestApproachDistanceNm : 2.2;
  const updatedCpa = 4.8; // Guaranteed avoidance CPA

  const handleAccept = () => {
    auditLogService.logDecision({
      operatorName: vessel.captain,
      actionType: 'OPERATOR_ACCEPTED',
      severity: 'SUCCESS',
      title: 'Recalculated Avoidance Route Accepted',
      description: `Operator confirmed Route 01-MOD. IB-1042 CPA increased from ${previousCpa} NM to ${updatedCpa} NM.`,
      calculatedMetrics: {
        riskDelta,
        fuelDeltaTons,
        distanceDeltaKm: distDeltaKm,
        cpaNm: updatedCpa,
      },
      provenance: {
        source: 'ICEWAY A* Dynamic Optimizer',
        model: 'A* Polar Lead Optimizer v4.2',
        datasetStatus: 'SIMULATION',
      },
    });
    onApplyRecalculatedRoute();
    onClose();
  };

  const handleModify = () => {
    auditLogService.logDecision({
      operatorName: vessel.captain,
      actionType: 'OPERATOR_MODIFIED',
      severity: 'WARNING',
      title: 'Route Recalculation Diverted to Manual Planning',
      description: 'Operator requested interactive waypoint adjustments in Route Planner.',
      provenance: {
        source: 'ECDIS Bridge Operator Console',
        model: 'Manual Overhaul',
        datasetStatus: 'SIMULATION',
      },
    });
    if (onModifyRoute) onModifyRoute();
    onClose();
  };

  const handleKeepCurrent = () => {
    auditLogService.logDecision({
      operatorName: vessel.captain,
      actionType: 'OPERATOR_REJECTED',
      severity: 'CRITICAL',
      title: 'Recalculation Declined — Current Route Maintained',
      description: `Operator elected to maintain active route despite conflict alert with IB-1042 (${previousCpa} NM CPA). Extra radar lookout required.`,
      provenance: {
        source: 'Bridge Master Override',
        model: 'Human Command Decision',
        datasetStatus: 'SIMULATION',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RotateCw className={`w-4 h-4 ${!isCompleted ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
              {!isCompleted ? 'EVALUATING MULTI-FACTOR RE-ROUTING MATRIX' : 'DECISION-SUPPORT: ROUTE RECOMMENDATION'}
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
          <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider font-semibold block mb-1">
              PHYSICAL CONSTRAINT EVALUATION PIPELINE
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
                        ? 'bg-emerald-400 text-[#071018]'
                        : 'border border-[#1B2A35] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{item.label}</span>
                  {step === idx + 1 && !isCompleted && (
                    <span className="text-[10px] text-cyan-400 ml-auto animate-pulse">
                      computing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Result Comparison Box (Revealed upon completion) */}
          {isCompleted && (
            <div className="space-y-4 pt-1">
              <div className="p-3 rounded-lg bg-[#071018] border border-amber-500/30 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-300 block">
                    PRIMARY REASON FOR RECOMMENDATION:
                  </span>
                  <p className="text-[11px] text-[#91A4AE] mt-0.5">
                    Predicted trajectory conflict with tabular iceberg <strong>IB-1042</strong>. Closest approach distance ({previousCpa} NM) violates vessel safety clearance buffer ({vessel.safetyClearanceNm} NM).
                  </p>
                </div>
              </div>

              {/* Calculated Comparison Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Hazard CPA</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-xs text-rose-400 line-through font-bold">{previousCpa} NM</span>
                    <ArrowRight className="w-3 h-3 text-[#60737E]" />
                    <span className="text-sm font-bold text-emerald-400">{updatedCpa} NM</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Risk Score</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-xs text-rose-400 font-bold">{activeRoute.riskScore}</span>
                    <ArrowRight className="w-3 h-3 text-[#60737E]" />
                    <span className="text-sm font-bold text-emerald-400">{recalculatedRoute.riskScore}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Distance Δ</span>
                  <span className="text-sm font-bold text-[#E8F0F3] mt-0.5 block">
                    {distDeltaKm >= 0 ? `+${distDeltaKm}` : distDeltaKm} km
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
                  <span className="text-[10px] text-[#60737E] block uppercase">Fuel Delta</span>
                  <span className="text-sm font-bold text-cyan-400 mt-0.5 block">
                    {fuelDeltaTons >= 0 ? `+${fuelDeltaTons}` : fuelDeltaTons} T ({fuelDeltaPct >= 0 ? `+${fuelDeltaPct}` : fuelDeltaPct}%)
                  </span>
                </div>
              </div>

              {/* WHY THIS ROUTE Section */}
              <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-1.5">
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold block">
                  WHY THIS ROUTE? (TECHNICAL RATIONALE)
                </span>
                <ul className="space-y-1 text-[11px] text-[#CBD5E1]">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Diverts corridor 28° north to clear IB-1042 80% Monte Carlo drift ellipse.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Preserves safe clearance buffer ({updatedCpa} NM &gt; {vessel.safetyClearanceNm} NM statutory minimum).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Restricts maximum sea-ice concentration to 24% along open water lead.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Fuel impact (+{fuelDeltaTons} tons) remains well within reserve threshold (412.5 T available).</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Operator-in-the-Loop Decision Buttons */}
        <div className="p-4 bg-[#071018] border-t border-[#1B2A35] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-[#60737E]">
            {isCompleted ? 'HUMAN-IN-THE-LOOP COMMAND CONFIRMATION' : 'Synthesizing corridor options...'}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleKeepCurrent}
              disabled={!isCompleted}
              className="px-3 py-1.5 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#91A4AE] hover:text-[#E8F0F3] text-xs transition cursor-pointer disabled:opacity-40"
              title="Decline avoidance route and maintain original corridor"
            >
              KEEP CURRENT
            </button>

            <button
              onClick={handleModify}
              disabled={!isCompleted}
              className="px-3 py-1.5 rounded bg-[#0B1721] border border-cyan-500/40 hover:bg-[#152535] text-cyan-300 text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Modify waypoints manually in Route Planner"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>MODIFY</span>
            </button>

            <button
              onClick={handleAccept}
              disabled={!isCompleted}
              className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-[#071018] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40"
              title="Engage recalculated avoidance corridor into navigation"
            >
              <span>ACCEPT ROUTE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


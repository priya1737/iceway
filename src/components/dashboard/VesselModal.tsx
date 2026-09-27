import React from 'react';
import { X, Ship, Compass, Navigation, Fuel, ShieldCheck, Anchor } from 'lucide-react';
import { Vessel } from '../../types/navigation';
import { formatLatitude, formatLongitude } from '../../utils/geoProjection';

interface VesselModalProps {
  vessel: Vessel;
  isOpen: boolean;
  onClose: () => void;
}

export const VesselModal: React.FC<VesselModalProps> = ({ vessel, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-lg shadow-2xl w-full max-w-md overflow-hidden font-mono">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1B2A35] flex items-center justify-between bg-[#071018]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#5DADE2]">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] uppercase tracking-wider block leading-none">
                VESSEL TELEMETRY
              </span>
              <h3 className="text-sm font-bold text-[#E8F0F3] leading-none mt-1">
                {vessel.name.toUpperCase()}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
            <span className="text-[#91A4AE]">Operational Status:</span>
            <span className="px-2 py-0.5 rounded bg-[#43C98B]/10 text-[#43C98B] border border-[#43C98B]/30 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B] animate-pulse" />
              {vessel.status}
            </span>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Speed</span>
              <span className="text-sm font-bold text-[#E8F0F3] mt-0.5 block">
                {vessel.speedKnots} kn
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Heading</span>
              <span className="text-sm font-bold text-[#E8F0F3] mt-0.5 block">
                {vessel.headingDeg}° SE
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Destination</span>
              <span className="text-sm font-bold text-[#5DADE2] mt-0.5 block truncate">
                {vessel.destination}
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Estimated ETA</span>
              <span className="text-sm font-bold text-[#E8F0F3] mt-0.5 block">
                {vessel.etaFormatted}
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Fuel Reserve</span>
              <span className="text-sm font-bold text-[#43C98B] mt-0.5 block">
                {vessel.fuelPct}% ({vessel.fuelRemainingTons}t)
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35]">
              <span className="text-[10px] text-[#60737E] block uppercase">Position</span>
              <span className="text-xs font-semibold text-[#E8F0F3] mt-0.5 block">
                {formatLatitude(vessel.lat)} {formatLongitude(vessel.lon)}
              </span>
            </div>
          </div>

          {/* Ice Class & Specifications */}
          <div className="p-3 rounded bg-[#071018] border border-[#1B2A35] space-y-1.5 text-[11px] text-[#91A4AE]">
            <div className="flex justify-between border-b border-[#1B2A35] pb-1">
              <span>Ice Classification:</span>
              <span className="text-[#E8F0F3] font-semibold">{vessel.iceClass}</span>
            </div>
            <div className="flex justify-between border-b border-[#1B2A35] pb-1">
              <span>Dimensions:</span>
              <span className="text-[#E8F0F3]">
                {vessel.lengthMeters}m LOA · {vessel.beamMeters}m Beam · {vessel.draftMeters}m Draft
              </span>
            </div>
            <div className="flex justify-between border-b border-[#1B2A35] pb-1">
              <span>Master / Captain:</span>
              <span className="text-[#E8F0F3]">{vessel.captain}</span>
            </div>
            <div className="flex justify-between">
              <span>Polar Endorsement:</span>
              <span className="text-[#43C98B]">{vessel.polarEndorsement}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#071018] border-t border-[#1B2A35] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#E8F0F3] text-xs transition cursor-pointer"
          >
            Close Telemetry Card
          </button>
        </div>
      </div>
    </div>
  );
};

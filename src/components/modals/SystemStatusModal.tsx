import React from 'react';
import { X, Activity, Radio, CheckCircle2, Clock, Server, Satellite } from 'lucide-react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const dataSources = [
    {
      name: 'Satellite observations',
      type: 'Sentinel-1B C-SAR & AMSR2 Radiometer',
      status: 'Available',
      latency: '18m ago',
      coverage: '100% Polar Orbital Swath',
    },
    {
      name: 'Oceanographic data',
      type: 'HYCOM + Mercator Global 1/12° Hydrodynamic Model',
      status: 'Available',
      latency: '34m ago',
      coverage: 'Circumpolar Deep Water & East Wind Drift',
    },
    {
      name: 'Meteorological data',
      type: 'ECMWF IFS High-Resolution Polar Atmospheric Model',
      status: 'Available',
      latency: '12m ago',
      coverage: 'Surface Winds, Pressure, Swell',
    },
    {
      name: 'AIS & Vessel Telemetry',
      type: 'Iridium Certus Marine Satellite Link',
      status: 'Available',
      latency: 'Live (2s)',
      coverage: 'Bridge ECDIS Telemetry & Engine Logs',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#43C98B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
              SYSTEM & DATA INGESTION STATUS
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
          {/* Sync status card */}
          <div className="p-3 rounded bg-[#071018] border border-[#1B2A35] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5DADE2]" />
              <div>
                <span className="text-[10px] text-[#60737E] uppercase block">
                  LAST SYNCHRONIZATION
                </span>
                <span className="text-sm font-bold text-[#E8F0F3]">14:32 UTC</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#43C98B]/10 text-[#43C98B] border border-[#43C98B]/30 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B] animate-pulse" />
              SYNCHRONIZED
            </span>
          </div>

          {/* Sources list */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#60737E] uppercase tracking-wider block font-semibold">
              INGESTION PIPELINES
            </span>

            {dataSources.map((ds) => (
              <div
                key={ds.name}
                className="p-2.5 rounded bg-[#071018] border border-[#1B2A35] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E8F0F3]">{ds.name}</span>
                  <span className="text-[10px] text-[#43C98B] font-semibold flex items-center gap-1">
                    ● {ds.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#91A4AE]">{ds.type}</div>
                <div className="text-[9px] text-[#60737E] flex justify-between pt-0.5 border-t border-[#1B2A35]/50">
                  <span>Latency: {ds.latency}</span>
                  <span>{ds.coverage}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-[#152535]/40 text-[10px] text-[#91A4AE] leading-relaxed">
            All satellite SAR telemetry, ice tracking vectors, and ECMWF synoptic forecast files are continuously cached for offline Antarctic polar passage.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#071018] border-t border-[#1B2A35] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#152535] hover:bg-[#1E3A4F] text-[#E8F0F3] text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Mission } from '../../types/navigation';
import { Ship, MapPin, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface MissionsViewProps {
  missions: Mission[];
  currentMission: Mission;
  onSelectMission: (mission: Mission) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  currentMission,
  onSelectMission,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#071018] p-4 lg:p-6 font-mono space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1B2A35]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#5DADE2]">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#E8F0F3]">ANTARCTIC EXPEDITION MISSIONS</h1>
            <p className="text-[11px] text-[#91A4AE]">
              National Centre for Polar and Ocean Research (NCPOR) Voyage Operations Registry
            </p>
          </div>
        </div>

        <div className="text-xs text-[#91A4AE]">
          Total Registered: <strong className="text-[#E8F0F3]">{missions.length}</strong>
        </div>
      </div>

      {/* Missions Table */}
      <div className="rounded-lg bg-[#0B1721] border border-[#1B2A35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1B2A35] bg-[#071018] text-[10px] text-[#60737E] uppercase">
                <th className="py-3 px-4">Mission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Vessel</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Departure (UTC)</th>
                <th className="py-3 px-4">ETA / Arrival</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2A35]/50">
              {missions.map((m) => {
                const isActiveMission = m.id === currentMission.id;
                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMission(m)}
                    className={`transition cursor-pointer ${
                      isActiveMission ? 'bg-[#152535]/80' : 'hover:bg-[#122230]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#E8F0F3]">{m.missionNumber}</span>
                        {isActiveMission && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#5DADE2] text-[#071018] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#91A4AE] block truncate max-w-xs mt-0.5">
                        {m.title}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase inline-flex items-center gap-1.5 border ${
                          m.status === 'Active'
                            ? 'bg-[#43C98B]/10 text-[#43C98B] border-[#43C98B]/30'
                            : m.status === 'Planned'
                            ? 'bg-[#E5B84B]/10 text-[#E5B84B] border-[#E5B84B]/30'
                            : 'bg-[#60737E]/10 text-[#91A4AE] border-[#1B2A35]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === 'Active' ? 'bg-[#43C98B] animate-pulse' : 'bg-current'
                          }`}
                        />
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#CBD5E1] font-semibold">{m.vesselName}</td>

                    <td className="py-3.5 px-4 text-[#5DADE2] font-semibold">
                      {m.destinationName}
                    </td>

                    <td className="py-3.5 px-4 text-[#91A4AE]">{m.departureDate}</td>

                    <td className="py-3.5 px-4 text-[#E8F0F3] font-semibold">
                      {m.etaFormatted}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          m.riskLevel === 'High'
                            ? 'text-[#E05B5B]'
                            : m.riskLevel === 'Moderate'
                            ? 'text-[#E5B84B]'
                            : 'text-[#43C98B]'
                        }`}
                      >
                        {m.riskLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMission(m);
                        }}
                        className="py-1 px-2.5 rounded bg-[#152535] hover:bg-[#5DADE2] hover:text-[#071018] text-[#E8F0F3] text-xs font-semibold transition cursor-pointer"
                      >
                        {isActiveMission ? 'Loaded' : 'Load Mission'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Mission Detailed Synopsis */}
      <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
        <span className="text-[10px] text-[#60737E] uppercase tracking-wider block font-semibold">
          MISSION OPERATIONAL BRIEF: {currentMission.missionNumber}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-[#60737E] block uppercase">Scientific Team</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {currentMission.scientificTeam}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#60737E] block uppercase">Total Distance</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {currentMission.distanceTotalKm} km ({Math.round(currentMission.distanceTotalKm * 0.54)} NM)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#60737E] block uppercase">Polar Operational Profile</span>
            <span className="text-[#43C98B] font-semibold mt-0.5 block">
              Direct Transit via Prydz Bay Polynya Corridor
            </span>
          </div>
        </div>
        <p className="text-xs text-[#91A4AE] leading-relaxed border-t border-[#1B2A35] pt-2">
          {currentMission.objective}
        </p>
      </div>
    </div>
  );
};

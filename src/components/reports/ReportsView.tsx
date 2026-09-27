import React, { useState } from 'react';
import { Mission, Vessel, RouteOption, SeaIceData, WeatherOceanData } from '../../types/navigation';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ShieldCheck,
  Ship,
  Fuel,
  Compass,
} from 'lucide-react';

interface ReportsViewProps {
  mission: Mission;
  vessel: Vessel;
  activeRoute: RouteOption;
  seaIce: SeaIceData;
  weather: WeatherOceanData;
  routeRecalculated: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  mission,
  vessel,
  activeRoute,
  seaIce,
  weather,
  routeRecalculated,
}) => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    setExportNotice('Exporting official NCPOR / IMO Polar Code Voyage Dossier (PDF)...');
    setTimeout(() => {
      setExportNotice('Voyage Dossier exported successfully to /downloads/ICEWAY_MISSION_07_DISPATCH.pdf');
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#071018] p-4 lg:p-8 font-mono space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B2A35]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#5DADE2]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#E8F0F3]">
              MISSION DISPATCH & NAVIGATION REPORT
            </h1>
            <p className="text-[11px] text-[#91A4AE]">
              IMO Polar Water Operational Manual (PWOM) Compliant Voyage Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="py-1.5 px-3 rounded bg-[#5DADE2] hover:bg-[#4999c7] text-[#071018] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded bg-[#43C98B]/10 border border-[#43C98B]/30 text-xs text-[#43C98B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Official Polar Report Document Container */}
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-lg p-6 space-y-6 max-w-5xl shadow-xl">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-[#1B2A35] pb-4">
          <div>
            <span className="text-[10px] text-[#60737E] uppercase tracking-widest block">
              NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (GOVT. OF INDIA)
            </span>
            <h2 className="text-lg font-bold text-[#E8F0F3] mt-1">
              ANTARCTIC VOYAGE OPERATIONS SUMMARY: {mission.missionNumber}
            </h2>
            <div className="text-xs text-[#5DADE2] mt-0.5">
              Sector: Prydz Bay / Larsemann Hills · Destination: {mission.destinationName}
            </div>
          </div>
          <div className="text-right text-xs text-[#91A4AE]">
            <div>Ref: ISEA-45/SAGAR/NAV-07</div>
            <div>Date: 2026-09-27</div>
            <div className="text-[#43C98B] font-semibold mt-0.5">STATUS: ON WATCH</div>
          </div>
        </div>

        {/* Section 1: Mission Summary & Vessel Telemetry */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-[#5DADE2]">
            1. MISSION SUMMARY & VESSEL PROFILE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#071018] p-3.5 rounded border border-[#1B2A35]">
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Vessel Name</span>
              <span className="text-[#E8F0F3] font-semibold">{vessel.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Call Sign / IMO</span>
              <span className="text-[#E8F0F3]">{vessel.callSign} / {vessel.imo}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Ice Capability</span>
              <span className="text-[#43C98B] font-semibold">{vessel.iceClass}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Master / advanced Endorsement</span>
              <span className="text-[#E8F0F3]">{vessel.captain}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Route Performance & Fuel Consumption */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-[#5DADE2]">
            2. ROUTE PERFORMANCE & FUEL CONSUMPTION
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#071018] p-3.5 rounded border border-[#1B2A35]">
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Active Route Track</span>
              <span className="text-[#E8F0F3] font-semibold">{activeRoute.name} ({activeRoute.tag})</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Distance (Leg / Total)</span>
              <span className="text-[#E8F0F3] font-semibold">
                {activeRoute.distanceKm} km ({activeRoute.distanceNm.toFixed(0)} NM)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Estimated Fuel Consumption</span>
              <span className="text-[#E8F0F3] font-semibold">
                {activeRoute.fuelUnits} units ({vessel.fuelPct}% remaining)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Cumulative Risk Index</span>
              <span
                className={`font-bold ${
                  activeRoute.riskScore > 35 ? 'text-[#E05B5B]' : 'text-[#43C98B]'
                }`}
              >
                {activeRoute.riskScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Environmental Conditions & Ice Exposure */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-[#5DADE2]">
            3. OBSERVED ENVIRONMENTAL & SEA-ICE CONDITIONS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#071018] p-3.5 rounded border border-[#1B2A35]">
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Sea-Ice Concentration</span>
              <span className="text-[#E8F0F3] font-semibold">{seaIce.currentConcentrationPct}% (Pack Ice)</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Route Ice Exposure</span>
              <span className="text-[#43C98B] font-semibold">{activeRoute.iceExposurePct}% of transit</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Surface Wind / Wave</span>
              <span className="text-[#E8F0F3]">
                {weather.windKnots} kn {weather.windCardinal} · Wave {weather.waveHeightMeters}m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Ambient Air / SST</span>
              <span className="text-[#E8F0F3]">{weather.airTempC}°C / SST {weather.seaTempC}°C</span>
            </div>
          </div>
        </div>

        {/* Section 4: Navigation Events & Safety Log */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-[#5DADE2]">
            4. NAVIGATION & SAFETY EVENTS CHRONOLOGY
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35] flex items-start gap-2.5">
              <span className="text-[#60737E] shrink-0">14:32 UTC</span>
              <div className="text-[#CBD5E1]">
                <strong className="text-[#E8F0F3]">SAR Data Ingestion:</strong> Sentinel-1B Extra-Wide swath updated. Sea ice marginal boundary mapped at 66°10'S.
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35] flex items-start gap-2.5">
              <span className="text-[#60737E] shrink-0">14:22 UTC</span>
              <div className="text-[#CBD5E1]">
                <strong className="text-[#E05B5B]">Iceberg Target IB-1042:</strong> Radar acquisition confirmed. Tabular berg 1.8 km length, drift velocity 0.42 m/s heading 218° SW.
              </div>
            </div>

            {routeRecalculated ? (
              <div className="p-2.5 rounded bg-[#43C98B]/10 border border-[#43C98B]/30 flex items-start gap-2.5">
                <span className="text-[#43C98B] font-bold shrink-0">14:35 UTC</span>
                <div className="text-[#E8F0F3]">
                  <strong className="text-[#43C98B]">Route Recalculation Completed:</strong> Diversion executed north of IB-1042 projected drift path. Safety clearance increased from 2.8 NM to 8.4 NM. Voyage risk score reduced from 67 to 21. Additional fuel consumption +4.1%.
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded bg-[#071018] border border-[#1B2A35] flex items-start gap-2.5">
                <span className="text-[#60737E] shrink-0">06:00 UTC</span>
                <div className="text-[#CBD5E1]">
                  <strong className="text-[#E8F0F3]">Voyage Departure:</strong> RV Sagar cleared open water gate on course 142° towards Bharati Station anchorage.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Polar Master Signoff */}
        <div className="border-t border-[#1B2A35] pt-4 flex justify-between items-end text-xs text-[#91A4AE]">
          <div>
            <div className="text-[#E8F0F3] font-semibold">Capt. Rajesh Varma</div>
            <div className="text-[10px]">Master advanced Polar Waters (STCW A-V/4-2)</div>
          </div>
          <div className="text-right">
            <div className="text-[#5DADE2] font-semibold">NCPOR OPERATIONAL CONSOLE VERIFIED</div>
            <div className="text-[10px] text-[#60737E]">ELECTRONIC DISPATCH SEAL #904D-07</div>
          </div>
        </div>
      </div>
    </div>
  );
};

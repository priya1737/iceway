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
import { useApp } from '../../context/AppContext';

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
  const { addToast } = useApp();
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCSV = () => {
    const csvContent = [
      'Field,Value',
      `Mission,${mission.missionNumber}`,
      `Title,"${mission.title}"`,
      `Destination,"${mission.destinationName}"`,
      `Vessel,"${vessel.name}"`,
      `CallSign,${vessel.callSign}`,
      `IMO,${vessel.imo}`,
      `IceClass,"${vessel.iceClass}"`,
      `Master,"${vessel.captain}"`,
      `Route,"${activeRoute.displayName}"`,
      `TotalDistanceKm,${activeRoute.distanceKm}`,
      `TotalDistanceNm,${activeRoute.distanceNm}`,
      `ETA,"${activeRoute.etaFormatted}"`,
      `RiskScore,${activeRoute.riskScore}`,
      `SeaIceConcentration,${seaIce.currentConcentrationPct}%`,
      `AvgIceThicknessM,${seaIce.avgThicknessMeters}`,
      `AirTempC,${weather.airTempC}`,
      `WindKnots,${weather.windKnots}`,
      `WaveHeightM,${weather.waveHeightMeters}`,
    ].join('\n');

    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ICEWAY_REPORT_${mission.missionNumber.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Report Exported', 'CSV voyage dispatch dossier generated.', 'success');
  };

  const handlePrint = () => {
    window.print();
    addToast('Print Triggered', 'Browser print preview loaded for Polar Code Dossier.', 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#071018] p-3 sm:p-4 lg:p-8 font-mono space-y-4 sm:space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#1B2A35]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#E8F0F3] leading-none">
              MISSION DISPATCH & NAVIGATION REPORT
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#91A4AE] mt-0.5 truncate max-w-[280px] sm:max-w-none">
              IMO Polar Water Operational Manual (PWOM) Compliant Voyage Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto py-1.5 px-3 rounded bg-[#152535] hover:bg-[#20364a] text-cyan-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-500/30"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT / PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto py-1.5 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-900/30"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Official Polar Report Document Container */}
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl shadow-xl glass-card">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#1B2A35] pb-4 gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] text-[#60737E] uppercase tracking-widest block">
              NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (GOVT. OF INDIA)
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#E8F0F3] mt-1">
              ANTARCTIC VOYAGE OPERATIONS SUMMARY: {mission.missionNumber}
            </h2>
            <div className="text-xs text-cyan-400 mt-0.5">
              Sector: Prydz Bay / Larsemann Hills · Destination: {mission.destinationName}
            </div>
          </div>
          <div className="sm:text-right text-xs text-[#91A4AE]">
            <div>Ref: ISEA-45/SAGAR/NAV-07</div>
            <div>Date: 2026-09-27</div>
            <div className="text-emerald-400 font-semibold mt-0.5">STATUS: ON WATCH</div>
          </div>
        </div>

        {/* Section 1: Mission Summary & Vessel Telemetry */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-cyan-400">
            1. MISSION SUMMARY & VESSEL PROFILE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#071018] p-3.5 rounded-lg border border-[#1B2A35]">
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
              <span className="text-emerald-400 font-semibold">{vessel.iceClass}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Master / Endorsement</span>
              <span className="text-[#E8F0F3]">{vessel.captain}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Voyage Objective</span>
              <span className="text-[#CBD5E1] col-span-3 block truncate">{mission.objective}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Active Route Assessment */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-cyan-400">
            2. ACTIVE NAVIGATION CORRIDOR ASSESSMENT
          </h3>
          <div className="bg-[#071018] p-3.5 rounded-lg border border-[#1B2A35] space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-[#60737E] block uppercase">Assigned Corridor</span>
                <span className="text-cyan-400 font-bold">{activeRoute.displayName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#60737E] block uppercase">Distance Remaining</span>
                <span className="text-[#E8F0F3] font-bold">
                  {activeRoute.distanceKm} km ({activeRoute.distanceNm.toFixed(0)} NM)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#60737E] block uppercase">Estimated Ingress ETA</span>
                <span className="text-[#E8F0F3] font-bold">{activeRoute.etaFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#60737E] block uppercase">POLARIS RIO Score</span>
                <span
                  className={`font-bold ${
                    activeRoute.riskScore > 50
                      ? 'text-red-400'
                      : activeRoute.riskScore > 25
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeRoute.riskScore} / 100 ({activeRoute.riskScore < 30 ? 'LOW RISK' : 'ELEVATED'})
                </span>
              </div>
            </div>

            {routeRecalculated && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                ✓ Recalculated Avoidance Corridor 07-R is actively loaded into the ECDIS and autopilot.
                Iceberg contact B-31 safety clearance verified at 4.8 NM.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Environmental State */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider text-cyan-400">
            3. SYNOPTIC SEA-ICE & METEOROLOGICAL CONTEXT
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#071018] p-3.5 rounded-lg border border-[#1B2A35]">
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Sea-Ice Concentration</span>
              <span className="text-[#E8F0F3] font-bold">{seaIce.currentConcentrationPct}% (↗ {seaIce.trend})</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Average Ice Thickness</span>
              <span className="text-[#E8F0F3] font-bold">{seaIce.avgThicknessMeters} m</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Surface Wind</span>
              <span className="text-[#E8F0F3] font-bold">{weather.windKnots} kn {weather.windCardinal}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60737E] block uppercase">Air / Sea Temperature</span>
              <span className="text-[#E8F0F3] font-bold">{weather.airTempC}°C / {weather.seaTempC}°C</span>
            </div>
          </div>
        </div>

        {/* Signature & Watch Release Block */}
        <div className="pt-4 border-t border-[#1B2A35] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#91A4AE] gap-3">
          <div>
            <div>Authorized Watch Officer: <strong>Capt. Rajesh Varma</strong></div>
            <div className="text-[10px] text-[#60737E]">Master STCW A-V/4-2 Polar Navigation</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              VALID FOR DEPARTURE & ICE ENTRY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

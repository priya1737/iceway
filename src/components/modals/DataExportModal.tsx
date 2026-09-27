import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Download, FileSpreadsheet, FileJson, Printer, Check, Shield } from 'lucide-react';

export const DataExportModal: React.FC = () => {
  const {
    exportModalOpen,
    setExportModalOpen,
    exportMissions,
    exportIcebergs,
    missions,
    icebergs,
    vessel,
    activeRoute,
    seaIce,
    weather,
    addToast,
  } = useApp();

  const [dataset, setDataset] = useState<'missions' | 'icebergs' | 'manifest' | 'telemetry'>('missions');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  if (!exportModalOpen) return null;

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (dataset === 'missions') {
        exportMissions(format);
      } else if (dataset === 'icebergs') {
        exportIcebergs(format);
      } else if (dataset === 'manifest') {
        // Voyage manifest export
        const manifestData = {
          exportTimestamp: new Date().toISOString(),
          vessel: {
            name: vessel.name,
            callSign: vessel.callSign,
            imo: vessel.imo,
            iceClass: vessel.iceClass,
            captain: vessel.captain,
            fuelPct: vessel.fuelPct,
            fuelRemainingTons: vessel.fuelRemainingTons,
          },
          activeRoute: {
            name: activeRoute.displayName,
            distanceNm: activeRoute.distanceNm,
            etaFormatted: activeRoute.etaFormatted,
            riskScore: activeRoute.riskScore,
            waypoints: activeRoute.waypoints,
          },
          environmentalConditions: {
            seaIceConcentrationPct: seaIce.currentConcentrationPct,
            avgThicknessMeters: seaIce.avgThicknessMeters,
            airTempC: weather.airTempC,
            windKnots: weather.windKnots,
            windCardinal: weather.windCardinal,
            waveHeightMeters: weather.waveHeightMeters,
            iceAccretionRisk: weather.iceAccretionRisk,
          },
        };

        if (format === 'json') {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifestData, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `voyage_manifest_${vessel.callSign}_${Date.now()}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        } else {
          const csvLines = [
            'Section,Field,Value',
            `Vessel,Name,"${vessel.name}"`,
            `Vessel,CallSign,"${vessel.callSign}"`,
            `Vessel,IMO,"${vessel.imo}"`,
            `Vessel,IceClass,"${vessel.iceClass}"`,
            `Vessel,Master,"${vessel.captain}"`,
            `Navigation,RouteName,"${activeRoute.displayName}"`,
            `Navigation,DistanceNm,${activeRoute.distanceNm}`,
            `Navigation,ETA,"${activeRoute.etaFormatted}"`,
            `Navigation,RiskScore,${activeRoute.riskScore}`,
            `Environment,SeaIceConcentrationPct,${seaIce.currentConcentrationPct}`,
            `Environment,IceThicknessM,${seaIce.avgThicknessMeters}`,
            `Environment,AirTempC,${weather.airTempC}`,
            `Environment,WindKnots,${weather.windKnots}`,
            `Environment,WaveHeightM,${weather.waveHeightMeters}`,
          ];
          const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', encodeURI(csvContent));
          downloadAnchor.setAttribute('download', `voyage_manifest_${vessel.callSign}_${Date.now()}.csv`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        }

        addToast('Voyage Manifest Exported', 'IMO Polar Code compliant document downloaded.', 'success');
      } else {
        // Telemetry bundle
        const telemetryBundle = {
          timestamp: new Date().toISOString(),
          vesselTelemetry: vessel,
          seaIceForecast: seaIce,
          weatherTimeline: weather.timeline,
          activeRadarTargets: icebergs,
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetryBundle, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `telemetry_bundle_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        addToast('Telemetry Log Exported', 'Full sensor log exported to JSON.', 'success');
      }

      setIsExporting(false);
      setExportModalOpen(false);
    }, 400);
  };

  const handlePrintBriefing = () => {
    window.print();
    addToast('Print Document Sent', 'Browser print preview initialized.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                DATA EXPORT & OPERATIONAL BRIEFING
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                Generate structured datasets for shore command and scientific analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Dataset Selection */}
          <div>
            <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-2">
              Select Data Package
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataset('missions')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  dataset === 'missions'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#1B2A35]/80'
                }`}
              >
                <div className="font-bold text-xs text-[#E8F0F3]">Expedition Missions</div>
                <div className="text-[10px] text-[#60737E] mt-0.5">{missions.length} active and planned voyages</div>
              </button>

              <button
                onClick={() => setDataset('icebergs')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  dataset === 'icebergs'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#1B2A35]/80'
                }`}
              >
                <div className="font-bold text-xs text-[#E8F0F3]">Iceberg Hazards</div>
                <div className="text-[10px] text-[#60737E] mt-0.5">{icebergs.length} tracked radar contacts</div>
              </button>

              <button
                onClick={() => setDataset('manifest')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  dataset === 'manifest'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#1B2A35]/80'
                }`}
              >
                <div className="font-bold text-xs text-[#E8F0F3]">Voyage Manifest</div>
                <div className="text-[10px] text-[#60737E] mt-0.5">Vessel + Route + Conditions summary</div>
              </button>

              <button
                onClick={() => setDataset('telemetry')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  dataset === 'telemetry'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#1B2A35]/80'
                }`}
              >
                <div className="font-bold text-xs text-[#E8F0F3]">Telemetry Bundle</div>
                <div className="text-[10px] text-[#60737E] mt-0.5">Full multi-sensor temporal series</div>
              </button>
            </div>
          </div>

          {/* Export Format Selector */}
          <div>
            <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border flex items-center gap-3 transition cursor-pointer ${
                  format === 'csv'
                    ? 'bg-[#152535] border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-[#E8F0F3]">CSV (Spreadsheet)</div>
                  <div className="text-[10px] text-[#60737E]">Comma-delimited tabular data</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-lg border flex items-center gap-3 transition cursor-pointer ${
                  format === 'json'
                    ? 'bg-[#152535] border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                <FileJson className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-[#E8F0F3]">JSON (Structured)</div>
                  <div className="text-[10px] text-[#60737E]">Hierarchical nested telemetry</div>
                </div>
              </button>
            </div>
          </div>

          {/* Print Quick Action */}
          <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-[#91A4AE]" />
              <div>
                <span className="font-semibold text-[#E8F0F3] block">Executive Voyage Briefing</span>
                <span className="text-[10px] text-[#60737E]">Formatted print layout for bridge watch officers</span>
              </div>
            </div>
            <button
              onClick={handlePrintBriefing}
              className="px-3 py-1 rounded bg-[#152535] hover:bg-[#20364a] text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <span className="text-[10px] text-[#60737E]">
            Client-side export, immediate generation.
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setExportModalOpen(false)}
              className="px-3.5 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-1.5 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <span className="animate-spin">⏳</span> : <Download className="w-3.5 h-3.5" />}
              {isExporting ? 'Generating...' : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

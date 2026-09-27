import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Mountain, Compass, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import { RiskLevel } from '../../types/navigation';

export const RegisterIcebergModal: React.FC = () => {
  const { registerIcebergModalOpen, setRegisterIcebergModalOpen, addIceberg, icebergs } = useApp();

  const [formData, setFormData] = useState({
    name: `TARGET B-${32 + icebergs.length}A`,
    lat: -66.45,
    lon: 67.20,
    estimatedSizeKm: 1.8,
    velocityMs: 0.35,
    headingDeg: 255,
    draftMeters: 145,
    freeboardMeters: 38,
    riskLevel: 'HIGH' as RiskLevel,
    type: 'TABULAR' as 'TABULAR' | 'PINNACLE' | 'GROWLER_CLUSTER' | 'DOME',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!registerIcebergModalOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'Contact designation is required.';

    if (formData.lat > -50 || formData.lat < -85) {
      errs.lat = 'Polar Latitude must be between -50° and -85° S.';
    }

    if (formData.lon < -180 || formData.lon > 180) {
      errs.lon = 'Longitude must be between -180° and +180°.';
    }

    if (formData.estimatedSizeKm <= 0) {
      errs.estimatedSizeKm = 'Size must be greater than 0 km.';
    }

    if (formData.headingDeg < 0 || formData.headingDeg > 360) {
      errs.headingDeg = 'Heading must be 0° to 360°.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addIceberg({
      name: formData.name.toUpperCase(),
      lat: Number(formData.lat),
      lon: Number(formData.lon),
      estimatedSizeKm: Number(formData.estimatedSizeKm),
      velocityMs: Number(formData.velocityMs),
      headingDeg: Number(formData.headingDeg),
      lastObservedUtc: new Date().toISOString().slice(11, 16) + ' UTC',
      trajectoryConfidencePct: 92,
      draftMeters: Number(formData.draftMeters),
      freeboardMeters: Number(formData.freeboardMeters),
      riskLevel: formData.riskLevel,
      type: formData.type,
      proximityToRouteNm: 2.4,
      timeToClosestApproachHours: 11.5,
    });

    setRegisterIcebergModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-amber-500/40 rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                LOG RADAR ICEBERG HAZARD CONTACT
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                Add Acoustic / S-Band Radar Target to Collision Avoidance Matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => setRegisterIcebergModalOpen(false)}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Target Designation *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 bg-[#071018] border rounded text-xs text-[#E8F0F3] focus:outline-none transition ${
                  errors.name ? 'border-red-500' : 'border-[#1B2A35] focus:border-amber-400'
                }`}
              />
              {errors.name && (
                <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Iceberg Morphology Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="TABULAR">Tabular Iceberg (Shelf Calved)</option>
                <option value="PINNACLE">Pinnacle / Spire</option>
                <option value="DOME">Dome Massif</option>
                <option value="GROWLER_CLUSTER">Growler / Bergy Bit Cluster</option>
              </select>
            </div>
          </div>

          {/* Coordinates */}
          <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-3">
            <span className="text-[10px] text-[#91A4AE] uppercase font-bold tracking-wider block">
              Observed Polar Coordinates
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-[#60737E] block uppercase mb-1">Latitude (°S)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#0B1721] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
                />
                {errors.lat && <span className="text-[9px] text-red-400 mt-1 block">{errors.lat}</span>}
              </div>

              <div>
                <label className="text-[9px] text-[#60737E] block uppercase mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lon}
                  onChange={(e) => setFormData({ ...formData, lon: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#0B1721] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
                />
                {errors.lon && <span className="text-[9px] text-red-400 mt-1 block">{errors.lon}</span>}
              </div>
            </div>
          </div>

          {/* Physical Dimensions & Drift */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Est. Size (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.estimatedSizeKm}
                onChange={(e) => setFormData({ ...formData, estimatedSizeKm: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Drift Speed (m/s)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={formData.velocityMs}
                onChange={(e) => setFormData({ ...formData, velocityMs: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Heading (Deg)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="360"
                value={formData.headingDeg}
                onChange={(e) => setFormData({ ...formData, headingDeg: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Underwater Draft (m)
              </label>
              <input
                type="number"
                value={formData.draftMeters}
                onChange={(e) => setFormData({ ...formData, draftMeters: parseInt(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Threat Classification
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="HIGH">HIGH (Imminent Route Intersect)</option>
                <option value="CAUTION">CAUTION (Near Fairway Buffer)</option>
                <option value="LOW">LOW (Open Water Drift)</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-[#1B2A35] flex items-center justify-between">
            <span className="text-[10px] text-[#60737E]">
              Generates 24-hour predictive Kalman drift trajectory.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRegisterIcebergModalOpen(false)}
                className="px-3.5 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 shadow-lg shadow-amber-900/30 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Track Hazard Target
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

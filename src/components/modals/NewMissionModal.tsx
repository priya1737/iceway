import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Ship, MapPin, Calendar, Compass, ShieldCheck, AlertCircle, Check } from 'lucide-react';

export const NewMissionModal: React.FC = () => {
  const { newMissionModalOpen, setNewMissionModalOpen, addMission, stations, missions } = useApp();

  const nextMissionNumber = `MISSION 0${missions.length + 1}`;

  const [formData, setFormData] = useState({
    missionNumber: nextMissionNumber,
    title: '',
    vesselName: 'RV Sagar',
    destinationName: 'Bharati Station',
    departureDate: new Date().toISOString().slice(0, 10),
    distanceTotalKm: 650,
    riskLevel: 'Low' as 'Low' | 'Moderate' | 'High',
    objective: '',
    scientificTeam: 'National Centre for Polar and Ocean Research (NCPOR)',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!newMissionModalOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.missionNumber.trim()) errs.missionNumber = 'Mission identifier is required.';
    if (!formData.title.trim()) errs.title = 'Expedition title is required.';
    else if (formData.title.trim().length < 5) errs.title = 'Title must be at least 5 characters.';

    if (!formData.objective.trim()) errs.objective = 'Mission scientific objective is required.';
    else if (formData.objective.trim().length < 15) errs.objective = 'Objective description must be at least 15 characters.';

    if (formData.distanceTotalKm <= 0) errs.distanceTotalKm = 'Distance must be greater than 0 km.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addMission({
        missionNumber: formData.missionNumber.toUpperCase(),
        title: formData.title.toUpperCase(),
        vesselName: formData.vesselName,
        destinationName: formData.destinationName,
        status: 'Planned',
        departureDate: `${formData.departureDate} 08:00 UTC`,
        etaFormatted: 'Pending Departure',
        riskLevel: formData.riskLevel,
        distanceTotalKm: Number(formData.distanceTotalKm),
        distanceRemainingKm: Number(formData.distanceTotalKm),
        objective: formData.objective,
        scientificTeam: formData.scientificTeam,
      });

      setIsSubmitting(false);
      setNewMissionModalOpen(false);
      // Reset form
      setFormData({
        missionNumber: `MISSION 0${missions.length + 2}`,
        title: '',
        vesselName: 'RV Sagar',
        destinationName: 'Bharati Station',
        departureDate: new Date().toISOString().slice(0, 10),
        distanceTotalKm: 650,
        riskLevel: 'Low',
        objective: '',
        scientificTeam: 'National Centre for Polar and Ocean Research (NCPOR)',
      });
      setErrors({});
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                REGISTER ANTARCTIC EXPEDITION MISSION
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                NCPOR Maritime Voyage Registry & IMO Polar Code Entry
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewMissionModalOpen(false)}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mission Identifier */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Mission Code *
              </label>
              <input
                type="text"
                value={formData.missionNumber}
                onChange={(e) => setFormData({ ...formData, missionNumber: e.target.value })}
                className={`w-full px-3 py-2 bg-[#071018] border rounded text-xs text-[#E8F0F3] focus:outline-none transition ${
                  errors.missionNumber ? 'border-red-500' : 'border-[#1B2A35] focus:border-cyan-400'
                }`}
                placeholder="e.g. MISSION 09"
              />
              {errors.missionNumber && (
                <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.missionNumber}
                </span>
              )}
            </div>

            {/* Expedition Title */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Voyage Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 bg-[#071018] border rounded text-xs text-[#E8F0F3] focus:outline-none transition ${
                  errors.title ? 'border-red-500' : 'border-[#1B2A35] focus:border-cyan-400'
                }`}
                placeholder="e.g. LARSEMANN HILLS OCEANOGRAPHIC SURVEY"
              />
              {errors.title && (
                <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vessel Selection */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Assigned Vessel
              </label>
              <select
                value={formData.vesselName}
                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="RV Sagar">RV Sagar (PC 5)</option>
                <option value="RV Samudra">RV Samudra (PC 4)</option>
                <option value="RV Polarstern">RV Polarstern (PC 3)</option>
                <option value="RSV Nuyina">RSV Nuyina (PC 3)</option>
              </select>
            </div>

            {/* Destination Station */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Destination Station
              </label>
              <select
                value={formData.destinationName}
                onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Classification */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Risk Classification
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Low">Low (Open Fairways)</option>
                <option value="Moderate">Moderate (Pack Ice Fringe)</option>
                <option value="High">High (Shelf Calving Ingress)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Planned Departure Date */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Departure Date (UTC)
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
              />
            </div>

            {/* Total Distance */}
            <div>
              <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                Estimated Transit Distance (km)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                value={formData.distanceTotalKm}
                onChange={(e) => setFormData({ ...formData, distanceTotalKm: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Scientific Team */}
          <div>
            <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
              Scientific Agency & Principal Investigator
            </label>
            <input
              type="text"
              value={formData.scientificTeam}
              onChange={(e) => setFormData({ ...formData, scientificTeam: e.target.value })}
              className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
              placeholder="e.g. National Centre for Polar and Ocean Research (NCPOR)"
            />
          </div>

          {/* Mission Objective */}
          <div>
            <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
              Mission Objective & Operations Scope *
            </label>
            <textarea
              rows={3}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className={`w-full px-3 py-2 bg-[#071018] border rounded text-xs text-[#E8F0F3] focus:outline-none transition ${
                errors.objective ? 'border-red-500' : 'border-[#1B2A35] focus:border-cyan-400'
              }`}
              placeholder="Detail cargo resupply quantities, oceanographic CTD stations, scientific equipment deployments, and wintering crew rotations..."
            />
            {errors.objective && (
              <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.objective}
              </span>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-[#1B2A35] flex items-center justify-between">
            <span className="text-[10px] text-[#60737E]">
              Fields marked with * are mandatory for Polar Code compliance.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewMissionModalOpen(false)}
                className="px-3.5 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {isSubmitting ? 'Registering...' : 'Register Mission'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

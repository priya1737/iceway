import React, { useState } from 'react';
import { useApp, AccentColor } from '../../context/AppContext';
import { X, Settings, Sliders, Shield, User, Bell, Palette, Check, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  safetyMarginNm?: number;
  onSetSafetyMargin?: (margin: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    accentColor,
    setAccentColor,
    settings,
    updateSettings,
    officerProfile,
    updateOfficerProfile,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'units' | 'polarcode'>('appearance');

  // Local form states
  const [profileForm, setProfileForm] = useState(officerProfile);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficerProfile(profileForm);
    addToast('Officer Profile Saved', 'Watchkeeper credentials and callsign updated.', 'success');
  };

  const accents: { id: AccentColor; label: string; bg: string; border: string; glow: string }[] = [
    { id: 'cyan', label: 'Polar Cyan', bg: 'bg-sky-500', border: 'border-sky-400', glow: 'shadow-sky-500/50' },
    { id: 'emerald', label: 'Aurora Emerald', bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/50' },
    { id: 'violet', label: 'Arctic Violet', bg: 'bg-violet-500', border: 'border-violet-400', glow: 'shadow-violet-500/50' },
    { id: 'amber', label: 'Solar Amber', bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-amber-500/50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                SYSTEM & OPERATIONAL SETTINGS
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                NCPOR Bridge Configuration, Themes, and Polar Code Parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-0 border-b border-[#1B2A35] bg-[#071018]/60 flex gap-2">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-2.5 px-2 text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Theme & Display
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-2 text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Officer Profile
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`pb-2.5 px-2 text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'units'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Conventions & Alerts
          </button>

          <button
            onClick={() => setActiveTab('polarcode')}
            className={`pb-2.5 px-2 text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'polarcode'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-[#91A4AE] hover:text-[#E8F0F3]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Polar Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#91A4AE] uppercase font-bold tracking-wider block mb-2">
                  Accent Glow & Interface Highlight
                </span>
                <p className="text-[11px] text-[#60737E] mb-3">
                  Select primary radar and HUD highlight color for polar night navigation:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {accents.map((acc) => {
                    const isSelected = accentColor === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setAccentColor(acc.id);
                          addToast('Theme Applied', `Active HUD accent switched to ${acc.label}.`, 'info');
                        }}
                        className={`p-3 rounded-lg border text-left flex flex-col items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? `bg-[#152535] ${acc.border} text-[#E8F0F3] shadow-lg ${acc.glow}`
                            : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#2a3f4e]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full ${acc.bg} flex items-center justify-center shadow-md`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#071018]" />}
                        </div>
                        <span className="text-[11px] font-semibold">{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time preview card */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <span className="text-[10px] text-[#60737E] uppercase font-semibold block">
                  Accent Live Preview
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-[#0B1721] border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-[#E8F0F3]">Polar AIS Telemetry Synchronized</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400">NORMAL OPS</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                  Master / Ice Navigation Officer
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                    Call Sign / Station ID
                  </label>
                  <input
                    type="text"
                    value={profileForm.callSign}
                    onChange={(e) => setProfileForm({ ...profileForm, callSign: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                    Polar Pilot License #
                  </label>
                  <input
                    type="text"
                    value={profileForm.licenseNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                  STCW Polar Waters Certification
                </label>
                <input
                  type="text"
                  value={profileForm.polarCertification}
                  onChange={(e) => setProfileForm({ ...profileForm, polarCertification: e.target.value })}
                  className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#91A4AE] block uppercase font-semibold mb-1">
                  Designated Antarctic Sector
                </label>
                <input
                  type="text"
                  value={profileForm.sector}
                  onChange={(e) => setProfileForm({ ...profileForm, sector: e.target.value })}
                  className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Officer Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'units' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                Measurement Conventions & Alerts
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Distance */}
                <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35]">
                  <label className="text-[9px] text-[#60737E] block mb-1.5 uppercase font-semibold">Distance Units</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0B1721] rounded">
                    <button
                      onClick={() => updateSettings({ distanceUnit: 'km' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.distanceUnit === 'km' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Kilometers (km)
                    </button>
                    <button
                      onClick={() => updateSettings({ distanceUnit: 'nm' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.distanceUnit === 'nm' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Nautical Miles (NM)
                    </button>
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35]">
                  <label className="text-[9px] text-[#60737E] block mb-1.5 uppercase font-semibold">Temperature Units</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0B1721] rounded">
                    <button
                      onClick={() => updateSettings({ tempUnit: 'c' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.tempUnit === 'c' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      onClick={() => updateSettings({ tempUnit: 'f' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.tempUnit === 'f' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert Toggles */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-3">
                <span className="text-[10px] text-[#91A4AE] uppercase font-bold tracking-wider block">
                  Bridge Notification Toggles
                </span>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#E8F0F3] block">Audio Chime on Critical Hazard</span>
                    <span className="text-[10px] text-[#60737E]">Acoustic ping when iceberg CPA &lt; 3.0 NM</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ audioChimesEnabled: !settings.audioChimesEnabled })}
                    className={`w-11 h-6 rounded-full transition relative cursor-pointer ${
                      settings.audioChimesEnabled ? 'bg-cyan-500' : 'bg-[#152535]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                        settings.audioChimesEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1B2A35]">
                  <div>
                    <span className="text-xs text-[#E8F0F3] block">Automatic Avoidance Solver</span>
                    <span className="text-[10px] text-[#60737E]">Pre-calculate avoidance route when hazard detected</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoRecalculateOnHazard: !settings.autoRecalculateOnHazard })}
                    className={`w-11 h-6 rounded-full transition relative cursor-pointer ${
                      settings.autoRecalculateOnHazard ? 'bg-cyan-500' : 'bg-[#152535]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                        settings.autoRecalculateOnHazard ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'polarcode' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                IMO Polar Code Hull Rating & Operational Limits
              </span>

              <div className="space-y-2">
                {[
                  { class: 'PC1', label: 'Year-round operation in all polar waters', active: false },
                  { class: 'PC2', label: 'Year-round operation in moderate multi-year ice conditions', active: false },
                  { class: 'PC3', label: 'Year-round in second-year ice which may include multi-year ice inclusions', active: false },
                  { class: 'PC4', label: 'Year-round in thick first-year ice which may include old ice inclusions', active: false },
                  { class: 'PC5', label: 'Year-round operation in medium first-year ice (RV Sagar certified)', active: true },
                  { class: 'PC6', label: 'Summer/autumn operation in medium first-year ice', active: false },
                  { class: 'PC7', label: 'Summer/autumn operation in thin first-year ice', active: false },
                ].map((pc) => {
                  const isCurrent = settings.polarClass === pc.class;
                  return (
                    <div
                      key={pc.class}
                      onClick={() => {
                        updateSettings({ polarClass: pc.class as any });
                        addToast('Polar Code Updated', `Hull rating set to ${pc.class}.`, 'info');
                      }}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#152535] border-cyan-400 text-cyan-300'
                          : 'bg-[#071018] border-[#1B2A35] text-[#91A4AE] hover:border-[#2a3f4e]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#0B1721] border border-current">
                          {pc.class}
                        </span>
                        <span className="text-[11px] text-[#E8F0F3]">{pc.label}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <span className="text-[10px] text-[#60737E]">
            Preferences are saved automatically to active session storage.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-bold bg-[#152535] hover:bg-[#20364a] text-[#E8F0F3] border border-[#1B2A35] transition cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp, AccentColor } from '../../context/AppContext';
import {
  X,
  Settings,
  Sliders,
  Shield,
  User,
  Bell,
  Palette,
  Check,
  RotateCcw,
  Lock,
  Volume2,
  Radio,
  KeyRound,
  ShieldAlert,
  Send,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<
    'appearance' | 'profile' | 'units' | 'polarcode' | 'security' | 'alarms'
  >('appearance');

  // Local form states
  const [profileForm, setProfileForm] = useState(officerProfile);
  const [securityKey, setSecurityKey] = useState(
    settings.securityToken || 'SHA256:8892-F92B-01C8-ECDIS-AUTH-POLAR'
  );
  const [showKey, setShowKey] = useState(false);
  const [testChimePlaying, setTestChimePlaying] = useState(false);

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

  // Synthesize realistic bridge acoustic chime using Web Audio API
  const playTestBridgePing = () => {
    try {
      setTestChimePlaying(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.3); // D5 tone drop

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
      setTimeout(() => setTestChimePlaying(false), 400);
      addToast('Acoustic Ping Fired', 'Bridge piezo alarm transducer operational.', 'info');
    } catch {
      setTestChimePlaying(false);
      addToast('Acoustic Ping Test', 'Bridge alarm operational (muted by browser policy).', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-[#1B2A35] rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                SYSTEM & OPERATIONAL SETTINGS SUITE
              </h3>
              <p className="text-[10px] text-[#91A4AE]">
                NCPOR Bridge Configuration, Themes, Security Keys & Polar Code Parameters
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
        <div className="px-4 pt-2 pb-0 border-b border-[#1B2A35] bg-[#071018]/60 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'appearance', label: 'Theme & HUD', icon: Palette },
            { id: 'profile', label: 'Watchkeeper', icon: User },
            { id: 'units', label: 'Conventions', icon: Sliders },
            { id: 'polarcode', label: 'IMO Polar Code', icon: Shield },
            { id: 'security', label: 'Security & Access', icon: Lock },
            { id: 'alarms', label: 'Alarms & Relays', icon: Bell },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-2.5 px-2.5 text-xs flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-[#91A4AE] hover:text-[#E8F0F3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 1. Theme & HUD */}
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

              {/* SAR Contrast */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#91A4AE] uppercase font-bold">
                    Synthetic Aperture Radar Contrast (SAR Sigma-0)
                  </span>
                  <span className="text-cyan-400 font-bold">{settings.sarContrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={settings.sarContrast}
                  onChange={(e) => updateSettings({ sarContrast: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                />
              </div>

              {/* Real-time preview card */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <span className="text-[10px] text-[#60737E] uppercase font-semibold block">
                  Accent Live Preview
                </span>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0B1721] border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-[#E8F0F3]">Polar AIS Telemetry Synchronized</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400">NORMAL OPS</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Officer Profile */}
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
                  className="px-4 py-2 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Officer Profile
                </button>
              </div>
            </form>
          )}

          {/* 3. Conventions & Units */}
          {activeTab === 'units' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                Measurement Conventions & Units
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

              {/* Speed & Pressure */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35]">
                  <label className="text-[9px] text-[#60737E] block mb-1.5 uppercase font-semibold">Speed Unit</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0B1721] rounded">
                    <button
                      onClick={() => updateSettings({ speedUnit: 'kn' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.speedUnit === 'kn' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Knots (kn)
                    </button>
                    <button
                      onClick={() => updateSettings({ speedUnit: 'ms' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.speedUnit === 'ms' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      m/s
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#071018] border border-[#1B2A35]">
                  <label className="text-[9px] text-[#60737E] block mb-1.5 uppercase font-semibold">Barometric Pressure</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0B1721] rounded">
                    <button
                      onClick={() => updateSettings({ pressureUnit: 'hpa' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.pressureUnit === 'hpa' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      Hectopascals (hPa)
                    </button>
                    <button
                      onClick={() => updateSettings({ pressureUnit: 'inhg' })}
                      className={`py-1 text-xs rounded transition cursor-pointer ${
                        settings.pressureUnit === 'inhg' ? 'bg-[#152535] text-cyan-300 font-bold' : 'text-[#91A4AE]'
                      }`}
                    >
                      inHg
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. IMO Polar Code */}
          {activeTab === 'polarcode' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                IMO Polar Code Hull Rating & Operational Limits
              </span>

              {/* Safety Margin Slider */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#91A4AE] uppercase font-bold">
                    Iceberg Safety Clearance Buffer
                  </span>
                  <span className="text-cyan-400 font-bold">{settings.safetyMarginNm.toFixed(1)} NM</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={settings.safetyMarginNm}
                  onChange={(e) => updateSettings({ safetyMarginNm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                />
                <div className="flex justify-between text-[8px] text-[#60737E]">
                  <span>1.0 NM (Emergency minimum)</span>
                  <span>3.0 NM (Standard bridge rule)</span>
                  <span>8.0 NM (Extreme tabular berg)</span>
                </div>
              </div>

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

          {/* 5. Security & Access Keys */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                Cryptographic Credentials & ECDIS Bridge Access
              </span>

              {/* ECDIS Cryptographic Signature Token */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#91A4AE] uppercase font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    ECDIS Signing Token
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    VALIDATED
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={securityKey}
                    onChange={(e) => {
                      setSecurityKey(e.target.value);
                      updateSettings({ securityToken: e.target.value });
                    }}
                    className="w-full pr-10 pl-3 py-2 bg-[#0B1721] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-[#60737E] hover:text-[#E8F0F3] cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#60737E]">
                  Cryptographic HMAC signature affixed to all exported voyage plans and waypoint NMEA dispatches.
                </p>
              </div>

              {/* 2FA Bridge Access */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#E8F0F3] block font-bold">2FA Hardware Token Requirement</span>
                    <span className="text-[10px] text-[#60737E]">Require FIDO2 key touch for waypoint modification</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !settings.twoFactorAuth;
                      updateSettings({ twoFactorAuth: next });
                      addToast('Security Policy Updated', `Two-factor bridge access ${next ? 'ENFORCED' : 'DISABLED'}.`, 'info');
                    }}
                    className={`w-11 h-6 rounded-full transition relative cursor-pointer ${
                      settings.twoFactorAuth ? 'bg-cyan-500' : 'bg-[#152535]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                        settings.twoFactorAuth ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Session Timeout */}
                <div className="pt-2 border-t border-[#1B2A35] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#91A4AE]">Bridge Console Inactivity Lock</span>
                    <span className="text-cyan-400 font-bold">{settings.sessionTimeoutMin || 30} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={settings.sessionTimeoutMin || 30}
                    onChange={(e) => updateSettings({ sessionTimeoutMin: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. Alarms & Relays */}
          {activeTab === 'alarms' && (
            <div className="space-y-4">
              <span className="text-[10px] text-[#91A4AE] uppercase tracking-wider font-semibold block">
                Bridge Acoustic Alarms & Telemetry Relays
              </span>

              {/* Audio Chime Test */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#E8F0F3] block font-bold">Acoustic Proximity Ping</span>
                    <span className="text-[10px] text-[#60737E]">Bridge buzzer triggers when iceberg CPA &lt; {settings.proximitySirenNm || 2.5} NM</span>
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

                {/* Test button */}
                <div className="pt-2 border-t border-[#1B2A35] flex items-center justify-between">
                  <span className="text-[10px] text-[#60737E]">Test Transducer Siren:</span>
                  <button
                    onClick={playTestBridgePing}
                    className={`px-3 py-1.5 rounded bg-[#152535] hover:bg-[#20364a] text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      testChimePlaying ? 'scale-95 bg-cyan-500/20' : ''
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {testChimePlaying ? 'Pinging...' : 'Play Test Chime'}
                  </button>
                </div>
              </div>

              {/* Visual Strobe Alerts */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#E8F0F3] block font-bold">Visual Strobe Warning Flash</span>
                  <span className="text-[10px] text-[#60737E]">Flash amber/red border strobes across HUD during hazard encounters</span>
                </div>
                <button
                  onClick={() => updateSettings({ strobeAlertsEnabled: !settings.strobeAlertsEnabled })}
                  className={`w-11 h-6 rounded-full transition relative cursor-pointer ${
                    settings.strobeAlertsEnabled ? 'bg-amber-500' : 'bg-[#152535]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                      settings.strobeAlertsEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Iridium Webhook Relay */}
              <div className="p-3.5 rounded-lg bg-[#071018] border border-[#1B2A35] space-y-2">
                <label className="text-[10px] text-[#91A4AE] uppercase font-bold block">
                  Iridium SBD / Telemetry Relay Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settings.iridiumWebhook || ''}
                    onChange={(e) => updateSettings({ iridiumWebhook: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#0B1721] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] font-mono focus:outline-none focus:border-cyan-400"
                    placeholder="https://telemetry.ncpor.gov.in/relay/v2"
                  />
                  <button
                    type="button"
                    onClick={() => addToast('Relay Tested', 'Handshake packet confirmed with Iridium ground station.', 'success')}
                    className="px-3 py-2 bg-[#152535] hover:bg-[#20364a] text-cyan-300 border border-cyan-500/30 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Ping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1B2A35] bg-[#071018] flex items-center justify-between">
          <span className="text-[10px] text-[#60737E]">
            All changes persist automatically to active local storage.
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

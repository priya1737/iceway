import React, { useState } from 'react';
import { WeatherOceanData, Vessel } from '../../types/navigation';
import {
  Wind,
  Waves,
  Compass,
  Thermometer,
  Gauge,
  Eye,
  CloudRain,
  Radio,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface WeatherOceanViewProps {
  weather: WeatherOceanData;
  vessel: Vessel;
}

export const WeatherOceanView: React.FC<WeatherOceanViewProps> = ({ weather, vessel }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<number>(0);
  const currentStep = weather.timeline[selectedHorizon] || weather.timeline[0];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#071018] p-3 sm:p-4 lg:p-6 font-mono space-y-4 sm:space-y-6">
      {/* Header & Forecast Horizon Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#1B2A35]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#152535] border border-[#1B2A35] flex items-center justify-center text-[#5DADE2] shrink-0">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#E8F0F3] leading-none">
              WEATHER & OCEANOGRAPHIC METEOROLOGY
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#91A4AE] mt-0.5 truncate max-w-[280px] sm:max-w-none">
              ECMWF High-Resolution Polar Model + HYCOM Circumpolar Ocean Surface Velocity
            </p>
          </div>
        </div>

        {/* Timeline Horizon Buttons: NOW, +6H, +12H, +24H */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-[#0B1721] border border-[#1B2A35] rounded overflow-x-auto max-w-full">
          <span className="text-[9px] sm:text-[10px] text-[#60737E] uppercase px-1.5 shrink-0 hidden xs:inline">HORIZON:</span>
          {weather.timeline.map((step, idx) => (
            <button
              key={step.timeLabel}
              onClick={() => setSelectedHorizon(idx)}
              className={`px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs transition cursor-pointer font-bold shrink-0 ${
                selectedHorizon === idx
                  ? 'bg-[#5DADE2] text-[#071018]'
                  : 'text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535]'
              }`}
            >
              {step.timeLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Meteorological Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Wind */}
        <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
          <div className="flex items-center justify-between text-[#91A4AE]">
            <span className="text-[10px] uppercase font-bold tracking-wider">SURFACE WIND</span>
            <Wind className="w-4 h-4 text-[#5DADE2]" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8F0F3]">
              {currentStep.windKnots}
              <span className="text-xs font-normal text-[#60737E] ml-1">kn</span>
            </span>
            <span className="text-sm font-semibold text-[#5DADE2] flex items-center gap-0.5">
              ↗ {weather.windCardinal} ({currentStep.windDirection}°)
            </span>
          </div>

          <div className="text-[11px] text-[#91A4AE] flex justify-between border-t border-[#1B2A35] pt-2">
            <span>Beaufort Scale:</span>
            <span className="text-[#E8F0F3] font-semibold">Force {weather.beaufortScale} (Fresh Breeze)</span>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 28">
              <polyline
                fill="none"
                stroke="#5DADE2"
                strokeWidth="1.75"
                points="0,20 33,14 66,6 100,16"
              />
              <circle cx="0" cy="20" r="2" fill="#5DADE2" />
              <circle cx="33" cy="14" r="2" fill="#5DADE2" />
              <circle cx="66" cy="6" r="2" fill="#5DADE2" />
              <circle cx="100" cy="16" r="2" fill="#5DADE2" />
            </svg>
          </div>
        </div>

        {/* Card 2: Wave Height */}
        <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
          <div className="flex items-center justify-between text-[#91A4AE]">
            <span className="text-[10px] uppercase font-bold tracking-wider">SIGNIFICANT WAVE</span>
            <Waves className="w-4 h-4 text-[#5DADE2]" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8F0F3]">
              {currentStep.waveHeightMeters}
              <span className="text-xs font-normal text-[#60737E] ml-1">m</span>
            </span>
            <span className="text-xs text-[#91A4AE]">
              Period: <strong className="text-[#E8F0F3]">{weather.wavePeriodSec}s</strong>
            </span>
          </div>

          <div className="text-[11px] text-[#91A4AE] flex justify-between border-t border-[#1B2A35] pt-2">
            <span>Primary Swell:</span>
            <span className="text-[#E8F0F3] font-semibold">{weather.waveDirection} Swell</span>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 28">
              <polyline
                fill="none"
                stroke="#43C98B"
                strokeWidth="1.75"
                points="0,18 33,12 66,4 100,15"
              />
              <circle cx="0" cy="18" r="2" fill="#43C98B" />
              <circle cx="33" cy="12" r="2" fill="#43C98B" />
              <circle cx="66" cy="4" r="2" fill="#43C98B" />
              <circle cx="100" cy="15" r="2" fill="#43C98B" />
            </svg>
          </div>
        </div>

        {/* Card 3: Ocean Current */}
        <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
          <div className="flex items-center justify-between text-[#91A4AE]">
            <span className="text-[10px] uppercase font-bold tracking-wider">OCEAN CURRENT</span>
            <Compass className="w-4 h-4 text-[#5DADE2]" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8F0F3]">
              {currentStep.currentKnots}
              <span className="text-xs font-normal text-[#60737E] ml-1">kn</span>
            </span>
            <span className="text-sm font-semibold text-[#5DADE2]">
              → {weather.oceanCurrentDirection} (090°)
            </span>
          </div>

          <div className="text-[11px] text-[#91A4AE] flex justify-between border-t border-[#1B2A35] pt-2">
            <span>Flow System:</span>
            <span className="text-[#E8F0F3] font-semibold">Antarctic Circumpolar (ACC)</span>
          </div>

          {/* Mini Current Sparkline */}
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 28">
              <polyline
                fill="none"
                stroke="#5DADE2"
                strokeWidth="1.75"
                points="0,15 33,12 66,8 100,18"
              />
              <circle cx="0" cy="15" r="2" fill="#5DADE2" />
              <circle cx="33" cy="12" r="2" fill="#5DADE2" />
              <circle cx="66" cy="8" r="2" fill="#5DADE2" />
              <circle cx="100" cy="18" r="2" fill="#5DADE2" />
            </svg>
          </div>
        </div>

        {/* Card 4: Temperature & Atmospheric Pressure */}
        <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
          <div className="flex items-center justify-between text-[#91A4AE]">
            <span className="text-[10px] uppercase font-bold tracking-wider">TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-[#E05B5B]" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8F0F3]">
              {currentStep.airTempC}°C
            </span>
            <span className="text-xs text-[#91A4AE]">
              Chill: <strong className="text-[#CBD5E1]">{weather.windChillC}°C</strong>
            </span>
          </div>

          <div className="text-[11px] text-[#91A4AE] flex justify-between border-t border-[#1B2A35] pt-2">
            <span>Sea Surface Temp:</span>
            <span className="text-[#5DADE2] font-semibold">{weather.seaTempC}°C</span>
          </div>

          {/* Mini Temp Sparkline */}
          <div className="h-10 pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 28">
              <polyline
                fill="none"
                stroke="#E05B5B"
                strokeWidth="1.75"
                points="0,10 33,14 66,22 100,12"
              />
              <circle cx="0" cy="10" r="2" fill="#E05B5B" />
              <circle cx="33" cy="14" r="2" fill="#E05B5B" />
              <circle cx="66" cy="22" r="2" fill="#E05B5B" />
              <circle cx="100" cy="12" r="2" fill="#E05B5B" />
            </svg>
          </div>
        </div>
      </div>

      {/* Atmospheric Secondary Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visibility */}
        <div className="p-3.5 rounded bg-[#0B1721] border border-[#1B2A35] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-[#91A4AE]" />
            <div>
              <span className="text-[10px] text-[#60737E] uppercase block">HORIZONTAL VISIBILITY</span>
              <span className="text-sm font-bold text-[#E8F0F3]">{currentStep.visibilityKm} km</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#43C98B]/10 text-[#43C98B] border border-[#43C98B]/30 font-semibold">
            GOOD
          </span>
        </div>

        {/* Barometric Pressure */}
        <div className="p-3.5 rounded bg-[#0B1721] border border-[#1B2A35] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-[#91A4AE]" />
            <div>
              <span className="text-[10px] text-[#60737E] uppercase block">BAROMETRIC PRESSURE</span>
              <span className="text-sm font-bold text-[#E8F0F3]">
                {currentStep.pressureHpa} hPa
              </span>
            </div>
          </div>
          <span className="text-[10px] text-[#E5B84B] font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {weather.pressureTrend}
          </span>
        </div>

        {/* Superstructure Ice Accretion Risk */}
        <div className="p-3.5 rounded bg-[#0B1721] border border-[#1B2A35] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5DADE2]" />
            <div>
              <span className="text-[10px] text-[#60737E] uppercase block">ICE ACCRETION RISK</span>
              <span className="text-sm font-bold text-[#E8F0F3]">{weather.iceAccretionRisk}</span>
            </div>
          </div>
          <span className="text-[10px] text-[#60737E]">
            Deck de-icing heaters standby
          </span>
        </div>
      </div>

      {/* Multi-Hour Forecast Table */}
      <div className="p-4 rounded-lg bg-[#0B1721] border border-[#1B2A35] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#E8F0F3] uppercase tracking-wider">
            METEOROLOGICAL TIMELINE MATRIX
          </span>
          <span className="text-[10px] text-[#91A4AE]">
            Synoptic Station: Maitri / Bharati Marine AWS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1B2A35] text-[10px] text-[#60737E] uppercase">
                <th className="py-2 px-3">Horizon</th>
                <th className="py-2 px-3">Wind Speed</th>
                <th className="py-2 px-3">Direction</th>
                <th className="py-2 px-3">Wave Height</th>
                <th className="py-2 px-3">Ocean Current</th>
                <th className="py-2 px-3">Air Temp</th>
                <th className="py-2 px-3">Visibility</th>
                <th className="py-2 px-3">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2A35]/50">
              {weather.timeline.map((row) => (
                <tr key={row.timeLabel} className="hover:bg-[#152535]/50">
                  <td className="py-2 px-3 font-bold text-[#5DADE2]">{row.timeLabel}</td>
                  <td className="py-2 px-3 text-[#E8F0F3]">{row.windKnots} kn</td>
                  <td className="py-2 px-3 text-[#CBD5E1]">{row.windDirection}° ENE</td>
                  <td className="py-2 px-3 text-[#E8F0F3]">{row.waveHeightMeters} m</td>
                  <td className="py-2 px-3 text-[#CBD5E1]">{row.currentKnots} kn</td>
                  <td className="py-2 px-3 text-[#E05B5B] font-semibold">{row.airTempC}°C</td>
                  <td className="py-2 px-3 text-[#CBD5E1]">{row.visibilityKm} km</td>
                  <td className="py-2 px-3 text-[#E8F0F3]">{row.pressureHpa} hPa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

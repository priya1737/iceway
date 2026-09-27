import React from 'react';
import {
  Layers,
  Wind,
  Waves,
  Eye,
  Compass,
  Thermometer,
  Gauge,
  Snowflake,
  TrendingUp,
} from 'lucide-react';
import { WeatherOceanData, SeaIceData } from '../../types/navigation';

interface EnvironmentStripProps {
  weather: WeatherOceanData;
  seaIce: SeaIceData;
  onOpenWeatherTab: () => void;
  onOpenSeaIceTab: () => void;
}

export const EnvironmentStrip: React.FC<EnvironmentStripProps> = ({
  weather,
  seaIce,
  onOpenWeatherTab,
  onOpenSeaIceTab,
}) => {
  return (
    <div className="h-14 border-t border-[#1B2A35] bg-[#071018] px-4 flex items-center justify-between select-none z-10 shrink-0 font-mono overflow-x-auto">
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <span className="text-[10px] text-[#60737E] uppercase tracking-wider font-semibold">
          CURRENT CONDITIONS
        </span>
        <div className="h-3 w-px bg-[#1B2A35]" />
      </div>

      <div className="flex items-center gap-4 lg:gap-8 text-xs shrink-0">
        {/* Sea Ice Concentration */}
        <button
          onClick={onOpenSeaIceTab}
          className="flex items-center gap-2 hover:bg-[#0B1721] px-2 py-1 rounded transition cursor-pointer text-left group"
          title="Click to open Sea Ice forecast details"
        >
          <Layers className="w-3.5 h-3.5 text-[#5DADE2] group-hover:scale-110 transition-transform" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Sea Ice</span>
            <span className="text-[#E8F0F3] font-semibold flex items-center gap-1 mt-0.5">
              {seaIce.currentConcentrationPct}%
              <span className="text-[9px] text-[#E5B84B] font-normal">
                (↗ {seaIce.trend})
              </span>
            </span>
          </div>
        </button>

        {/* Wind */}
        <button
          onClick={onOpenWeatherTab}
          className="flex items-center gap-2 hover:bg-[#0B1721] px-2 py-1 rounded transition cursor-pointer text-left group"
          title="Surface wind speed and direction"
        >
          <Wind className="w-3.5 h-3.5 text-[#91A4AE] group-hover:scale-110 transition-transform" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Wind</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.windKnots} kn{' '}
              <span className="text-[10px] text-[#91A4AE] font-normal">
                ↗ {weather.windCardinal}
              </span>
            </span>
          </div>
        </button>

        {/* Wave Height */}
        <button
          onClick={onOpenWeatherTab}
          className="flex items-center gap-2 hover:bg-[#0B1721] px-2 py-1 rounded transition cursor-pointer text-left group"
          title="Significant wave height"
        >
          <Waves className="w-3.5 h-3.5 text-[#5DADE2] group-hover:scale-110 transition-transform" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Wave Height</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.waveHeightMeters} m
              <span className="text-[10px] text-[#60737E] font-normal ml-1">
                ({weather.wavePeriodSec}s)
              </span>
            </span>
          </div>
        </button>

        {/* Visibility */}
        <div className="flex items-center gap-2 px-2 py-1">
          <Eye className="w-3.5 h-3.5 text-[#91A4AE]" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Visibility</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.visibilityKm} km
            </span>
          </div>
        </div>

        {/* Ocean Current */}
        <div className="flex items-center gap-2 px-2 py-1">
          <Compass className="w-3.5 h-3.5 text-[#5DADE2]" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Ocean Current</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.oceanCurrentKnots} kn{' '}
              <span className="text-[10px] text-[#91A4AE] font-normal">
                → {weather.oceanCurrentDirection}
              </span>
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-2 px-2 py-1">
          <Thermometer className="w-3.5 h-3.5 text-[#E05B5B]" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Temperature</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.airTempC}°C
              <span className="text-[10px] text-[#60737E] font-normal ml-1">
                (SST {weather.seaTempC}°C)
              </span>
            </span>
          </div>
        </div>

        {/* Barometric Pressure */}
        <div className="hidden 2xl:flex items-center gap-2 px-2 py-1">
          <Gauge className="w-3.5 h-3.5 text-[#91A4AE]" />
          <div>
            <span className="text-[10px] text-[#60737E] block leading-none">Pressure</span>
            <span className="text-[#E8F0F3] font-semibold mt-0.5 block">
              {weather.pressureHpa} hPa
              <span className="text-[9px] text-[#E5B84B] ml-1">
                ({weather.pressureTrend})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

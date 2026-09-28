import { WeatherObservationPoint, OceanCurrentPoint } from '../types/dataModels';

export const HISTORICAL_WEATHER_OBSERVATIONS: WeatherObservationPoint[] = [
  {
    lat: -64.8,
    lon: 63.0,
    windSpeedKnots: 22.4,
    windDirectionDeg: 125, // ESE
    airTempC: -2.8,
    seaSurfaceTempC: -1.2,
    surfacePressureHpa: 986.2,
    waveHeightMeters: 2.4,
    wavePeriodSec: 7.2,
    waveDirectionDeg: 130,
    visibilityKm: 18.0,
    icingRisk: 'LIGHT',
    timestamp: '2026-03-24T06:00:00Z',
    source: 'ECMWF IFS / RV Sagar Anemometer',
  },
  {
    lat: -66.5,
    lon: 66.8,
    windSpeedKnots: 28.6,
    windDirectionDeg: 110, // ESE
    airTempC: -5.4,
    seaSurfaceTempC: -1.6,
    surfacePressureHpa: 982.5,
    waveHeightMeters: 1.8,
    wavePeriodSec: 6.5,
    waveDirectionDeg: 115,
    visibilityKm: 12.0,
    icingRisk: 'MODERATE',
    timestamp: '2026-03-24T06:00:00Z',
    source: 'ECMWF IFS Analysis',
  },
  {
    lat: -67.5,
    lon: 71.0,
    windSpeedKnots: 34.0,
    windDirectionDeg: 95, // E
    airTempC: -8.2,
    seaSurfaceTempC: -1.8,
    surfacePressureHpa: 978.4,
    waveHeightMeters: 1.2,
    wavePeriodSec: 5.8,
    waveDirectionDeg: 100,
    visibilityKm: 8.5,
    icingRisk: 'SEVERE',
    timestamp: '2026-03-24T06:00:00Z',
    source: 'ECMWF IFS Analysis',
  },
  {
    lat: -69.4,
    lon: 76.2,
    windSpeedKnots: 26.5,
    windDirectionDeg: 80, // ENE Katabatic
    airTempC: -12.1,
    seaSurfaceTempC: -1.9,
    surfacePressureHpa: 981.0,
    waveHeightMeters: 0.6,
    wavePeriodSec: 4.2,
    waveDirectionDeg: 85,
    visibilityKm: 22.0,
    icingRisk: 'MODERATE',
    timestamp: '2026-03-24T06:00:00Z',
    source: 'Bharati Met Station (AWS-01)',
  },
];

export const HISTORICAL_OCEAN_CURRENTS: OceanCurrentPoint[] = [
  {
    lat: -64.8,
    lon: 63.0,
    speedKnots: 0.65,
    directionDeg: 78, // Eastward Antarctic Circumpolar Current northern margin
    depthMeters: 15,
    temperatureC: -1.1,
    timestamp: '2026-03-24T00:00:00Z',
    source: 'HYCOM GLBv0.08',
  },
  {
    lat: -66.4,
    lon: 66.8,
    speedKnots: 0.58,
    directionDeg: 225, // Southwestward coastal branch
    depthMeters: 25,
    temperatureC: -1.5,
    timestamp: '2026-03-24T00:00:00Z',
    source: 'HYCOM GLBv0.08',
  },
  {
    lat: -67.5,
    lon: 71.0,
    speedKnots: 0.48,
    directionDeg: 235, // Southwestward along continental slope
    depthMeters: 30,
    temperatureC: -1.7,
    timestamp: '2026-03-24T00:00:00Z',
    source: 'HYCOM GLBv0.08',
  },
  {
    lat: -69.4,
    lon: 76.2,
    speedKnots: 0.32,
    directionDeg: 260, // Westward Antarctic Coastal Current (East Wind Drift)
    depthMeters: 20,
    temperatureC: -1.8,
    timestamp: '2026-03-24T00:00:00Z',
    source: 'HYCOM GLBv0.08 / ADCP Mooring',
  },
];

/**
 * Interpolates wind vector at any coordinate
 */
export function getInterpolatedWind(lat: number, lon: number): { speedKnots: number; directionDeg: number; airTempC: number } {
  // Simple spatial inverse distance weighting
  let totalWeight = 0;
  let speedSum = 0;
  let tempSum = 0;
  let uSum = 0;
  let vSum = 0;

  for (const obs of HISTORICAL_WEATHER_OBSERVATIONS) {
    const d = Math.max(0.2, Math.hypot(lat - obs.lat, (lon - obs.lon) * Math.cos((lat * Math.PI) / 180)));
    const w = 1 / (d * d);
    totalWeight += w;
    speedSum += obs.windSpeedKnots * w;
    tempSum += obs.airTempC * w;

    const rad = (obs.windDirectionDeg * Math.PI) / 180;
    uSum += Math.sin(rad) * w;
    vSum += Math.cos(rad) * w;
  }

  const avgSpeed = speedSum / totalWeight;
  const avgTemp = tempSum / totalWeight;
  let avgDir = (Math.atan2(uSum, vSum) * 180) / Math.PI;
  if (avgDir < 0) avgDir += 360;

  return {
    speedKnots: Number(avgSpeed.toFixed(1)),
    directionDeg: Number(avgDir.toFixed(0)),
    airTempC: Number(avgTemp.toFixed(1)),
  };
}

/**
 * Interpolates ocean current vector at any coordinate
 */
export function getInterpolatedCurrent(lat: number, lon: number): { speedKnots: number; directionDeg: number } {
  let totalWeight = 0;
  let speedSum = 0;
  let uSum = 0;
  let vSum = 0;

  for (const obs of HISTORICAL_OCEAN_CURRENTS) {
    const d = Math.max(0.2, Math.hypot(lat - obs.lat, (lon - obs.lon) * Math.cos((lat * Math.PI) / 180)));
    const w = 1 / (d * d);
    totalWeight += w;
    speedSum += obs.speedKnots * w;

    const rad = (obs.directionDeg * Math.PI) / 180;
    uSum += Math.sin(rad) * w;
    vSum += Math.cos(rad) * w;
  }

  const avgSpeed = speedSum / totalWeight;
  let avgDir = (Math.atan2(uSum, vSum) * 180) / Math.PI;
  if (avgDir < 0) avgDir += 360;

  return {
    speedKnots: Number(avgSpeed.toFixed(2)),
    directionDeg: Number(avgDir.toFixed(0)),
  };
}

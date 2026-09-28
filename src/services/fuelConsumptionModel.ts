import { Vessel, LatLon } from '../types/navigation';
import { seaIceForecastEngine } from './seaIceForecastEngine';
import { calculateDistanceKm } from '../utils/geoProjection';

export interface FuelConsumptionBreakdown {
  totalFuelTons: number;
  baseHydrodynamicTons: number;
  iceResistancePenaltyTons: number;
  waveAddedResistanceTons: number;
  averageBurnRateTonsPerDay: number;
}

/**
 * Vessel Fuel Consumption Model based on Admiralty Coefficient
 * and Lindqvist (1989) / Kashteljan ice resistance formulations for polar research vessels.
 */
export class FuelConsumptionModel {
  /**
   * Calculates fuel consumption for a vessel navigating along a path of coordinates
   */
  public calculateRouteFuel(
    path: LatLon[],
    vessel: Vessel,
    speedKnots: number = vessel.speedKnots || 12.0,
    tHours: number = 0
  ): FuelConsumptionBreakdown {
    if (path.length < 2) {
      return {
        totalFuelTons: 0,
        baseHydrodynamicTons: 0,
        iceResistancePenaltyTons: 0,
        waveAddedResistanceTons: 0,
        averageBurnRateTonsPerDay: 0,
      };
    }

    // Base open-water consumption for a ~104m Polar Class 5 vessel (e.g., 2 x 4500 kW diesel-electric)
    // At 12 knots cruising speed: ~18.5 tons MGO per 24 hours in calm open water
    // Specific fuel consumption rate: ~0.064 tons MGO per nautical mile
    const baseTonsPerKm = 0.0346; // ~0.064 tons / NM

    let totalDistanceKm = 0;
    let baseFuelSum = 0;
    let icePenaltySum = 0;
    let wavePenaltySum = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const segDistKm = calculateDistanceKm(p1, p2);
      totalDistanceKm += segDistKm;

      // Base hydrodynamic burn
      const segBaseFuel = segDistKm * baseTonsPerKm * Math.pow(speedKnots / 12.0, 2.2);
      baseFuelSum += segBaseFuel;

      // Midpoint sampling for environmental resistance
      const midLat = (p1.lat + p2.lat) / 2;
      const midLon = (p1.lon + p2.lon) / 2;

      // 1. Sea Ice Resistance (Lindqvist model approximation)
      // Crushing and bending resistance grows with concentration and thickness^1.5
      const iceSample = seaIceForecastEngine.sampleConcentrationAt(midLat, midLon, tHours);
      if (iceSample.concentrationPct > 5) {
        const iceConcFraction = iceSample.concentrationPct / 100;
        const thicknessFactor = Math.pow(Math.max(0.2, iceSample.thicknessMeters), 1.4);
        // Additional engine load factor in ice (can double or triple fuel burn in heavy pack)
        const iceResistanceLoad = 1.85 * iceConcFraction * thicknessFactor;
        const segIcePenalty = segBaseFuel * iceResistanceLoad;
        icePenaltySum += segIcePenalty;
      }

      // 2. Wave Added Resistance (significant in northern open Southern Ocean swells)
      if (midLat > -66.0) {
        // Southern Ocean westerly swell region
        const wavePenaltyFactor = 0.14; // ~14% added resistance
        wavePenaltySum += segBaseFuel * wavePenaltyFactor;
      }
    }

    const totalFuelTons = Number((baseFuelSum + icePenaltySum + wavePenaltySum).toFixed(1));
    const totalVoyageHours = totalDistanceKm / (speedKnots * 1.852);
    const avgBurnRatePerDay = Number(((totalFuelTons / Math.max(1, totalVoyageHours)) * 24).toFixed(1));

    return {
      totalFuelTons,
      baseHydrodynamicTons: Number(baseFuelSum.toFixed(1)),
      iceResistancePenaltyTons: Number(icePenaltySum.toFixed(1)),
      waveAddedResistanceTons: Number(wavePenaltySum.toFixed(1)),
      averageBurnRateTonsPerDay: avgBurnRatePerDay,
    };
  }
}

export const fuelConsumptionModel = new FuelConsumptionModel();

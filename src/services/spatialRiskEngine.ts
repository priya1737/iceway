import { RouteOption, Vessel, LatLon } from '../types/navigation';
import {
  IcebergObservation,
  SeaIceSpatialField,
  SpatialRiskField,
  SpatialRiskCell,
  SpatialRiskFactorBreakdown,
} from '../types/dataModels';
import { calculateDistanceKm, kmToNauticalMiles } from '../utils/geoProjection';
import { seaIceForecastEngine } from './seaIceForecastEngine';
import { getInterpolatedWind } from '../data/historicalEnvironment';
import { DATASET_METADATA_REGISTRY } from '../data/datasetMetadata';

export interface RiskWeights {
  seaIce: number;
  iceberg: number;
  weather: number;
  waves: number;
  visibility: number;
  vesselConstraint: number;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  seaIce: 0.35,
  iceberg: 0.30,
  weather: 0.15,
  waves: 0.10,
  visibility: 0.10,
  vesselConstraint: 0.10,
};

export interface RouteRiskEvaluation {
  overallRiskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'CAUTION' | 'HIGH';
  factorBreakdown: SpatialRiskFactorBreakdown;
  primaryRiskFactor: string;
  explanationStatements: string[];
}

export class SpatialRiskEngine {
  private weights: RiskWeights;

  constructor(weights: RiskWeights = DEFAULT_RISK_WEIGHTS) {
    this.weights = weights;
  }

  public setWeights(newWeights: Partial<RiskWeights>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Calculates point risk at a single coordinate
   */
  public evaluatePointRisk(
    lat: number,
    lon: number,
    icebergs: IcebergObservation[],
    vessel: Vessel,
    tHours: number = 0
  ): {
    totalRisk: number;
    rawFactors: {
      seaIce: number;
      iceberg: number;
      weather: number;
      waves: number;
      visibility: number;
    };
    percentages: SpatialRiskFactorBreakdown;
  } {
    // 1. Sea Ice Risk: Concentration and thickness
    const iceSample = seaIceForecastEngine.sampleConcentrationAt(lat, lon, tHours);
    // PC5 hull can handle up to ~40% comfortably; above 70% is severe
    let seaIceRaw = Math.min(100, Math.pow(iceSample.concentrationPct / 75, 1.4) * 100);
    if (iceSample.compressionMpa > 1.0) {
      seaIceRaw = Math.min(100, seaIceRaw * (1 + (iceSample.compressionMpa - 1.0) * 0.4));
    }

    // 2. Iceberg Proximity Risk: Distance to nearest known iceberg
    let minIcebergDistNm = Infinity;
    for (const berg of icebergs) {
      const distKm = calculateDistanceKm({ lat, lon }, { lat: berg.lat, lon: berg.lon });
      const distNm = kmToNauticalMiles(distKm);
      if (distNm < minIcebergDistNm) minIcebergDistNm = distNm;
    }
    // High risk if within 3 NM, moderate within 10 NM
    let icebergRaw = 0;
    if (minIcebergDistNm <= vessel.safetyClearanceNm) {
      icebergRaw = 100;
    } else if (minIcebergDistNm < 15) {
      icebergRaw = Math.max(0, 100 * (1 - (minIcebergDistNm - vessel.safetyClearanceNm) / (15 - vessel.safetyClearanceNm)));
    }

    // 3. Weather (Wind speed and air temperature)
    const wind = getInterpolatedWind(lat, lon);
    const windRaw = Math.min(100, Math.max(0, (wind.speedKnots / 45) * 100));

    // 4. Wave risk (Katabatic suppression near coast, swells in open water)
    const waveHeightEstimate = lat > -66 ? 2.5 : 1.0;
    const waveRaw = Math.min(100, (waveHeightEstimate / 4.0) * 100);

    // 5. Visibility risk (Blizzard / snow / fog in polar conditions)
    const visibilityKm = wind.speedKnots > 30 ? 6.0 : 18.0;
    const visibilityRaw = Math.min(100, Math.max(0, ((20 - visibilityKm) / 20) * 100));

    // Weighted risk
    const weightedSeaIce = seaIceRaw * this.weights.seaIce;
    const weightedIceberg = icebergRaw * this.weights.iceberg;
    const weightedWeather = windRaw * this.weights.weather;
    const weightedWave = waveRaw * this.weights.waves;
    const weightedVisibility = visibilityRaw * this.weights.visibility;

    const sumWeighted =
      weightedSeaIce + weightedIceberg + weightedWeather + weightedWave + weightedVisibility;

    const totalWeight =
      this.weights.seaIce +
      this.weights.iceberg +
      this.weights.weather +
      this.weights.waves +
      this.weights.visibility;

    const totalRisk = Number(Math.min(100, sumWeighted / totalWeight).toFixed(1));

    // Percentage contribution breakdown (sums to 100%)
    let pctIceberg = 0;
    let pctIce = 0;
    let pctWave = 0;
    let pctWind = 0;
    let pctVis = 0;

    if (sumWeighted > 0) {
      pctIceberg = Math.round((weightedIceberg / sumWeighted) * 100);
      pctIce = Math.round((weightedSeaIce / sumWeighted) * 100);
      pctWave = Math.round((weightedWave / sumWeighted) * 100);
      pctWind = Math.round((weightedWeather / sumWeighted) * 100);
      pctVis = Math.max(0, 100 - (pctIceberg + pctIce + pctWave + pctWind));
    } else {
      pctIce = 40;
      pctIceberg = 30;
      pctWind = 15;
      pctWave = 10;
      pctVis = 5;
    }

    return {
      totalRisk,
      rawFactors: {
        seaIce: seaIceRaw,
        iceberg: icebergRaw,
        weather: windRaw,
        waves: waveRaw,
        visibility: visibilityRaw,
      },
      percentages: {
        icebergExposurePct: pctIceberg,
        seaIceConcentrationPct: pctIce,
        waveConditionsPct: pctWave,
        windForcingPct: pctWind,
        visibilityPenaltyPct: pctVis,
      },
    };
  }

  /**
   * Evaluates overall risk along an entire polyline route
   */
  public evaluateRouteRisk(
    route: RouteOption,
    icebergs: IcebergObservation[],
    vessel: Vessel,
    tHours: number = 0
  ): RouteRiskEvaluation {
    const coords = route.pathCoordinates;
    if (coords.length === 0) {
      return {
        overallRiskScore: 0,
        riskLevel: 'LOW',
        factorBreakdown: {
          icebergExposurePct: 0,
          seaIceConcentrationPct: 0,
          waveConditionsPct: 0,
          windForcingPct: 0,
          visibilityPenaltyPct: 0,
        },
        primaryRiskFactor: 'None',
        explanationStatements: ['Route path has no defined coordinates.'],
      };
    }

    // Sample along the route at regular intervals (approx 10-15 sample points)
    let maxPointRisk = 0;
    let totalRiskSum = 0;
    let sumIcebergPct = 0;
    let sumSeaIcePct = 0;
    let sumWavePct = 0;
    let sumWindPct = 0;
    let sumVisPct = 0;

    for (let i = 0; i < coords.length; i++) {
      const pt = coords[i];
      const evalPoint = this.evaluatePointRisk(pt.lat, pt.lon, icebergs, vessel, tHours);
      totalRiskSum += evalPoint.totalRisk;
      if (evalPoint.totalRisk > maxPointRisk) maxPointRisk = evalPoint.totalRisk;

      sumIcebergPct += evalPoint.percentages.icebergExposurePct;
      sumSeaIcePct += evalPoint.percentages.seaIceConcentrationPct;
      sumWavePct += evalPoint.percentages.waveConditionsPct;
      sumWindPct += evalPoint.percentages.windForcingPct;
      sumVisPct += evalPoint.percentages.visibilityPenaltyPct;
    }

    const n = coords.length;
    // Composite: 60% mean risk + 40% peak hazard risk
    const compositeRisk = Math.min(100, (totalRiskSum / n) * 0.6 + maxPointRisk * 0.4);
    const overallRiskScore = Math.round(compositeRisk);

    const breakdown: SpatialRiskFactorBreakdown = {
      icebergExposurePct: Math.round(sumIcebergPct / n),
      seaIceConcentrationPct: Math.round(sumSeaIcePct / n),
      waveConditionsPct: Math.round(sumWavePct / n),
      windForcingPct: Math.round(sumWindPct / n),
      visibilityPenaltyPct: Math.round(sumVisPct / n),
    };

    // Ensure sums to 100%
    const currentSum =
      breakdown.icebergExposurePct +
      breakdown.seaIceConcentrationPct +
      breakdown.waveConditionsPct +
      breakdown.windForcingPct +
      breakdown.visibilityPenaltyPct;
    if (currentSum !== 100 && currentSum > 0) {
      breakdown.seaIceConcentrationPct += 100 - currentSum;
    }

    let riskLevel: 'LOW' | 'CAUTION' | 'HIGH' = 'LOW';
    if (overallRiskScore >= 45) {
      riskLevel = 'HIGH';
    } else if (overallRiskScore >= 20) {
      riskLevel = 'CAUTION';
    }

    // Determine primary factor
    const factors = [
      { name: 'Iceberg exposure', val: breakdown.icebergExposurePct },
      { name: 'Sea-ice concentration', val: breakdown.seaIceConcentrationPct },
      { name: 'Wave conditions', val: breakdown.waveConditionsPct },
      { name: 'Wind forcing', val: breakdown.windForcingPct },
      { name: 'Visibility restriction', val: breakdown.visibilityPenaltyPct },
    ].sort((a, b) => b.val - a.val);

    const primaryRiskFactor = factors[0].name;

    // Generate factual explanation statements
    const explanationStatements: string[] = [];
    if (breakdown.icebergExposurePct >= 30) {
      explanationStatements.push(
        `Route traverses radar-tracked iceberg drift corridor (${breakdown.icebergExposurePct}% risk contribution).`
      );
    }
    if (breakdown.seaIceConcentrationPct >= 25) {
      explanationStatements.push(
        `Passage intersects pack ice fields requiring continuous hull icebreaker resistance (${breakdown.seaIceConcentrationPct}% contribution).`
      );
    }
    if (breakdown.windForcingPct >= 15) {
      explanationStatements.push(
        `Katabatic crosswinds exceed 25 knots across Prydz Bay approach.`
      );
    }
    if (explanationStatements.length === 0) {
      explanationStatements.push(
        'Route maintains adequate safety buffers outside major hazard cones.'
      );
    }

    return {
      overallRiskScore,
      riskLevel,
      factorBreakdown: breakdown,
      primaryRiskFactor,
      explanationStatements,
    };
  }

  /**
   * Generates a 2D spatial risk field for visualization
   */
  public generateSpatialRiskField(
    icebergs: IcebergObservation[],
    vessel: Vessel,
    tHours: number = 0
  ): SpatialRiskField {
    const cells: SpatialRiskCell[] = [];
    let sumRisk = 0;
    let maxRisk = 0;

    for (let lat = -63.0; lat >= -70.0; lat -= 0.5) {
      for (let lon = 60.0; lon <= 78.0; lon += 1.0) {
        const evalPt = this.evaluatePointRisk(lat, lon, icebergs, vessel, tHours);
        sumRisk += evalPt.totalRisk;
        if (evalPt.totalRisk > maxRisk) maxRisk = evalPt.totalRisk;

        cells.push({
          lat,
          lon,
          overallRisk: evalPt.totalRisk,
          seaIceRisk: evalPt.rawFactors.seaIce,
          icebergRisk: evalPt.rawFactors.iceberg,
          weatherRisk: evalPt.rawFactors.weather,
          waveRisk: evalPt.rawFactors.waves,
          visibilityRisk: evalPt.rawFactors.visibility,
          factorBreakdown: evalPt.percentages,
        });
      }
    }

    return {
      metadata: DATASET_METADATA_REGISTRY.simulationScenario,
      weights: this.weights,
      cells,
      averageRisk: Number((sumRisk / cells.length).toFixed(1)),
      maxRisk: Number(maxRisk.toFixed(1)),
    };
  }
}

export const spatialRiskEngine = new SpatialRiskEngine();

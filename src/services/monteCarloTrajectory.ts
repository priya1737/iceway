import { IcebergObservation, IcebergTrajectoryEnsemble, TrajectoryMonteCarloSample } from '../types/dataModels';
import { icebergDriftModel } from './icebergDriftModel';

/**
 * Deterministic Mulberry32 Pseudo-Random Number Generator
 * Allows perfectly repeatable Monte Carlo runs for any chosen integer seed
 */
class DeterministicPRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  // Returns pseudo-random float [0, 1)
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns standard normally distributed random number ~ N(0, 1) via Box-Muller transform
  public nextGaussian(): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

export class MonteCarloTrajectoryEngine {
  /**
   * Runs N stochastic trajectory simulations for an iceberg observation.
   * Perturbs initial position, wind velocity, and ocean currents using realistic standard deviations.
   */
  public generateEnsemble(
    iceberg: IcebergObservation,
    samplesCount: number = 200,
    seed: number = 1042
  ): IcebergTrajectoryEnsemble {
    const prng = new DeterministicPRNG(seed);
    const horizonHours = [0, 6, 12, 24, 48];
    const samples: TrajectoryMonteCarloSample[] = [];

    // Run Monte Carlo iterations
    for (let s = 0; s < samplesCount; s++) {
      // Perturbations for this run:
      // Initial position uncertainty: sigma = 300m
      const posErrorLat = (prng.nextGaussian() * 300) / 111139;
      const posErrorLon = (prng.nextGaussian() * 300) / (111139 * Math.cos((iceberg.lat * Math.PI) / 180));

      // Drag and hydrodynamic perturbations:
      // Freeboard uncertainty +/- 15%, Draft uncertainty +/- 10%
      const freeboardFactor = 1.0 + prng.nextGaussian() * 0.12;
      const draftFactor = 1.0 + prng.nextGaussian() * 0.08;

      const perturbedIceberg: IcebergObservation = {
        ...iceberg,
        lat: iceberg.lat + posErrorLat,
        lon: iceberg.lon + posErrorLon,
        freeboardMeters: Math.max(10, iceberg.freeboardMeters * freeboardFactor),
        draftMeters: Math.max(50, iceberg.draftMeters * draftFactor),
      };

      const trajectory = icebergDriftModel.propagateTrajectory(perturbedIceberg, 48, 2);
      const coords = trajectory.map((step) => ({
        tHours: step.tHours,
        lat: step.lat,
        lon: step.lon,
      }));

      samples.push({
        sampleId: s,
        coordinates: coords,
      });
    }

    // Compute mean trajectory & 80% confidence ellipses
    const meanTrajectory: IcebergTrajectoryEnsemble['meanTrajectory'] = [];
    const confidenceEllipses: IcebergTrajectoryEnsemble['confidenceEllipses80Pct'] = [];

    for (const t of horizonHours) {
      const pointsAtT = samples.map((s) => {
        const found = s.coordinates.find((c) => c.tHours === t) || s.coordinates[s.coordinates.length - 1];
        return { lat: found.lat, lon: found.lon };
      });

      // Mean center
      const meanLat = pointsAtT.reduce((sum, p) => sum + p.lat, 0) / pointsAtT.length;
      const meanLon = pointsAtT.reduce((sum, p) => sum + p.lon, 0) / pointsAtT.length;

      // Variance in local metric coordinates (km)
      const cosLat = Math.cos((meanLat * Math.PI) / 180);
      const metricOffsets = pointsAtT.map((p) => ({
        dyKm: (p.lat - meanLat) * 111.139,
        dxKm: (p.lon - meanLon) * 111.139 * cosLat,
      }));

      // Covariance matrix
      let varX = 0;
      let varY = 0;
      let covXY = 0;
      for (const offset of metricOffsets) {
        varX += offset.dxKm * offset.dxKm;
        varY += offset.dyKm * offset.dyKm;
        covXY += offset.dxKm * offset.dyKm;
      }
      varX /= metricOffsets.length;
      varY /= metricOffsets.length;
      covXY /= metricOffsets.length;

      // Eigenvalues of 2x2 covariance matrix to find major & minor axes
      const trace = varX + varY;
      const det = varX * varY - covXY * covXY;
      const lambda1 = Math.max(0.01, trace / 2 + Math.sqrt(Math.max(0, (trace * trace) / 4 - det)));
      const lambda2 = Math.max(0.01, trace / 2 - Math.sqrt(Math.max(0, (trace * trace) / 4 - det)));

      // 80% confidence scaling factor for chi-square (2 DOF): s = sqrt(3.219) ~ 1.794
      const scale80Pct = 1.794;
      const semiMajorKm = Number((Math.sqrt(lambda1) * scale80Pct).toFixed(2));
      const semiMinorKm = Number((Math.sqrt(lambda2) * scale80Pct).toFixed(2));

      // Orientation angle of major axis
      let orientationDeg = 0;
      if (Math.abs(covXY) > 1e-5) {
        orientationDeg = (0.5 * Math.atan2(2 * covXY, varX - varY) * 180) / Math.PI;
      }

      meanTrajectory.push({
        tHours: t,
        lat: Number(meanLat.toFixed(4)),
        lon: Number(meanLon.toFixed(4)),
        driftSpeedKnots: iceberg.observedVelocityKnots,
        driftHeadingDeg: iceberg.observedHeadingDeg,
      });

      confidenceEllipses.push({
        tHours: t,
        centerLat: Number(meanLat.toFixed(4)),
        centerLon: Number(meanLon.toFixed(4)),
        semiMajorAxisKm: Math.max(0.5, semiMajorKm),
        semiMinorAxisKm: Math.max(0.3, semiMinorKm),
        orientationDeg: Number(orientationDeg.toFixed(1)),
      });
    }

    return {
      icebergId: iceberg.id,
      timestamp: iceberg.timestamp,
      meanTrajectory,
      confidenceEllipses80Pct: confidenceEllipses,
      samplesCount,
      monteCarloSamples: samples.slice(0, 40), // Store first 40 representative traces for UI rendering
    };
  }
}

export const monteCarloTrajectoryEngine = new MonteCarloTrajectoryEngine();

import { IcebergObservation } from '../types/dataModels';
import { getInterpolatedWind, getInterpolatedCurrent } from '../data/historicalEnvironment';

export interface DriftVector {
  uMs: number; // Eastward velocity m/s
  vMs: number; // Northward velocity m/s
  speedKnots: number;
  headingDeg: number;
}

export interface CalculatedTrajectoryStep {
  tHours: number;
  timeLabel: string;
  lat: number;
  lon: number;
  driftSpeedKnots: number;
  driftHeadingDeg: number;
  uncertaintyRadiusKm: number;
  confidencePct: number;
}

/**
 * Standard atmospheric and oceanographic physical constants
 */
const RHO_AIR = 1.30; // kg/m^3 in cold polar air
const RHO_WATER = 1028; // kg/m^3 cold Antarctic seawater
const CD_AIR = 1.3; // Form drag coefficient for tabular/irregular ice
const CD_WATER = 0.9; // Skin and form drag underwater
const OMEGA = 7.2921e-5; // Earth rotation rad/s

/**
 * Iceberg Drift Physics Model (Coupled Momentum Balance)
 */
export class IcebergDriftModel {
  /**
   * Computes steady-state drift velocity for an iceberg at (lat, lon)
   * under atmospheric and ocean current forcing with Coriolis deflection.
   */
  public computeDriftVelocity(
    iceberg: IcebergObservation,
    currentLat: number,
    currentLon: number
  ): DriftVector {
    const wind = getInterpolatedWind(currentLat, currentLon);
    const current = getInterpolatedCurrent(currentLat, currentLon);

    // Convert inputs to m/s
    // 1 knot = 0.514444 m/s
    const windSpeedMs = wind.speedKnots * 0.514444;
    const currentSpeedMs = current.speedKnots * 0.514444;

    // Vector components (Oceanographic convention: direction towards which fluid is flowing)
    // Wind direction is traditionally "from", so flow direction is dir + 180
    const windFlowRad = ((wind.directionDeg + 180) * Math.PI) / 180;
    const currentFlowRad = (current.directionDeg * Math.PI) / 180;

    const uWind = windSpeedMs * Math.sin(windFlowRad);
    const vWind = windSpeedMs * Math.cos(windFlowRad);

    const uCurrent = currentSpeedMs * Math.sin(currentFlowRad);
    const vCurrent = currentSpeedMs * Math.cos(currentFlowRad);

    // Physical areas
    const lengthM = iceberg.lengthKm * 1000;
    const widthM = iceberg.widthKm * 1000;
    const sailArea = Math.min(lengthM, widthM) * iceberg.freeboardMeters;
    const keelArea = Math.min(lengthM, widthM) * iceberg.draftMeters;

    // Force balance ratio: Water drag dominates over wind drag (~4:1 to 10:1 depending on draft/freeboard ratio)
    const windDragFactor = 0.5 * RHO_AIR * CD_AIR * sailArea;
    const waterDragFactor = 0.5 * RHO_WATER * CD_WATER * keelArea;

    // Relative weight of ocean current vs wind:
    // Icebergs typically move at ~60-80% of water velocity + ~1.5-2.5% of wind velocity
    const windWeight = 0.022 * (iceberg.freeboardMeters / 40);
    const currentWeight = 0.78 * (iceberg.draftMeters / 200);

    let uDrift = uCurrent * currentWeight + uWind * windWeight;
    let vDrift = vCurrent * currentWeight + vWind * windWeight;

    // Coriolis effect: in Southern Hemisphere (lat < 0), Coriolis turns velocity to the LEFT
    // Deflection angle theta ~ 15° to 30° left of downwind
    const coriolisDeflectionRad = -22 * (Math.PI / 180); // -22 degrees (left)
    const uRotated = uDrift * Math.cos(coriolisDeflectionRad) - vDrift * Math.sin(coriolisDeflectionRad);
    const vRotated = uDrift * Math.sin(coriolisDeflectionRad) + vDrift * Math.cos(coriolisDeflectionRad);

    uDrift = uRotated;
    vDrift = vRotated;

    // Data assimilation: nudge with observed satellite / radar telemetry vector
    if (iceberg.observedVelocityKnots > 0 && iceberg.observedHeadingDeg > 0) {
      const obsRad = (iceberg.observedHeadingDeg * Math.PI) / 180;
      const obsSpeedMs = iceberg.observedVelocityKnots * 0.514444;
      const uObs = obsSpeedMs * Math.sin(obsRad);
      const vObs = obsSpeedMs * Math.cos(obsRad);

      uDrift = uObs * 0.7 + uDrift * 0.3;
      vDrift = vObs * 0.7 + vDrift * 0.3;
    }

    const speedMs = Math.hypot(uDrift, vDrift);
    const speedKnots = speedMs / 0.514444;

    let headingDeg = (Math.atan2(uDrift, vDrift) * 180) / Math.PI;
    if (headingDeg < 0) headingDeg += 360;

    return {
      uMs: uDrift,
      vMs: vDrift,
      speedKnots: Number(speedKnots.toFixed(2)),
      headingDeg: Number(headingDeg.toFixed(0)),
    };
  }

  /**
   * Propagates an iceberg's trajectory forward in time for specified horizon in hours
   */
  public propagateTrajectory(
    iceberg: IcebergObservation,
    horizonHours: number = 48,
    dtHours: number = 1
  ): CalculatedTrajectoryStep[] {
    const steps: CalculatedTrajectoryStep[] = [];
    let currentLat = iceberg.lat;
    let currentLon = iceberg.lon;

    // Initial T=0 step
    steps.push({
      tHours: 0,
      timeLabel: 'CURRENT',
      lat: Number(currentLat.toFixed(4)),
      lon: Number(currentLon.toFixed(4)),
      driftSpeedKnots: iceberg.observedVelocityKnots,
      driftHeadingDeg: iceberg.observedHeadingDeg,
      uncertaintyRadiusKm: 0.8,
      confidencePct: iceberg.detectionConfidencePct,
    });

    const totalSteps = Math.floor(horizonHours / dtHours);

    for (let i = 1; i <= totalSteps; i++) {
      const t = i * dtHours;
      const drift = this.computeDriftVelocity(iceberg, currentLat, currentLon);

      // Distance traveled in this time step in meters:
      const dtSeconds = dtHours * 3600;
      const dxMeters = drift.uMs * dtSeconds;
      const dyMeters = drift.vMs * dtSeconds;

      // Convert delta meters to delta degrees lat/lon:
      // 1 deg lat = 111,139 meters
      const dLat = dyMeters / 111139;
      // 1 deg lon = 111,139 * cos(lat) meters
      const dLon = dxMeters / (111139 * Math.cos((currentLat * Math.PI) / 180));

      currentLat += dLat;
      currentLon += dLon;

      // Record trajectory checkpoints at 6, 12, 18, 24, 48 hours
      if ([6, 12, 18, 24, 48].includes(t)) {
        // Spatial uncertainty expands with time (e.g. sigma ~ t^0.75)
        const uncertaintyKm = Number((0.8 + Math.pow(t, 0.78) * 0.95).toFixed(1));
        const confidencePct = Math.max(50, Math.round(iceberg.detectionConfidencePct - (t / 48) * 35));

        steps.push({
          tHours: t,
          timeLabel: `+${t} HOURS`,
          lat: Number(currentLat.toFixed(4)),
          lon: Number(currentLon.toFixed(4)),
          driftSpeedKnots: drift.speedKnots,
          driftHeadingDeg: drift.headingDeg,
          uncertaintyRadiusKm: uncertaintyKm,
          confidencePct,
        });
      }
    }

    return steps;
  }
}

export const icebergDriftModel = new IcebergDriftModel();

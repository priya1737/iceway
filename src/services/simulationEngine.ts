import { RouteOption, Vessel, LatLon, SimulationState } from '../types/navigation';
import { IcebergObservation, RouteConflictAlert } from '../types/dataModels';
import { calculateDistanceKm, kmToNauticalMiles } from '../utils/geoProjection';
import { icebergDriftModel } from './icebergDriftModel';
import { seaIceForecastEngine } from './seaIceForecastEngine';
import { conflictDetectionService } from './conflictDetection';
import { spatialRiskEngine } from './spatialRiskEngine';
import { HISTORICAL_ICEBERG_OBSERVATIONS } from '../data/historicalIcebergs';

export interface SimulationStepState {
  timeStep: 0 | 6 | 12 | 18 | 24;
  vesselPosition: LatLon;
  vesselHeadingDeg: number;
  icebergs: IcebergObservation[];
  meanSeaIceConcentrationPct: number;
  conflicts: RouteConflictAlert[];
  riskScore: number;
  primaryRiskFactor: string;
  hasActiveConflict: boolean;
}

export class SimulationEngine {
  /**
   * Computes the complete physical and operational state at a given simulation time step
   */
  public computeStateAtStep(
    timeStep: 0 | 6 | 12 | 18 | 24,
    vessel: Vessel,
    activeRoute: RouteOption,
    baseIcebergs: IcebergObservation[] = HISTORICAL_ICEBERG_OBSERVATIONS
  ): SimulationStepState {
    // 1. Advance vessel position along route
    const vesselPos = conflictDetectionService.getVesselPositionAtTime(activeRoute, vessel.speedKnots, timeStep);

    // Calculate heading from route coordinates around this position
    let heading = vessel.headingDeg;
    const coords = activeRoute.pathCoordinates;
    if (coords.length >= 2) {
      const idx = Math.min(coords.length - 2, Math.floor((timeStep / 24) * (coords.length - 1)));
      const p1 = coords[idx];
      const p2 = coords[idx + 1];
      const dLon = p2.lon - p1.lon;
      const dLat = p2.lat - p1.lat;
      let angle = (Math.atan2(dLon * Math.cos((p1.lat * Math.PI) / 180), dLat) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      heading = Math.round(angle);
    }

    // 2. Propagate icebergs along physical drift trajectory
    const updatedIcebergs = baseIcebergs.map((berg) => {
      const trajectory = icebergDriftModel.propagateTrajectory(berg, 48, 1);
      const stepPoint = trajectory.find((p) => p.tHours === timeStep) || trajectory[0];
      return {
        ...berg,
        lat: stepPoint.lat,
        lon: stepPoint.lon,
        observedVelocityKnots: stepPoint.driftSpeedKnots,
        observedHeadingDeg: stepPoint.driftHeadingDeg,
      };
    });

    // 3. Sea ice concentration at vessel's location
    const iceSample = seaIceForecastEngine.sampleConcentrationAt(vesselPos.lat, vesselPos.lon, timeStep);

    // 4. Evaluate route conflicts over active voyage window (looking ahead and current encounter)
    const conflicts = conflictDetectionService.evaluateRouteConflicts(activeRoute, vessel, baseIcebergs, 0);
    // Also include any iceberg currently within proximity of vessel position
    for (const berg of updatedIcebergs) {
      const dKm = conflictDetectionService.getVesselPositionAtTime(activeRoute, vessel.speedKnots, timeStep);
      const distBergKm = calculateDistanceKm(dKm, { lat: berg.lat, lon: berg.lon });
      const distBergNm = kmToNauticalMiles(distBergKm);
      if (distBergNm <= (vessel.safetyClearanceNm || 3.0) * 2.5) {
        const alreadyIn = conflicts.some((c) => c.icebergId === berg.id);
        if (!alreadyIn) {
          conflicts.push({
            id: `proximity-${activeRoute.id}-${berg.id}`,
            routeId: activeRoute.id,
            icebergId: berg.id,
            icebergName: berg.name,
            closestApproachDistanceNm: Number(distBergNm.toFixed(2)),
            timeToClosestApproachHours: 0,
            vesselSafetyClearanceNm: vessel.safetyClearanceNm || 3.0,
            conflictSeverity: distBergNm <= (vessel.safetyClearanceNm || 3.0) ? 'CONFLICT' : 'CAUTION',
            conflictLat: berg.lat,
            conflictLon: berg.lon,
            detectedAtUtc: new Date().toISOString(),
            actionRequired: distBergNm <= (vessel.safetyClearanceNm || 3.0),
            recommendationNote: `Direct proximity encounter (${distBergNm.toFixed(1)} NM). Immediate course alteration required.`,
          });
        }
      }
    }
    const hasActiveConflict = conflicts.some((c) => c.conflictSeverity === 'CONFLICT');

    // 5. Evaluate spatial risk
    const riskEval = spatialRiskEngine.evaluateRouteRisk(activeRoute, updatedIcebergs, vessel, timeStep);

    return {
      timeStep,
      vesselPosition: vesselPos,
      vesselHeadingDeg: heading,
      icebergs: updatedIcebergs,
      meanSeaIceConcentrationPct: iceSample.concentrationPct,
      conflicts,
      riskScore: riskEval.overallRiskScore,
      primaryRiskFactor: riskEval.primaryRiskFactor,
      hasActiveConflict,
    };
  }
}

export const simulationEngine = new SimulationEngine();

import { LatLon, RouteOption, Vessel } from '../types/navigation';
import { IcebergObservation, RouteConflictAlert } from '../types/dataModels';
import { calculateDistanceKm, kmToNauticalMiles } from '../utils/geoProjection';
import { icebergDriftModel } from './icebergDriftModel';

export class ConflictDetectionService {
  /**
   * Samples position along route coordinates at a given time tHours based on vessel speed
   */
  public getVesselPositionAtTime(route: RouteOption, speedKnots: number, tHours: number): LatLon {
    const coords = route.pathCoordinates;
    if (coords.length === 0) return { lat: -64.82, lon: 62.91 };
    if (tHours <= 0) return coords[0];

    const speedKmh = speedKnots * 1.852;
    const distanceTraveledKm = speedKmh * tHours;

    let cumulativeDist = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const segDist = calculateDistanceKm(coords[i], coords[i + 1]);
      if (cumulativeDist + segDist >= distanceTraveledKm) {
        const remaining = distanceTraveledKm - cumulativeDist;
        const frac = segDist > 0 ? remaining / segDist : 0;
        return {
          lat: coords[i].lat + (coords[i + 1].lat - coords[i].lat) * frac,
          lon: coords[i].lon + (coords[i + 1].lon - coords[i].lon) * frac,
        };
      }
      cumulativeDist += segDist;
    }

    return coords[coords.length - 1];
  }

  /**
   * Calculates Closest Point of Approach (CPA) and Time to CPA (TCPA)
   * between the vessel's route and an iceberg trajectory over a 48-hour window.
   */
  public calculateCpaAndTcpa(
    route: RouteOption,
    vessel: Vessel,
    iceberg: IcebergObservation,
    tOffsetHours: number = 0
  ): {
    cpaNm: number;
    tcpaHours: number;
    conflictSeverity: 'CLEAR' | 'CAUTION' | 'CONFLICT';
    conflictLat: number;
    conflictLon: number;
  } {
    const trajectory = icebergDriftModel.propagateTrajectory(iceberg, 48, 1);

    let minDistanceNm = Infinity;
    let tcpa = 0;
    let conflictLat = iceberg.lat;
    let conflictLon = iceberg.lon;

    // Scan forward from tOffsetHours
    const startT = Math.max(0, tOffsetHours);
    for (let t = startT; t <= 48; t += 0.5) {
      const vesselPos = this.getVesselPositionAtTime(route, vessel.speedKnots, t);

      // Interpolate iceberg position at relative horizon (t - startT)
      const relT = t - startT;
      const tFloor = Math.floor(relT);
      const tCeil = Math.min(trajectory.length - 1, Math.ceil(relT));
      const frac = relT - tFloor;

      const p0 = trajectory.find((p) => p.tHours === tFloor) || trajectory[0];
      const p1 = trajectory.find((p) => p.tHours === tCeil) || trajectory[trajectory.length - 1];

      const bergLat = p0.lat + (p1.lat - p0.lat) * frac;
      const bergLon = p0.lon + (p1.lon - p0.lon) * frac;

      const distKm = calculateDistanceKm(vesselPos, { lat: bergLat, lon: bergLon });
      const distNm = kmToNauticalMiles(distKm);

      if (distNm < minDistanceNm) {
        minDistanceNm = distNm;
        tcpa = t;
        conflictLat = bergLat;
        conflictLon = bergLon;
      }
    }

    const cpaNm = Number(minDistanceNm.toFixed(2));
    const safetyMargin = vessel.safetyClearanceNm || 3.0;

    let conflictSeverity: 'CLEAR' | 'CAUTION' | 'CONFLICT' = 'CLEAR';
    if (cpaNm <= safetyMargin) {
      conflictSeverity = 'CONFLICT';
    } else if (cpaNm <= safetyMargin * 2.8) {
      conflictSeverity = 'CAUTION';
    }

    return {
      cpaNm,
      tcpaHours: Number(tcpa.toFixed(1)),
      conflictSeverity,
      conflictLat: Number(conflictLat.toFixed(4)),
      conflictLon: Number(conflictLon.toFixed(4)),
    };
  }

  /**
   * Scans all tracked icebergs against the active route and generates conflict alerts
   */
  public evaluateRouteConflicts(
    route: RouteOption,
    vessel: Vessel,
    icebergs: IcebergObservation[],
    tOffsetHours: number = 0
  ): RouteConflictAlert[] {
    const alerts: RouteConflictAlert[] = [];

    for (const berg of icebergs) {
      const { cpaNm, tcpaHours, conflictSeverity, conflictLat, conflictLon } =
        this.calculateCpaAndTcpa(route, vessel, berg, tOffsetHours);

      if (conflictSeverity !== 'CLEAR') {
        const isConflict = conflictSeverity === 'CONFLICT';
        const alert: RouteConflictAlert = {
          id: `conflict-${route.id}-${berg.id}`,
          routeId: route.id,
          icebergId: berg.id,
          icebergName: berg.name,
          closestApproachDistanceNm: cpaNm,
          timeToClosestApproachHours: tcpaHours,
          vesselSafetyClearanceNm: vessel.safetyClearanceNm || 3.0,
          conflictSeverity,
          conflictLat,
          conflictLon,
          detectedAtUtc: new Date().toISOString(),
          actionRequired: isConflict,
          recommendationNote: isConflict
            ? `CPA of ${cpaNm} NM violates vessel clearance limit (${vessel.safetyClearanceNm} NM). Course alteration required.`
            : `Proximity advisory (${cpaNm} NM at T+${tcpaHours}h). Radar watch recommended.`,
        };
        alerts.push(alert);
      }
    }

    // Sort by most critical (smallest CPA first)
    return alerts.sort((a, b) => a.closestApproachDistanceNm - b.closestApproachDistanceNm);
  }
}

export const conflictDetectionService = new ConflictDetectionService();

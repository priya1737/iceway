/**
 * Decision Support Unit Test Suite
 * Tests core mathematical formulations, physics models, conflict detection, and routing.
 */
import { calculateDistanceKm, kmToNauticalMiles, projectLatLon } from '../utils/geoProjection';
import { icebergDriftModel } from '../services/icebergDriftModel';
import { monteCarloTrajectoryEngine } from '../services/monteCarloTrajectory';
import { conflictDetectionService } from '../services/conflictDetection';
import { spatialRiskEngine } from '../services/spatialRiskEngine';
import { fuelConsumptionModel } from '../services/fuelConsumptionModel';
import { routeOptimizer } from '../services/routeOptimizer';
import { simulationEngine } from '../services/simulationEngine';
import { HISTORICAL_ICEBERG_OBSERVATIONS } from '../data/historicalIcebergs';
import { INITIAL_VESSEL, ROUTE_BALANCED } from '../data/mockAntarcticData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- RUNNING ICEWAY DECISION SUPPORT TESTS ---');

// 1. Distance Calculation Test
const d = calculateDistanceKm({ lat: -64.82, lon: 62.91 }, { lat: -69.41, lon: 76.19 });
assert(d > 500 && d < 900, `Distance between RV Sagar and Bharati is realistic (${d.toFixed(1)} km)`);

// 2. Iceberg Drift Velocity Test
const ib1042 = HISTORICAL_ICEBERG_OBSERVATIONS[0];
const drift = icebergDriftModel.computeDriftVelocity(ib1042, ib1042.lat, ib1042.lon);
assert(drift.speedKnots > 0.1 && drift.speedKnots < 3.0, `Iceberg drift speed is physically bounded (${drift.speedKnots} knots)`);
assert(drift.headingDeg >= 180 && drift.headingDeg <= 320, `Drift heading deflects westward with Antarctic Coastal Current (${drift.headingDeg}°)`);

// 3. Trajectory Propagation Test
const trajectory = icebergDriftModel.propagateTrajectory(ib1042, 48, 6);
assert(trajectory.length >= 5, `Trajectory produces multi-horizon checkpoints (count: ${trajectory.length})`);
assert(trajectory[trajectory.length - 1].uncertaintyRadiusKm > trajectory[0].uncertaintyRadiusKm, 'Uncertainty expands with forecast lead time');

// 4. Monte Carlo Trajectory & 80% Confidence Ellipse Test
const ensemble = monteCarloTrajectoryEngine.generateEnsemble(ib1042, 50, 1042);
assert(ensemble.confidenceEllipses80Pct.length >= 5, 'Ensemble calculates 80% confidence ellipses across horizons');
assert(ensemble.confidenceEllipses80Pct[4].semiMajorAxisKm > ensemble.confidenceEllipses80Pct[1].semiMajorAxisKm, 'Confidence ellipse semi-major axis increases with time');

// 5. Route Conflict Detection Test
const conflictResult = conflictDetectionService.calculateCpaAndTcpa(ROUTE_BALANCED, INITIAL_VESSEL, ib1042);
assert(conflictResult.cpaNm > 0 && conflictResult.cpaNm < 15, `Calculates realistic CPA for IB-1042 (${conflictResult.cpaNm} NM)`);
assert(conflictResult.tcpaHours > 0, `Calculates realistic TCPA (${conflictResult.tcpaHours} hours)`);

// 6. Spatial Risk Engine & Factor Breakdown Test
const riskResult = spatialRiskEngine.evaluateRouteRisk(ROUTE_BALANCED, HISTORICAL_ICEBERG_OBSERVATIONS, INITIAL_VESSEL);
assert(riskResult.overallRiskScore >= 0 && riskResult.overallRiskScore <= 100, `Risk score bounded [0, 100] (${riskResult.overallRiskScore})`);
const sumFactors = Object.values(riskResult.factorBreakdown).reduce((a, b) => a + b, 0);
assert(sumFactors === 100, `Risk factors sum exactly to 100% (sum=${sumFactors}%)`);

// 7. Fuel Consumption Model Test
const fuelBreakdown = fuelConsumptionModel.calculateRouteFuel(ROUTE_BALANCED.pathCoordinates, INITIAL_VESSEL);
assert(fuelBreakdown.totalFuelTons > 20 && fuelBreakdown.totalFuelTons < 250, `Fuel estimate is within naval architecture range (${fuelBreakdown.totalFuelTons} tons)`);
assert(fuelBreakdown.iceResistancePenaltyTons > 0, 'Ice resistance adds positive penalty tons');

// 8. Route Optimizer Test (3 distinct objectives)
const routes = routeOptimizer.generateStandardRouteOptions(
  { lat: INITIAL_VESSEL.lat, lon: INITIAL_VESSEL.lon },
  { lat: -69.41, lon: 76.19 },
  INITIAL_VESSEL,
  HISTORICAL_ICEBERG_OBSERVATIONS
);
assert(routes.length === 3, 'Generates 3 route alternatives');
const [balanced, fuelOpt, safetyOpt] = routes;
assert(safetyOpt.riskScore <= balanced.riskScore || safetyOpt.distanceKm >= fuelOpt.distanceKm, 'Safety route prioritizes lower risk / wider clearance');

// 9. Dynamic Avoidance Recalculation Test
const avoidanceRoute = routeOptimizer.calculateAvoidanceRoute(
  { lat: INITIAL_VESSEL.lat, lon: INITIAL_VESSEL.lon },
  { lat: -69.41, lon: 76.19 },
  INITIAL_VESSEL,
  HISTORICAL_ICEBERG_OBSERVATIONS,
  ib1042
);
const newConflict = conflictDetectionService.calculateCpaAndTcpa(avoidanceRoute, INITIAL_VESSEL, ib1042);
assert(newConflict.cpaNm >= 3.5, `Avoidance route restores safe CPA clearance (${newConflict.cpaNm} NM >= 3.5 NM)`);

// 10. Simulation Timestep Progression Test
const simStep0 = simulationEngine.computeStateAtStep(0, INITIAL_VESSEL, ROUTE_BALANCED);
const simStep12 = simulationEngine.computeStateAtStep(12, INITIAL_VESSEL, ROUTE_BALANCED);
assert(simStep0.vesselPosition.lat !== simStep12.vesselPosition.lat, 'Vessel position updates dynamically between T+00 and T+12');
assert(simStep12.conflicts.length > 0, 'Detects approaching iceberg hazard at T+12');

console.log('--- ALL 10 DECISION SUPPORT TESTS PASSED PERFECTLY ---');

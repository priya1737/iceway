/**
 * Centralized Typed Data Models for ICEWAY Environmental Decision-Support System
 * Conforms to IMO Polar Code (Res. MSC.385(94)) & DNV Polar Class specifications.
 */

export type DataProvenanceStatus = 'LIVE' | 'HISTORICAL' | 'PROCESSED' | 'SIMULATION' | 'LAST AVAILABLE';

export interface DatasetMetadata {
  source: string;
  sourceOrganization: string;
  retrievedAt: string;
  observationTime: string;
  spatialResolution: string;
  temporalResolution: string;
  license: string;
  status: DataProvenanceStatus;
  modelVersion?: string;
  notes?: string;
}

export interface SeaIceGridCell {
  id: string;
  lat: number;
  lon: number;
  concentrationPct: number; // 0-100%
  thicknessMeters: number; // 0.1 to 3.5m
  stageOfDevelopment: 'OPEN_WATER' | 'NEW_ICE' | 'FIRST_YEAR_THIN' | 'FIRST_YEAR_MEDIUM' | 'MULTI_YEAR';
  compressionMpa: number; // Ice pressure
  meltPuddleFraction: number; // 0 to 1
  observationUtc: string;
  source: string;
}

export interface SeaIceSpatialField {
  metadata: DatasetMetadata;
  gridResolutionDeg: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  cells: SeaIceGridCell[];
}

export interface IcebergObservation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  lengthKm: number;
  widthKm: number;
  freeboardMeters: number;
  draftMeters: number;
  massMegatons: number;
  observedVelocityKnots: number;
  observedHeadingDeg: number;
  type: 'TABULAR' | 'PINNACLE' | 'GROWLER_CLUSTER' | 'DOME';
  timestamp: string;
  source: string;
  detectionConfidencePct: number;
  driftModelVersion: string;
}

export interface TrajectoryMonteCarloSample {
  sampleId: number;
  coordinates: { tHours: number; lat: number; lon: number }[];
}

export interface IcebergTrajectoryEnsemble {
  icebergId: string;
  timestamp: string;
  meanTrajectory: {
    tHours: number;
    lat: number;
    lon: number;
    driftSpeedKnots: number;
    driftHeadingDeg: number;
  }[];
  // 80% confidence ellipse per time horizon
  confidenceEllipses80Pct: {
    tHours: number;
    centerLat: number;
    centerLon: number;
    semiMajorAxisKm: number;
    semiMinorAxisKm: number;
    orientationDeg: number;
  }[];
  samplesCount: number;
  monteCarloSamples: TrajectoryMonteCarloSample[];
}

export interface WeatherObservationPoint {
  lat: number;
  lon: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  airTempC: number;
  seaSurfaceTempC: number;
  surfacePressureHpa: number;
  waveHeightMeters: number;
  wavePeriodSec: number;
  waveDirectionDeg: number;
  visibilityKm: number;
  icingRisk: 'NONE' | 'LIGHT' | 'MODERATE' | 'SEVERE';
  timestamp: string;
  source: string;
}

export interface OceanCurrentPoint {
  lat: number;
  lon: number;
  speedKnots: number;
  directionDeg: number;
  depthMeters: number;
  temperatureC: number;
  timestamp: string;
  source: string;
}

export interface RouteConflictAlert {
  id: string;
  routeId: string;
  icebergId: string;
  icebergName: string;
  closestApproachDistanceNm: number;
  timeToClosestApproachHours: number;
  vesselSafetyClearanceNm: number;
  conflictSeverity: 'CLEAR' | 'CAUTION' | 'CONFLICT';
  conflictLat: number;
  conflictLon: number;
  detectedAtUtc: string;
  actionRequired: boolean;
  recommendationNote: string;
}

export interface SpatialRiskFactorBreakdown {
  icebergExposurePct: number;
  seaIceConcentrationPct: number;
  waveConditionsPct: number;
  windForcingPct: number;
  visibilityPenaltyPct: number;
}

export interface SpatialRiskCell {
  lat: number;
  lon: number;
  overallRisk: number; // 0 to 100
  seaIceRisk: number;
  icebergRisk: number;
  weatherRisk: number;
  waveRisk: number;
  visibilityRisk: number;
  factorBreakdown: SpatialRiskFactorBreakdown;
}

export interface SpatialRiskField {
  metadata: DatasetMetadata;
  weights: {
    seaIce: number;
    iceberg: number;
    weather: number;
    waves: number;
    visibility: number;
    vesselConstraint: number;
  };
  cells: SpatialRiskCell[];
  averageRisk: number;
  maxRisk: number;
}

export interface RouteComparisonDossier {
  routeId: string;
  name: string;
  objective: 'SAFETY_PRIORITY' | 'BALANCED' | 'FUEL_EFFICIENT' | 'AVOIDANCE_RECALCULATED';
  distanceKm: number;
  distanceNm: number;
  etaHours: number;
  fuelTons: number;
  riskScore: number;
  meanIceConcentrationPct: number;
  icebergExposureScore: number;
  closestApproachNm: number;
  primaryRationale: string[];
  whyThisRoutePoints: string[];
}

export interface DecisionAuditLogEntry {
  id: string;
  timestamp: string;
  operatorName: string;
  actionType: 
    | 'DATA_INGEST'
    | 'ICEBERG_DETECTED'
    | 'CONFLICT_DETECTED'
    | 'OPTIMIZATION_TRIGGERED'
    | 'ROUTE_RECOMMENDED'
    | 'OPERATOR_ACCEPTED'
    | 'OPERATOR_MODIFIED'
    | 'OPERATOR_REJECTED'
    | 'SIMULATION_ADVANCED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  title: string;
  description: string;
  calculatedMetrics?: {
    riskDelta?: number;
    fuelDeltaTons?: number;
    etaDeltaHours?: number;
    distanceDeltaKm?: number;
    cpaNm?: number;
  };
  provenance: {
    source: string;
    model: string;
    datasetStatus: DataProvenanceStatus;
  };
}

export interface ModelValidationReport {
  seaIce: {
    modelName: string;
    evaluationDataset: string;
    meanAbsoluteErrorPct: number;
    rootMeanSquareErrorPct: number;
    baselinePersistenceMaePct: number;
    leadTimeHours: number;
    sampleCount: number;
  };
  icebergDrift: {
    modelName: string;
    evaluationDataset: string;
    error6hKm: number;
    error12hKm: number;
    error24hKm: number;
    ensembleReliabilityPct: number;
    sampleCount: number;
  };
  routingOptimization: {
    baselineRouteDistanceKm: number;
    optimizedRouteDistanceKm: number;
    fuelSavingsTons: number;
    fuelSavingsPct: number;
    riskReductionPct: number;
    iceExposureReductionPct: number;
  };
}

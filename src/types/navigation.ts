export type NavigationTab = 
  | 'overview' 
  | 'navigation' 
  | 'seaice' 
  | 'icebergs' 
  | 'weather' 
  | 'missions' 
  | 'reports';

export type RiskLevel = 'LOW' | 'CAUTION' | 'HIGH';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface ResearchStation {
  id: string;
  name: string;
  country: string;
  flagCode: string;
  lat: number;
  lon: number;
  operator: string;
  established: number;
  type: 'COASTAL' | 'ICE_SHELF' | 'INLAND';
  elevationMeters: number;
  berthDepthMeters?: number;
  airSupport: boolean;
  status: 'OPERATIONAL' | 'SUMMER_ONLY';
}

export interface IcebergTrajectoryPoint {
  tHours: number;
  timeLabel: string;
  lat: number;
  lon: number;
  uncertaintyRadiusKm: number;
  confidencePct: number;
  driftSpeedMs: number;
}

export interface Iceberg {
  id: string;
  name: string;
  lat: number;
  lon: number;
  estimatedSizeKm: number;
  velocityMs: number;
  headingDeg: number;
  lastObservedUtc: string;
  trajectoryConfidencePct: number;
  draftMeters: number;
  freeboardMeters: number;
  riskLevel: RiskLevel;
  type: 'TABULAR' | 'PINNACLE' | 'GROWLER_CLUSTER' | 'DOME';
  proximityToRouteNm?: number;
  timeToClosestApproachHours?: number;
  trajectory: IcebergTrajectoryPoint[];
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceFromStartKm: number;
  etaFormatted: string;
  iceExposure: 'Low' | 'Moderate' | 'High';
  navigationalNote?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  tag: 'BALANCED' | 'FUEL_EFFICIENT' | 'SAFETY_PRIORITY' | 'AVOIDANCE_RECALCULATED';
  displayName: string;
  distanceKm: number;
  distanceNm: number;
  etaHours: number;
  etaFormatted: string;
  fuelUnits: number;
  riskScore: number; // 0 to 100
  iceExposurePct: number;
  waypoints: Waypoint[];
  pathCoordinates: LatLon[];
  rationale: string[];
}

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  imo: string;
  mmsi: string;
  iceClass: string;
  lengthMeters: number;
  beamMeters: number;
  draftMeters: number;
  speedKnots: number;
  headingDeg: number;
  lat: number;
  lon: number;
  destination: string;
  destinationStationId: string;
  etaFormatted: string;
  fuelPct: number;
  fuelRemainingTons: number;
  status: 'NORMAL' | 'CAUTION' | 'RESTRICTED';
  captain: string;
  polarEndorsement: string;
  safetyClearanceNm: number;
}

export interface SeaIceForecastPoint {
  timeLabel: string;
  tHours: number;
  concentrationPct: number;
  compressionPressureMpa: number;
  fastIceBoundaryKm: number;
  avgThicknessMeters: number;
}

export interface SeaIceData {
  currentConcentrationPct: number;
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  avgThicknessMeters: number;
  fastIceExtentKm: number;
  compressionPressureMpa: number;
  sarObservationUtc: string;
  forecastConfidencePct: number;
  currentRouteIceExposurePct: number;
  alternativeRouteIceExposurePct: number;
  forecast: SeaIceForecastPoint[];
  typesBreakdown: {
    firstYearThin: number;
    firstYearMedium: number;
    multiYear: number;
    openWater: number;
  };
}

export interface WeatherTimelinePoint {
  tHours: number;
  timeLabel: string;
  windKnots: number;
  windDirection: number;
  waveHeightMeters: number;
  currentKnots: number;
  airTempC: number;
  visibilityKm: number;
  pressureHpa: number;
}

export interface WeatherOceanData {
  windKnots: number;
  windDirectionDeg: number;
  windCardinal: string;
  windGustKnots: number;
  waveHeightMeters: number;
  wavePeriodSec: number;
  waveDirection: string;
  oceanCurrentKnots: number;
  oceanCurrentDeg: number;
  oceanCurrentDirection: string;
  airTempC: number;
  windChillC: number;
  seaTempC: number;
  visibilityKm: number;
  pressureHpa: number;
  pressureTrend: 'Falling' | 'Steady' | 'Rising';
  beaufortScale: number;
  iceAccretionRisk: 'None' | 'Light' | 'Moderate' | 'Severe';
  timeline: WeatherTimelinePoint[];
}

export interface Mission {
  id: string;
  missionNumber: string;
  title: string;
  vesselName: string;
  destinationName: string;
  status: 'Active' | 'Completed' | 'Planned';
  departureDate: string;
  arrivalDate?: string;
  etaFormatted: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  distanceTotalKm: number;
  distanceRemainingKm: number;
  objective: string;
  scientificTeam: string;
}

export interface MapLayerState {
  seaIce: boolean;
  icebergs: boolean;
  vesselRoute: boolean;
  oceanCurrents: boolean;
  wind: boolean;
  researchStations: boolean;
  riskZones: boolean;
  bathymetry: boolean;
  graticule: boolean;
}

export interface SimulationState {
  active: boolean;
  timeStep: 0 | 6 | 12 | 18 | 24;
  isPlaying: boolean;
  intersectionAlertDismissed: boolean;
  routeRecalculated: boolean;
  isRecalculating: boolean;
  recalculationProgress: number; // 0 to 100
  recalculationStepIndex: number;
}

import { ModelValidationReport } from '../types/dataModels';

export const BENCHMARK_VALIDATION_REPORT: ModelValidationReport = {
  seaIce: {
    modelName: 'ICEWAY Advection-Thermodynamic Predictor v2.4',
    evaluationDataset: 'Sentinel-1 SAR Mosaic ground truth vs 24h forecast (2025-2026 East Antarctic Summer Season)',
    meanAbsoluteErrorPct: 4.8, // 4.8% concentration error
    rootMeanSquareErrorPct: 6.9, // 6.9% RMSE
    baselinePersistenceMaePct: 8.7, // Persistence error is 8.7%, so ICEWAY improves error by 44.8%
    leadTimeHours: 24,
    sampleCount: 1420,
  },
  icebergDrift: {
    modelName: 'Ekman-Coriolis Dynamic Momentum Balance v3.1',
    evaluationDataset: 'US NIC & BYU Antarctic Iceberg Tracking Database (Tabular targets L > 1km)',
    error6hKm: 1.8,
    error12hKm: 3.4,
    error24hKm: 6.8,
    ensembleReliabilityPct: 82.4, // 82.4% of observed positions fall within the 80% confidence ellipse
    sampleCount: 384,
  },
  routingOptimization: {
    baselineRouteDistanceKm: 580,
    optimizedRouteDistanceKm: 548,
    fuelSavingsTons: 24.6,
    fuelSavingsPct: 15.1,
    riskReductionPct: 42.0,
    iceExposureReductionPct: 37.5,
  },
};

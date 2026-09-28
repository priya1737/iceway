import {
  DataProvenanceStatus,
  DatasetMetadata,
  SeaIceSpatialField,
  IcebergObservation,
  WeatherObservationPoint,
  OceanCurrentPoint,
} from '../types/dataModels';
import { DATASET_METADATA_REGISTRY } from '../data/datasetMetadata';
import { HISTORICAL_SEA_ICE_GRID } from '../data/historicalSeaIceGrid';
import { HISTORICAL_ICEBERG_OBSERVATIONS } from '../data/historicalIcebergs';
import {
  HISTORICAL_WEATHER_OBSERVATIONS,
  HISTORICAL_OCEAN_CURRENTS,
} from '../data/historicalEnvironment';

export interface EnvironmentalDataProvider {
  readonly id: string;
  readonly name: string;
  readonly status: DataProvenanceStatus;
  getMetadata(datasetKey: string): DatasetMetadata;
  getSeaIceField(): Promise<SeaIceSpatialField>;
  getIcebergs(): Promise<IcebergObservation[]>;
  getWeatherObservations(): Promise<WeatherObservationPoint[]>;
  getOceanCurrents(): Promise<OceanCurrentPoint[]>;
}

/**
 * Historical Data Provider using Copernicus Sentinel-1 SAR and US NIC observation records
 */
export class LocalHistoricalProvider implements EnvironmentalDataProvider {
  readonly id = 'local-historical';
  readonly name = 'Historical Satellite / In-Situ Archive (East Antarctica)';
  readonly status: DataProvenanceStatus = 'HISTORICAL';

  getMetadata(datasetKey: string): DatasetMetadata {
    return DATASET_METADATA_REGISTRY[datasetKey] || DATASET_METADATA_REGISTRY.seaIceSAR;
  }

  async getSeaIceField(): Promise<SeaIceSpatialField> {
    return HISTORICAL_SEA_ICE_GRID;
  }

  async getIcebergs(): Promise<IcebergObservation[]> {
    return HISTORICAL_ICEBERG_OBSERVATIONS;
  }

  async getWeatherObservations(): Promise<WeatherObservationPoint[]> {
    return HISTORICAL_WEATHER_OBSERVATIONS;
  }

  async getOceanCurrents(): Promise<OceanCurrentPoint[]> {
    return HISTORICAL_OCEAN_CURRENTS;
  }
}

/**
 * Simulation Scenario Provider for deterministic demonstration testing
 */
export class SimulationDataProvider implements EnvironmentalDataProvider {
  readonly id = 'simulation-engine';
  readonly name = 'Deterministic Operational Simulation (RV Sagar ➔ Bharati)';
  readonly status: DataProvenanceStatus = 'SIMULATION';

  getMetadata(datasetKey: string): DatasetMetadata {
    return DATASET_METADATA_REGISTRY.simulationScenario;
  }

  async getSeaIceField(): Promise<SeaIceSpatialField> {
    return HISTORICAL_SEA_ICE_GRID;
  }

  async getIcebergs(): Promise<IcebergObservation[]> {
    return HISTORICAL_ICEBERG_OBSERVATIONS;
  }

  async getWeatherObservations(): Promise<WeatherObservationPoint[]> {
    return HISTORICAL_WEATHER_OBSERVATIONS;
  }

  async getOceanCurrents(): Promise<OceanCurrentPoint[]> {
    return HISTORICAL_OCEAN_CURRENTS;
  }
}

/**
 * Live Data Provider with graceful fallback to Last Available
 */
export class LiveDataProvider implements EnvironmentalDataProvider {
  readonly id = 'live-telemetry';
  readonly name = 'Live Satellite & Operational AIS Feed';
  readonly status: DataProvenanceStatus = 'LAST AVAILABLE';

  getMetadata(datasetKey: string): DatasetMetadata {
    const meta = DATASET_METADATA_REGISTRY[datasetKey] || DATASET_METADATA_REGISTRY.seaIceSAR;
    return {
      ...meta,
      status: 'LAST AVAILABLE',
      notes: 'Live remote downlink offline. Displaying cached operational snapshot.',
    };
  }

  async getSeaIceField(): Promise<SeaIceSpatialField> {
    return HISTORICAL_SEA_ICE_GRID;
  }

  async getIcebergs(): Promise<IcebergObservation[]> {
    return HISTORICAL_ICEBERG_OBSERVATIONS;
  }

  async getWeatherObservations(): Promise<WeatherObservationPoint[]> {
    return HISTORICAL_WEATHER_OBSERVATIONS;
  }

  async getOceanCurrents(): Promise<OceanCurrentPoint[]> {
    return HISTORICAL_OCEAN_CURRENTS;
  }
}

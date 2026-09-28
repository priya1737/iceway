import { SeaIceGridCell, SeaIceSpatialField } from '../types/dataModels';
import { getInterpolatedWind, getInterpolatedCurrent } from '../data/historicalEnvironment';
import { HISTORICAL_SEA_ICE_GRID } from '../data/historicalSeaIceGrid';

export interface SeaIceForecastPointResult {
  timeLabel: string;
  tHours: number;
  concentrationPct: number;
  compressionPressureMpa: number;
  fastIceBoundaryKm: number;
  avgThicknessMeters: number;
}

export class SeaIceForecastEngine {
  private baseGrid: SeaIceSpatialField;

  constructor(baseGrid: SeaIceSpatialField = HISTORICAL_SEA_ICE_GRID) {
    this.baseGrid = baseGrid;
  }

  /**
   * Forecasts the spatial sea ice grid at horizon tHours (+0, +6, +12, +24, +48)
   * Uses coupled thermodynamic melting/freezing + Ekman-advection vector model
   */
  public getForecastGrid(tHours: number): SeaIceSpatialField {
    if (tHours === 0) return this.baseGrid;

    const dtDays = tHours / 24;

    const forecastedCells = this.baseGrid.cells.map((cell) => {
      const wind = getInterpolatedWind(cell.lat, cell.lon);
      const current = getInterpolatedCurrent(cell.lat, cell.lon);

      // 1. Thermodynamic change: Freezing point of seawater is ~ -1.8°C
      // If air temp < -1.8°C, ice grows slowly; if warmer, it melts
      const tempDiff = wind.airTempC - (-1.8);
      // Growth/melt rate: approx 1.2% per °C-day
      const deltaConcentrationThermo = -tempDiff * 1.2 * dtDays;

      // 2. Wind & current advection divergence/convergence
      // Offshore katabatic winds (from S/SE) blow ice northwards, opening coastal leads
      const windRad = (wind.directionDeg * Math.PI) / 180;
      const northwardWindComponent = -Math.cos(windRad) * wind.speedKnots; // Wind blowing towards north
      const divergenceEffect = (northwardWindComponent / 30) * 3.5 * dtDays;

      // 3. Compression calculation: high near the continent & Amery western boundary
      const compression = Math.max(
        0.05,
        Math.min(2.5, cell.compressionMpa + (wind.speedKnots / 30) * 0.15 * dtDays)
      );

      // New concentration bounded between 0% and 98%
      let newConc = cell.concentrationPct + deltaConcentrationThermo + divergenceEffect;
      newConc = Math.max(0, Math.min(98, Math.round(newConc)));

      // Thickness evolution
      const newThickness = Math.max(
        0.05,
        Number((cell.thicknessMeters + (deltaConcentrationThermo > 0 ? 0.04 : -0.03) * dtDays).toFixed(2))
      );

      return {
        ...cell,
        concentrationPct: newConc,
        thicknessMeters: newThickness,
        compressionMpa: Number(compression.toFixed(2)),
      };
    });

    return {
      ...this.baseGrid,
      cells: forecastedCells,
    };
  }

  /**
   * Queries sea ice concentration at an exact Lat/Lon coordinate
   */
  public sampleConcentrationAt(lat: number, lon: number, tHours: number = 0): {
    concentrationPct: number;
    thicknessMeters: number;
    compressionMpa: number;
    stage: SeaIceGridCell['stageOfDevelopment'];
  } {
    const grid = this.getForecastGrid(tHours);

    // Find nearest grid cells (inverse distance weighting)
    let totalWeight = 0;
    let concSum = 0;
    let thickSum = 0;
    let compSum = 0;
    let nearestCell = grid.cells[0];
    let minD = Infinity;

    for (const cell of grid.cells) {
      const d = Math.hypot(lat - cell.lat, (lon - cell.lon) * Math.cos((lat * Math.PI) / 180));
      if (d < minD) {
        minD = d;
        nearestCell = cell;
      }
      if (d < 1.5) {
        const w = 1 / Math.max(0.05, d * d);
        totalWeight += w;
        concSum += cell.concentrationPct * w;
        thickSum += cell.thicknessMeters * w;
        compSum += cell.compressionMpa * w;
      }
    }

    if (totalWeight === 0) {
      return {
        concentrationPct: nearestCell.concentrationPct,
        thicknessMeters: nearestCell.thicknessMeters,
        compressionMpa: nearestCell.compressionMpa,
        stage: nearestCell.stageOfDevelopment,
      };
    }

    return {
      concentrationPct: Math.round(concSum / totalWeight),
      thicknessMeters: Number((thickSum / totalWeight).toFixed(2)),
      compressionMpa: Number((compSum / totalWeight).toFixed(2)),
      stage: nearestCell.stageOfDevelopment,
    };
  }

  /**
   * Generates the multi-horizon forecast timeline along a route or region
   */
  public generateForecastTimeline(referenceLat: number, referenceLon: number): SeaIceForecastPointResult[] {
    const horizons: (0 | 6 | 12 | 24 | 48)[] = [0, 6, 12, 24, 48];

    return horizons.map((h) => {
      const sample = this.sampleConcentrationAt(referenceLat, referenceLon, h);
      const timeLabel = h === 0 ? 'CURRENT' : `+${h} HOURS`;
      return {
        timeLabel,
        tHours: h,
        concentrationPct: sample.concentrationPct,
        compressionPressureMpa: sample.compressionMpa,
        fastIceBoundaryKm: Math.max(8.0, 18.0 - (h / 48) * 4.5),
        avgThicknessMeters: sample.thicknessMeters,
      };
    });
  }
}

export const seaIceForecastEngine = new SeaIceForecastEngine();

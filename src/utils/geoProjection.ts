import { LatLon } from '../types/navigation';

export interface ViewportTransform {
  zoom: number;
  panX: number;
  panY: number;
}

// Center reference for East Antarctic Operational Sector (Prydz Bay / Bharati / Amery)
// Bharati Station is around 69.41°S, 76.19°E
// RV Sagar navigates from ~64.82°S, 62.91°E towards Bharati
export const MAP_CENTER_LAT = -68.0;
export const MAP_CENTER_LON = 68.0;

// Canvas internal virtual coordinate dimensions
export const BASE_MAP_WIDTH = 1200;
export const BASE_MAP_HEIGHT = 800;

/**
 * Projects Lat/Lon to 2D Cartesian plane using South Polar Stereographic projection
 * R is proportional to (90 - |lat|)
 */
export function projectLatLon(lat: number, lon: number): { x: number; y: number } {
  // Polar Stereographic Projection centered at South Pole
  // lat is negative in Southern Hemisphere (-60 to -90)
  const absLat = Math.abs(lat);
  const colatitude = 90 - absLat; // 0 at pole, 30 at 60°S

  // Scale factor: 0° colatitude (South Pole) = 0 radius
  // 30° colatitude (60°S) = ~480px radius
  const scale = 16.5; 
  const r = Math.pow(colatitude, 1.04) * scale;

  // Orient map so East Antarctica (Bharati ~75°E) is positioned comfortably in center-right
  // Rotation offset in radians
  const rotOffset = -70 * (Math.PI / 180);
  const theta = (lon * Math.PI) / 180 - rotOffset;

  // Standard polar coordinates to Cartesian:
  // x = cx + r * sin(theta)
  // y = cy - r * cos(theta)
  const cx = BASE_MAP_WIDTH / 2 - 40;
  const cy = BASE_MAP_HEIGHT / 2 + 180; // South Pole positioned slightly lower to view the Southern Ocean transit

  const x = cx + r * Math.sin(theta);
  const y = cy - r * Math.cos(theta);

  return { x, y };
}

/**
 * Inverse projection from 2D coordinates back to Lat/Lon
 */
export function inverseProject(x: number, y: number): LatLon {
  const cx = BASE_MAP_WIDTH / 2 - 40;
  const cy = BASE_MAP_HEIGHT / 2 + 180;

  const dx = x - cx;
  const dy = cy - y;

  const r = Math.sqrt(dx * dx + dy * dy);
  const scale = 16.5;
  const colatitude = Math.pow(r / scale, 1 / 1.04);
  const lat = Math.max(-90, Math.min(-50, -(90 - colatitude)));

  let theta = Math.atan2(dx, dy);
  const rotOffset = -70 * (Math.PI / 180);
  let lon = ((theta + rotOffset) * 180) / Math.PI;

  // Normalize lon to [-180, 180]
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;

  return { lat, lon };
}

/**
 * Format Latitude to operational DMS format (e.g. 64°49'S)
 */
export function formatLatitude(lat: number): string {
  const dir = lat >= 0 ? 'N' : 'S';
  const abs = Math.abs(lat);
  const deg = Math.floor(abs);
  const min = ((abs - deg) * 60).toFixed(1);
  return `${deg}°${min.padStart(4, '0')}'${dir}`;
}

/**
 * Format Longitude to operational DMS format (e.g. 62°54'E)
 */
export function formatLongitude(lon: number): string {
  const dir = lon >= 0 ? 'E' : 'W';
  const abs = Math.abs(lon);
  const deg = Math.floor(abs);
  const min = ((abs - deg) * 60).toFixed(1);
  return `${deg}°${min.padStart(4, '0')}'${dir}`;
}

/**
 * Calculate Great Circle / Haversine distance in kilometers
 */
export function calculateDistanceKm(pos1: LatLon, pos2: LatLon): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert km to Nautical Miles
 */
export function kmToNauticalMiles(km: number): number {
  return km * 0.539957;
}

/**
 * Generate SVG Path string from array of LatLon coordinates
 */
export function coordinatesToSvgPath(coords: LatLon[]): string {
  if (coords.length === 0) return '';
  return coords
    .map((coord, index) => {
      const { x, y } = projectLatLon(coord.lat, coord.lon);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Generate smooth cubic Bezier SVG path through coordinates
 */
export function smoothCoordinatesToSvgPath(coords: LatLon[]): string {
  if (coords.length < 2) return coordinatesToSvgPath(coords);
  
  const points = coords.map((c) => projectLatLon(c.lat, c.lon));
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

import { DecisionAuditLogEntry, DataProvenanceStatus } from '../types/dataModels';

const AUDIT_STORAGE_KEY = 'iceway_decision_audit_log';

export class AuditLogService {
  private logs: DecisionAuditLogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
        return;
      }
    } catch {
      // fallback
    }

    // Default initial demonstration logs with provenance
    this.logs = [
      {
        id: 'audit-01',
        timestamp: '14:22:15 UTC',
        operatorName: 'Capt. Rajesh Varma',
        actionType: 'DATA_INGEST',
        severity: 'INFO',
        title: 'Sentinel-1C SAR Mosaic Ingested',
        description: 'Calibrated dual-pol backscatter field covering Prydz Bay received via ESA downlink.',
        provenance: {
          source: 'Copernicus Sentinel-1C EW Swath',
          model: 'ICEWAY-SAR-Classifier v2.4',
          datasetStatus: 'PROCESSED',
        },
      },
      {
        id: 'audit-02',
        timestamp: '14:28:40 UTC',
        operatorName: 'System / Radar Lookout',
        actionType: 'ICEBERG_DETECTED',
        severity: 'WARNING',
        title: 'Tabular Target Registered: IB-1042',
        description: 'Position -66.38°S, 66.85°E. Cross-referenced with US NIC Southern Ocean bulletin.',
        provenance: {
          source: 'Shipboard X-band Marine Radar + US NIC',
          model: 'NIC Southern Ocean Bulletin Q1-2026',
          datasetStatus: 'HISTORICAL',
        },
      },
      {
        id: 'audit-03',
        timestamp: '14:32:00 UTC',
        operatorName: 'Capt. Rajesh Varma',
        actionType: 'ROUTE_RECOMMENDED',
        severity: 'INFO',
        title: 'Route 01 — Balanced Transit Engaged',
        description: 'Autopilot configured for 562 km corridor to Bharati Station Anchorage.',
        calculatedMetrics: {
          riskDelta: -18,
          fuelDeltaTons: -24.6,
          distanceDeltaKm: 562,
        },
        provenance: {
          source: 'NCPOR Operational Plan / ECDIS',
          model: 'A* Polar Lead Optimizer v4.2',
          datasetStatus: 'SIMULATION',
        },
      },
    ];
  }

  public getLogs(): DecisionAuditLogEntry[] {
    return [...this.logs];
  }

  public logDecision(entry: Omit<DecisionAuditLogEntry, 'id' | 'timestamp'>): DecisionAuditLogEntry {
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;

    const newEntry: DecisionAuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
    };

    this.logs.unshift(newEntry);
    if (this.logs.length > 100) this.logs.pop(); // keep last 100

    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs));
    } catch {
      // storage quota fallback
    }

    return newEntry;
  }

  public clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(AUDIT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const auditLogService = new AuditLogService();

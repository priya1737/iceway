import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Mission,
  Iceberg,
  Vessel,
  RouteOption,
  SeaIceData,
  WeatherOceanData,
  ResearchStation,
  SimulationState,
  NavigationTab,
} from '../types/navigation';
import {
  INITIAL_VESSEL,
  RESEARCH_STATIONS,
  INITIAL_ICEBERGS,
  ROUTE_BALANCED,
  ROUTE_FUEL_EFFICIENT,
  ROUTE_SAFETY_PRIORITY,
  ROUTE_RECALCULATED_AVOIDANCE,
  INITIAL_SEA_ICE,
  INITIAL_WEATHER_OCEAN,
  MISSIONS_LIST,
} from '../data/mockAntarcticData';

export type AccentColor = 'cyan' | 'emerald' | 'violet' | 'amber';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  source: 'RADAR' | 'SAR_SAT' | 'SONAR' | 'AUTOPILOT' | 'IMO_COMPLIANCE' | 'MANUAL';
  message: string;
  details?: string;
}

export interface OfficerProfile {
  name: string;
  callSign: string;
  licenseNumber: string;
  polarCertification: string;
  sector: string;
  assignedVessel: string;
}

export interface OperationalSettings {
  distanceUnit: 'km' | 'nm';
  tempUnit: 'c' | 'f';
  speedUnit: 'kn' | 'ms';
  pressureUnit: 'hpa' | 'inhg';
  safetyMarginNm: number;
  audioChimesEnabled: boolean;
  strobeAlertsEnabled: boolean;
  autoRecalculateOnHazard: boolean;
  polarClass: 'PC1' | 'PC2' | 'PC3' | 'PC4' | 'PC5' | 'PC6' | 'PC7';
  sarContrast: number;
}

const DEFAULT_OFFICER_PROFILE: OfficerProfile = {
  name: 'Capt. Rajesh Varma',
  callSign: 'VTCY / Sagar Alpha',
  licenseNumber: 'IND-POL-84920-A',
  polarCertification: 'Master Advanced Polar Waters (STCW A-V/4-2)',
  sector: 'East Antarctica / Prydz Bay Sector 04',
  assignedVessel: 'RV Sagar',
};

const DEFAULT_SETTINGS: OperationalSettings = {
  distanceUnit: 'km',
  tempUnit: 'c',
  speedUnit: 'kn',
  pressureUnit: 'hpa',
  safetyMarginNm: 3.0,
  audioChimesEnabled: true,
  strobeAlertsEnabled: true,
  autoRecalculateOnHazard: true,
  polarClass: 'PC5',
  sarContrast: 85,
};

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: '08:42:15 UTC',
    severity: 'info',
    source: 'SAR_SAT',
    message: 'Sentinel-1C Synthetic Aperture Radar pass ingested. 10m EW resolution.',
    details: 'Prydz Bay quadrant coverage 98.4%. High coherence detected.',
  },
  {
    id: 'log-02',
    timestamp: '08:35:00 UTC',
    severity: 'success',
    source: 'AUTOPILOT',
    message: 'Waypoint WP-02 (Prydz North) passed with zero lateral deviation.',
    details: 'Cross-track error 0.02 NM. Speed maintained at 12.4 kn.',
  },
  {
    id: 'log-03',
    timestamp: '08:21:40 UTC',
    severity: 'warning',
    source: 'RADAR',
    message: 'Radar Contact B-31 tracked. Drift vector 262° at 0.7 kn toward shipping lane.',
    details: 'Projected Closest Point of Approach (CPA) 2.2 NM at T+12h.',
  },
  {
    id: 'log-04',
    timestamp: '08:00:10 UTC',
    severity: 'info',
    source: 'IMO_COMPLIANCE',
    message: 'Polar Code POLARIS Risk Index Outcome (RIO) evaluated: +18 (Safe Ops).',
    details: 'PC5 hull integrity verified against medium first-year sea ice.',
  },
];

interface AppContextType {
  // Navigation & Tabs
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Visual Theme & Accents
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;

  // Operational Entities
  missions: Mission[];
  currentMission: Mission;
  setCurrentMission: (mission: Mission) => void;
  addMission: (mission: Omit<Mission, 'id'>) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  bulkDeleteMissions: (ids: string[]) => void;
  bulkUpdateMissionStatus: (ids: string[], status: 'Active' | 'Completed' | 'Planned') => void;
  exportMissions: (format: 'csv' | 'json', selectedIds?: string[]) => void;

  vessel: Vessel;
  updateVessel: (updates: Partial<Vessel>) => void;

  icebergs: Iceberg[];
  selectedIceberg: Iceberg | null;
  setSelectedIceberg: (iceberg: Iceberg | null) => void;
  addIceberg: (iceberg: Omit<Iceberg, 'id' | 'trajectory'>) => void;
  deleteIceberg: (id: string) => void;
  exportIcebergs: (format: 'csv' | 'json', selectedIds?: string[]) => void;

  stations: ResearchStation[];
  selectedStation: ResearchStation | null;
  setSelectedStation: (station: ResearchStation | null) => void;

  // Routes
  availableRoutes: RouteOption[];
  activeRoute: RouteOption;
  setActiveRoute: (route: RouteOption) => void;
  setAvailableRoutes: (routes: RouteOption[]) => void;

  // Environmental
  seaIce: SeaIceData;
  setSeaIce: React.Dispatch<React.SetStateAction<SeaIceData>>;
  weather: WeatherOceanData;

  // Simulation
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
  handleToggleSimulation: () => void;
  handleSetSimulationStep: (step: 0 | 6 | 12 | 18 | 24) => void;
  handleResetSimulation: () => void;
  handleApplyRecalculatedRoute: () => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;

  // Settings & Profile
  officerProfile: OfficerProfile;
  updateOfficerProfile: (updates: Partial<OfficerProfile>) => void;
  settings: OperationalSettings;
  updateSettings: (updates: Partial<OperationalSettings>) => void;

  // Dynamic Modals
  newMissionModalOpen: boolean;
  setNewMissionModalOpen: (open: boolean) => void;
  registerIcebergModalOpen: boolean;
  setRegisterIcebergModalOpen: (open: boolean) => void;
  sensorCalibrationModalOpen: boolean;
  setSensorCalibrationModalOpen: (open: boolean) => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  vesselModalOpen: boolean;
  setVesselModalOpen: (open: boolean) => void;
  systemStatusOpen: boolean;
  setSystemStatusOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  recalculateModalOpen: boolean;
  setRecalculateModalOpen: (open: boolean) => void;

  // Feedback Systems: Toasts & Confirm Dialogs
  toasts: ToastItem[];
  addToast: (title: string, message: string, type?: ToastItem['type'], duration?: number, action?: ToastItem['action']) => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogConfig | null;
  showConfirmDialog: (config: Omit<ConfirmDialogConfig, 'isOpen'>) => void;
  closeConfirmDialog: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Accent Theme
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('iceway_accent') as AccentColor;
    return saved && ['cyan', 'emerald', 'violet', 'amber'].includes(saved) ? saved : 'cyan';
  });

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('iceway_accent', color);
    document.documentElement.setAttribute('data-accent', color);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  // Operational Entities with LocalStorage Persistence
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('iceway_missions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return MISSIONS_LIST;
  });

  const [currentMission, setCurrentMission] = useState<Mission>(missions[0] || MISSIONS_LIST[0]);

  useEffect(() => {
    localStorage.setItem('iceway_missions', JSON.stringify(missions));
  }, [missions]);

  const [vessel, setVessel] = useState<Vessel>(INITIAL_VESSEL);

  const [icebergs, setIcebergs] = useState<Iceberg[]>(() => {
    try {
      const saved = localStorage.getItem('iceway_icebergs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ICEBERGS;
  });

  useEffect(() => {
    localStorage.setItem('iceway_icebergs', JSON.stringify(icebergs));
  }, [icebergs]);

  const [stations] = useState<ResearchStation[]>(RESEARCH_STATIONS);
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [selectedStation, setSelectedStation] = useState<ResearchStation | null>(null);

  // Routes State
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([
    ROUTE_BALANCED,
    ROUTE_FUEL_EFFICIENT,
    ROUTE_SAFETY_PRIORITY,
  ]);
  const [activeRoute, setActiveRoute] = useState<RouteOption>(ROUTE_BALANCED);

  // Environmental Data State
  const [seaIce, setSeaIce] = useState<SeaIceData>(INITIAL_SEA_ICE);
  const [weather] = useState<WeatherOceanData>(INITIAL_WEATHER_OCEAN);

  // Settings & Profile
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile>(() => {
    try {
      const saved = localStorage.getItem('iceway_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_OFFICER_PROFILE;
  });

  const updateOfficerProfile = (updates: Partial<OfficerProfile>) => {
    setOfficerProfile((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('iceway_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const [settings, setSettings] = useState<OperationalSettings>(() => {
    try {
      const saved = localStorage.getItem('iceway_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (updates: Partial<OperationalSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('iceway_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep max 50
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
    addToast('Activity Feed Cleared', 'Historical telemetry events have been purged.', 'info');
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: ToastItem['type'] = 'info',
    duration = 4000,
    action?: ToastItem['action']
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, title, message, type, duration, action };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);

  const showConfirmDialog = (config: Omit<ConfirmDialogConfig, 'isOpen'>) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // Modals
  const [newMissionModalOpen, setNewMissionModalOpen] = useState(false);
  const [registerIcebergModalOpen, setRegisterIcebergModalOpen] = useState(false);
  const [sensorCalibrationModalOpen, setSensorCalibrationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [vesselModalOpen, setVesselModalOpen] = useState(false);
  const [systemStatusOpen, setSystemStatusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recalculateModalOpen, setRecalculateModalOpen] = useState(false);

  // Simulation State
  const [simulation, setSimulation] = useState<SimulationState>({
    active: false,
    timeStep: 0,
    isPlaying: false,
    intersectionAlertDismissed: false,
    routeRecalculated: false,
    isRecalculating: false,
    recalculationProgress: 0,
    recalculationStepIndex: 0,
  });

  // Simulation auto-timer
  useEffect(() => {
    if (!simulation.active || !simulation.isPlaying) return;

    const timer = setInterval(() => {
      setSimulation((prev) => {
        const nextSteps: (0 | 6 | 12 | 18 | 24)[] = [0, 6, 12, 18, 24];
        const currentIndex = nextSteps.indexOf(prev.timeStep);
        const nextIndex = (currentIndex + 1) % nextSteps.length;
        const nextStep = nextSteps[nextIndex];

        const matchedForecast = seaIce.forecast.find((f) => f.tHours === nextStep);
        if (matchedForecast) {
          setSeaIce((si) => ({ ...si, currentConcentrationPct: matchedForecast.concentrationPct }));
        }

        return { ...prev, timeStep: nextStep };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [simulation.active, simulation.isPlaying, seaIce.forecast]);

  const handleToggleSimulation = () => {
    setSimulation((prev) => {
      const willBeActive = !prev.active;
      if (willBeActive) {
        addToast('Simulation Mode Online', 'Temporal prediction engine loaded. Advancing to T+12h intercept.', 'warning');
      } else {
        addToast('Real-time Mode Restored', 'Synchronized with live Polar AIS and SAR feeds.', 'info');
      }
      return {
        ...prev,
        active: willBeActive,
        timeStep: willBeActive ? 12 : 0,
        isPlaying: false,
      };
    });
  };

  const handleSetSimulationStep = (step: 0 | 6 | 12 | 18 | 24) => {
    setSimulation((prev) => ({ ...prev, timeStep: step }));
    const matchedForecast = seaIce.forecast.find((f) => f.tHours === step);
    if (matchedForecast) {
      setSeaIce((si) => ({ ...si, currentConcentrationPct: matchedForecast.concentrationPct }));
    }
  };

  const handleResetSimulation = () => {
    setSimulation({
      active: true,
      timeStep: 0,
      isPlaying: false,
      intersectionAlertDismissed: false,
      routeRecalculated: false,
      isRecalculating: false,
      recalculationProgress: 0,
      recalculationStepIndex: 0,
    });
    setActiveRoute(ROUTE_BALANCED);
    setAvailableRoutes([ROUTE_BALANCED, ROUTE_FUEL_EFFICIENT, ROUTE_SAFETY_PRIORITY]);
    setSeaIce((si) => ({ ...si, currentConcentrationPct: 34 }));
    addToast('Simulation Reset', 'Navigational parameters restored to T+00h baseline.', 'info');
  };

  const handleApplyRecalculatedRoute = () => {
    const updatedRoutes = [
      ROUTE_RECALCULATED_AVOIDANCE,
      ROUTE_BALANCED,
      ROUTE_FUEL_EFFICIENT,
      ROUTE_SAFETY_PRIORITY,
    ];
    setAvailableRoutes(updatedRoutes);
    setActiveRoute(ROUTE_RECALCULATED_AVOIDANCE);
    setSimulation((prev) => ({
      ...prev,
      routeRecalculated: true,
    }));
    addToast(
      'Avoidance Corridor Engaged',
      'Route 07-R waypoint sequence loaded into autopilot. Clearance margin: 4.8 NM.',
      'success',
      5000
    );
    addActivityLog({
      severity: 'success',
      source: 'AUTOPILOT',
      message: 'Dynamic Route Recalculation applied: Avoidance Corridor engaged.',
      details: 'Iceberg B-31 CPA increased from 0.8 NM to 4.8 NM.',
    });
  };

  // Missions CRUD
  const addMission = (missionData: Omit<Mission, 'id'>) => {
    const newId = `mission-${Date.now()}`;
    const newMission: Mission = {
      ...missionData,
      id: newId,
    };
    setMissions((prev) => [newMission, ...prev]);
    setCurrentMission(newMission);
    addToast('Mission Registered', `${newMission.missionNumber} — ${newMission.title} added to active roster.`, 'success');
    addActivityLog({
      severity: 'info',
      source: 'IMO_COMPLIANCE',
      message: `Expedition Voyage registered: ${newMission.missionNumber} to ${newMission.destinationName}.`,
      details: `Vessel: ${newMission.vesselName} | Risk Category: ${newMission.riskLevel}`,
    });
  };

  const updateMission = (id: string, updates: Partial<Mission>) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (currentMission.id === id) {
            setCurrentMission(updated);
          }
          return updated;
        }
        return m;
      })
    );
    addToast('Mission Updated', 'Expedition record parameters successfully saved.', 'info');
  };

  const deleteMission = (id: string) => {
    const target = missions.find((m) => m.id === id);
    if (!target) return;

    showConfirmDialog({
      title: 'Delete Expedition Mission',
      message: `Are you sure you want to permanently delete "${target.missionNumber} — ${target.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete Mission',
      isDanger: true,
      onConfirm: () => {
        setMissions((prev) => {
          const filtered = prev.filter((m) => m.id !== id);
          if (currentMission.id === id && filtered.length > 0) {
            setCurrentMission(filtered[0]);
          }
          return filtered;
        });
        closeConfirmDialog();
        addToast('Mission Deleted', `${target.missionNumber} removed from operational registry.`, 'warning');
        addActivityLog({
          severity: 'warning',
          source: 'MANUAL',
          message: `Mission record deleted: ${target.missionNumber}.`,
        });
      },
    });
  };

  const bulkDeleteMissions = (ids: string[]) => {
    showConfirmDialog({
      title: `Delete ${ids.length} Missions`,
      message: `Are you sure you want to permanently delete ${ids.length} selected expedition missions from the database?`,
      confirmLabel: `Delete ${ids.length} Records`,
      isDanger: true,
      onConfirm: () => {
        setMissions((prev) => {
          const filtered = prev.filter((m) => !ids.includes(m.id));
          if (ids.includes(currentMission.id) && filtered.length > 0) {
            setCurrentMission(filtered[0]);
          }
          return filtered;
        });
        closeConfirmDialog();
        addToast('Batch Deletion Completed', `Removed ${ids.length} expedition missions.`, 'warning');
      },
    });
  };

  const bulkUpdateMissionStatus = (ids: string[], status: 'Active' | 'Completed' | 'Planned') => {
    setMissions((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, status } : m))
    );
    addToast('Status Updated', `Batch updated ${ids.length} missions to "${status}".`, 'success');
  };

  const exportMissions = (format: 'csv' | 'json', selectedIds?: string[]) => {
    const exportData = selectedIds && selectedIds.length > 0
      ? missions.filter((m) => selectedIds.includes(m.id))
      : missions;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `iceway_missions_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['MissionNumber', 'Title', 'Vessel', 'Destination', 'Status', 'RiskLevel', 'DepartureDate', 'TotalKm', 'RemainingKm', 'ScientificTeam'];
      const rows = exportData.map((m) => [
        `"${m.missionNumber}"`,
        `"${m.title}"`,
        `"${m.vesselName}"`,
        `"${m.destinationName}"`,
        `"${m.status}"`,
        `"${m.riskLevel}"`,
        `"${m.departureDate}"`,
        m.distanceTotalKm,
        m.distanceRemainingKm,
        `"${m.scientificTeam.replace(/"/g, '""')}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `iceway_missions_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    addToast('Data Export Complete', `Generated ${format.toUpperCase()} export for ${exportData.length} records.`, 'success');
  };

  // Icebergs CRUD
  const addIceberg = (icebergData: Omit<Iceberg, 'id' | 'trajectory'>) => {
    const newId = `iceberg-${Date.now()}`;
    const syntheticTrajectory = [
      {
        tHours: 0,
        timeLabel: 'NOW',
        lat: icebergData.lat,
        lon: icebergData.lon,
        uncertaintyRadiusKm: 0.5,
        confidencePct: 96,
        driftSpeedMs: (icebergData.velocityMs),
      },
      {
        tHours: 6,
        timeLabel: '+6H',
        lat: icebergData.lat - 0.08,
        lon: icebergData.lon - 0.12,
        uncertaintyRadiusKm: 1.2,
        confidencePct: 88,
        driftSpeedMs: icebergData.velocityMs,
      },
      {
        tHours: 12,
        timeLabel: '+12H',
        lat: icebergData.lat - 0.15,
        lon: icebergData.lon - 0.22,
        uncertaintyRadiusKm: 2.1,
        confidencePct: 78,
        driftSpeedMs: icebergData.velocityMs * 0.95,
      },
      {
        tHours: 24,
        timeLabel: '+24H',
        lat: icebergData.lat - 0.28,
        lon: icebergData.lon - 0.45,
        uncertaintyRadiusKm: 3.5,
        confidencePct: 65,
        driftSpeedMs: icebergData.velocityMs * 0.9,
      },
    ];

    const newIceberg: Iceberg = {
      ...icebergData,
      id: newId,
      trajectory: syntheticTrajectory,
    };

    setIcebergs((prev) => [newIceberg, ...prev]);
    setSelectedIceberg(newIceberg);
    addToast(
      'Radar Contact Registered',
      `${newIceberg.name} added to acoustic & radar collision tracking system.`,
      newIceberg.riskLevel === 'HIGH' ? 'error' : 'warning'
    );
    addActivityLog({
      severity: newIceberg.riskLevel === 'HIGH' ? 'critical' : 'warning',
      source: 'RADAR',
      message: `Manual Radar Anomaly tagged: ${newIceberg.name} at ${newIceberg.lat.toFixed(2)}°S, ${newIceberg.lon.toFixed(2)}°E.`,
      details: `Type: ${newIceberg.type} | Draft: ${newIceberg.draftMeters}m | Heading: ${newIceberg.headingDeg}°`,
    });
  };

  const deleteIceberg = (id: string) => {
    const target = icebergs.find((i) => i.id === id);
    if (!target) return;

    showConfirmDialog({
      title: 'Dismiss Radar Target',
      message: `Are you sure you want to dismiss ${target.name} from radar tracking? Active proximity alerts will be cancelled.`,
      confirmLabel: 'Dismiss Contact',
      isDanger: true,
      onConfirm: () => {
        setIcebergs((prev) => prev.filter((i) => i.id !== id));
        if (selectedIceberg?.id === id) {
          setSelectedIceberg(null);
        }
        closeConfirmDialog();
        addToast('Contact Dismissed', `${target.name} removed from tracking matrix.`, 'info');
      },
    });
  };

  const exportIcebergs = (format: 'csv' | 'json', selectedIds?: string[]) => {
    const exportData = selectedIds && selectedIds.length > 0
      ? icebergs.filter((i) => selectedIds.includes(i.id))
      : icebergs;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `iceway_icebergs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Name', 'Type', 'RiskLevel', 'Latitude', 'Longitude', 'SizeKm', 'DriftHeading', 'DraftMeters', 'ConfidencePct'];
      const rows = exportData.map((i) => [
        `"${i.name}"`,
        `"${i.type}"`,
        `"${i.riskLevel}"`,
        i.lat,
        i.lon,
        i.estimatedSizeKm,
        i.headingDeg,
        i.draftMeters,
        i.trajectoryConfidencePct,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `iceway_icebergs_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    addToast('Iceberg Data Exported', `Generated ${format.toUpperCase()} export for ${exportData.length} hazard contacts.`, 'success');
  };

  const updateVessel = (updates: Partial<Vessel>) => {
    setVessel((prev) => ({ ...prev, ...updates }));
    addToast('Vessel Telemetry Calibrated', 'Shipboard sensors updated successfully.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        accentColor,
        setAccentColor,
        missions,
        currentMission,
        setCurrentMission,
        addMission,
        updateMission,
        deleteMission,
        bulkDeleteMissions,
        bulkUpdateMissionStatus,
        exportMissions,
        vessel,
        updateVessel,
        icebergs,
        selectedIceberg,
        setSelectedIceberg,
        addIceberg,
        deleteIceberg,
        exportIcebergs,
        stations,
        selectedStation,
        setSelectedStation,
        availableRoutes,
        activeRoute,
        setActiveRoute,
        setAvailableRoutes,
        seaIce,
        setSeaIce,
        weather,
        simulation,
        setSimulation,
        handleToggleSimulation,
        handleSetSimulationStep,
        handleResetSimulation,
        handleApplyRecalculatedRoute,
        activityLogs,
        addActivityLog,
        clearActivityLogs,
        officerProfile,
        updateOfficerProfile,
        settings,
        updateSettings,
        newMissionModalOpen,
        setNewMissionModalOpen,
        registerIcebergModalOpen,
        setRegisterIcebergModalOpen,
        sensorCalibrationModalOpen,
        setSensorCalibrationModalOpen,
        exportModalOpen,
        setExportModalOpen,
        vesselModalOpen,
        setVesselModalOpen,
        systemStatusOpen,
        setSystemStatusOpen,
        settingsOpen,
        setSettingsOpen,
        recalculateModalOpen,
        setRecalculateModalOpen,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

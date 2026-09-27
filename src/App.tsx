/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Vessel,
  Iceberg,
  ResearchStation,
  RouteOption,
  Mission,
  SimulationState,
  SeaIceData,
  WeatherOceanData,
} from './types/navigation';
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
} from './data/mockAntarcticData';

import { TopHeader } from './components/layout/TopHeader';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { RoutePlannerView } from './components/navigation/RoutePlannerView';
import { SeaIceView } from './components/seaice/SeaIceView';
import { IcebergsView } from './components/icebergs/IcebergsView';
import { WeatherOceanView } from './components/weather/WeatherOceanView';
import { MissionsView } from './components/missions/MissionsView';
import { ReportsView } from './components/reports/ReportsView';
import { SimulationControls } from './components/simulation/SimulationControls';
import { RouteRecalculateModal } from './components/simulation/RouteRecalculateModal';
import { VesselModal } from './components/dashboard/VesselModal';
import { SystemStatusModal } from './components/modals/SystemStatusModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Operational State
  const [currentMission, setCurrentMission] = useState<Mission>(MISSIONS_LIST[0]);
  const [vessel, setVessel] = useState<Vessel>(INITIAL_VESSEL);
  const [icebergs, setIcebergs] = useState<Iceberg[]>(INITIAL_ICEBERGS);
  const [stations] = useState<ResearchStation[]>(RESEARCH_STATIONS);
  
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

  // Inspection Selections
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [selectedStation, setSelectedStation] = useState<ResearchStation | null>(null);

  // Modal Dialogs
  const [vesselModalOpen, setVesselModalOpen] = useState<boolean>(false);
  const [systemStatusOpen, setSystemStatusOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [recalculateModalOpen, setRecalculateModalOpen] = useState<boolean>(false);

  // Configurable Settings
  const [safetyMarginNm, setSafetyMarginNm] = useState<number>(3.0);

  // Simulation Mode State (T+00 to T+24)
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

  // Auto-advance simulation timer if isPlaying
  useEffect(() => {
    if (!simulation.active || !simulation.isPlaying) return;

    const timer = setInterval(() => {
      setSimulation((prev) => {
        const nextSteps: (0 | 6 | 12 | 18 | 24)[] = [0, 6, 12, 18, 24];
        const currentIndex = nextSteps.indexOf(prev.timeStep);
        const nextIndex = (currentIndex + 1) % nextSteps.length;
        const nextStep = nextSteps[nextIndex];

        // Also sync sea ice concentration with forecast horizon
        const matchedForecast = seaIce.forecast.find((f) => f.tHours === nextStep);
        if (matchedForecast) {
          setSeaIce((si) => ({ ...si, currentConcentrationPct: matchedForecast.concentrationPct }));
        }

        return { ...prev, timeStep: nextStep };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [simulation.active, simulation.isPlaying, seaIce.forecast]);

  // Toggle Simulation Mode
  const handleToggleSimulation = () => {
    setSimulation((prev) => {
      const willBeActive = !prev.active;
      return {
        ...prev,
        active: willBeActive,
        timeStep: willBeActive ? 12 : 0, // Auto-jump to T+12 on first toggle to highlight the key decision scenario
        isPlaying: false,
      };
    });
  };

  const handleSetSimulationStep = (step: 0 | 6 | 12 | 18 | 24) => {
    setSimulation((prev) => ({ ...prev, timeStep: step }));
    // Synchronize sea-ice concentration with forecast
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
    // Reset route back to original balanced route
    setActiveRoute(ROUTE_BALANCED);
    setAvailableRoutes([ROUTE_BALANCED, ROUTE_FUEL_EFFICIENT, ROUTE_SAFETY_PRIORITY]);
    setSeaIce((si) => ({ ...si, currentConcentrationPct: 34 }));
  };

  // Trigger Recalculate Sequence
  const handleRecalculateClick = () => {
    setRecalculateModalOpen(true);
  };

  // Apply Recalculated Avoidance Corridor (Demo Flow Step 7 & 8)
  const handleApplyRecalculatedRoute = () => {
    // Add Avoidance Corridor to available routes and make it active
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
  };

  // Switch mission
  const handleSelectMission = (mission: Mission) => {
    setCurrentMission(mission);
    if (mission.id === 'mission-06') {
      // Maitri route
      setActiveRoute({
        ...ROUTE_BALANCED,
        name: 'ROUTE 06-M',
        displayName: 'Route 06 — India Bay / Maitri Ingress',
        distanceKm: 1240,
        distanceNm: 669.5,
        etaFormatted: 'Completed',
        riskScore: 14,
      });
    } else {
      setActiveRoute(ROUTE_BALANCED);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#071018] text-[#E8F0F3] select-none font-mono antialiased">
      {/* 1. Top Header */}
      <TopHeader
        currentMission={currentMission}
        missions={MISSIONS_LIST}
        onSelectMission={handleSelectMission}
        simulation={simulation}
        onToggleSimulation={handleToggleSimulation}
        onSetSimulationStep={handleSetSimulationStep}
        onResetSimulation={handleResetSimulation}
        onOpenVesselModal={() => setVesselModalOpen(true)}
        onOpenSystemStatus={() => setSystemStatusOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* 2. Simulation Floating Control Bar (when simulation is active) */}
      <SimulationControls
        simulation={simulation}
        onStepChange={handleSetSimulationStep}
        onTogglePlay={() => setSimulation((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
        onReset={handleResetSimulation}
        onRecalculateClick={handleRecalculateClick}
        onClose={() => setSimulation((prev) => ({ ...prev, active: false }))}
      />

      {/* 3. Main Workspace with Sidebar & Tab Views */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Operational Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenSystemStatus={() => setSystemStatusOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          icebergAlertCount={simulation.active && simulation.timeStep >= 12 && !simulation.routeRecalculated ? 1 : 0}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenMobile={() => setMobileMenuOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative pb-12 lg:pb-0">
          {activeTab === 'overview' && (
            <OverviewView
              currentMission={currentMission}
              vessel={vessel}
              activeRoute={activeRoute}
              availableRoutes={availableRoutes}
              icebergs={icebergs}
              stations={stations}
              selectedIceberg={selectedIceberg}
              onSelectIceberg={setSelectedIceberg}
              onSelectStation={setSelectedStation}
              onSelectVessel={() => setVesselModalOpen(true)}
              simulation={simulation}
              seaIce={seaIce}
              weather={weather}
              onOpenRoutePlanner={() => setActiveTab('navigation')}
              onRecalculateClick={handleRecalculateClick}
              onOpenIcebergsTab={() => setActiveTab('icebergs')}
              onOpenWeatherTab={() => setActiveTab('weather')}
              onOpenSeaIceTab={() => setActiveTab('seaice')}
              onOpenVesselModal={() => setVesselModalOpen(true)}
            />
          )}

          {activeTab === 'navigation' && (
            <RoutePlannerView
              vessel={vessel}
              stations={stations}
              activeRoute={activeRoute}
              availableRoutes={availableRoutes}
              onSelectRoute={setActiveRoute}
              simulation={simulation}
              icebergs={icebergs}
              seaIceConcentrationPct={seaIce.currentConcentrationPct}
            />
          )}

          {activeTab === 'seaice' && (
            <SeaIceView
              seaIce={seaIce}
              vessel={vessel}
              icebergs={icebergs}
              stations={stations}
              activeRoute={activeRoute}
              alternativeRoutes={availableRoutes.filter((r) => r.id !== activeRoute.id)}
              simulation={simulation}
              onSetSeaIceConcentration={(conc) =>
                setSeaIce((prev) => ({ ...prev, currentConcentrationPct: conc }))
              }
            />
          )}

          {activeTab === 'icebergs' && (
            <IcebergsView
              icebergs={icebergs}
              selectedIceberg={selectedIceberg}
              onSelectIceberg={setSelectedIceberg}
              vessel={vessel}
              stations={stations}
              activeRoute={activeRoute}
              alternativeRoutes={availableRoutes.filter((r) => r.id !== activeRoute.id)}
              simulation={simulation}
              seaIceConcentrationPct={seaIce.currentConcentrationPct}
              onRecalculateRoute={handleRecalculateClick}
              onNavigateToNavigationTab={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherOceanView weather={weather} vessel={vessel} />
          )}

          {activeTab === 'missions' && (
            <MissionsView
              missions={MISSIONS_LIST}
              currentMission={currentMission}
              onSelectMission={(m) => {
                handleSelectMission(m);
                setActiveTab('overview');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              mission={currentMission}
              vessel={vessel}
              activeRoute={activeRoute}
              seaIce={seaIce}
              weather={weather}
              routeRecalculated={simulation.routeRecalculated}
            />
          )}
        </main>
      </div>

      {/* 4. Modals */}
      <VesselModal
        vessel={vessel}
        isOpen={vesselModalOpen}
        onClose={() => setVesselModalOpen(false)}
      />

      <SystemStatusModal
        isOpen={systemStatusOpen}
        onClose={() => setSystemStatusOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        safetyMarginNm={safetyMarginNm}
        onSetSafetyMargin={setSafetyMarginNm}
      />

      <RouteRecalculateModal
        isOpen={recalculateModalOpen}
        onClose={() => setRecalculateModalOpen(false)}
        onApplyRecalculatedRoute={handleApplyRecalculatedRoute}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
import { NewMissionModal } from './components/modals/NewMissionModal';
import { RegisterIcebergModal } from './components/modals/RegisterIcebergModal';
import { SensorCalibrationModal } from './components/modals/SensorCalibrationModal';
import { DataExportModal } from './components/modals/DataExportModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmationModal } from './components/common/ConfirmationModal';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    missions,
    currentMission,
    setCurrentMission,
    vessel,
    icebergs,
    selectedIceberg,
    setSelectedIceberg,
    stations,
    selectedStation,
    setSelectedStation,
    availableRoutes,
    activeRoute,
    setActiveRoute,
    seaIce,
    setSeaIce,
    weather,
    simulation,
    setSimulation,
    handleToggleSimulation,
    handleSetSimulationStep,
    handleResetSimulation,
    handleApplyRecalculatedRoute,
    vesselModalOpen,
    setVesselModalOpen,
    systemStatusOpen,
    setSystemStatusOpen,
    settingsOpen,
    setSettingsOpen,
    recalculateModalOpen,
    setRecalculateModalOpen,
    settings,
    updateSettings,
  } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#060b11] text-[#E8F0F3] select-none font-mono antialiased">
      {/* 1. Top Header */}
      <TopHeader
        currentMission={currentMission}
        missions={missions}
        onSelectMission={(m) => setCurrentMission(m)}
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
        onRecalculateClick={() => setRecalculateModalOpen(true)}
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
              onRecalculateClick={() => setRecalculateModalOpen(true)}
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
              onRecalculateRoute={() => setRecalculateModalOpen(true)}
              onNavigateToNavigationTab={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherOceanView weather={weather} vessel={vessel} />
          )}

          {activeTab === 'missions' && <MissionsView />}

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

      {/* 4. Dynamic Modals & Drawers */}
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
        safetyMarginNm={settings.safetyMarginNm}
        onSetSafetyMargin={(margin) => updateSettings({ safetyMarginNm: margin })}
      />

      <RouteRecalculateModal
        isOpen={recalculateModalOpen}
        onClose={() => setRecalculateModalOpen(false)}
        onApplyRecalculatedRoute={handleApplyRecalculatedRoute}
      />

      <NewMissionModal />
      <RegisterIcebergModal />
      <SensorCalibrationModal />
      <DataExportModal />

      {/* 5. Feedback Systems: Toasts & Confirmation Dialogs */}
      <ToastContainer />
      <ConfirmationModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

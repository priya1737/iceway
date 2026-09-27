import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Mission } from '../../types/navigation';
import {
  Ship,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const MissionsView: React.FC = () => {
  const {
    missions,
    currentMission,
    setCurrentMission,
    deleteMission,
    bulkDeleteMissions,
    bulkUpdateMissionStatus,
    exportMissions,
    setNewMissionModalOpen,
    setActiveTab,
    addToast,
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Planned' | 'Completed'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'Low' | 'Moderate' | 'High'>('ALL');
  const [vesselFilter, setVesselFilter] = useState<string>('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<keyof Mission>('missionNumber');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique vessels for dropdown
  const uniqueVessels = useMemo(() => {
    return Array.from(new Set(missions.map((m) => m.vesselName)));
  }, [missions]);

  // Filtered & Sorted Missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      // Text Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        m.missionNumber.toLowerCase().includes(searchLower) ||
        m.title.toLowerCase().includes(searchLower) ||
        m.destinationName.toLowerCase().includes(searchLower) ||
        m.vesselName.toLowerCase().includes(searchLower) ||
        m.objective.toLowerCase().includes(searchLower) ||
        m.scientificTeam.toLowerCase().includes(searchLower);

      // Status Filter
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

      // Risk Filter
      const matchesRisk = riskFilter === 'ALL' || m.riskLevel === riskFilter;

      // Vessel Filter
      const matchesVessel = vesselFilter === 'ALL' || m.vesselName === vesselFilter;

      return matchesSearch && matchesStatus && matchesRisk && matchesVessel;
    });
  }, [missions, searchTerm, statusFilter, riskFilter, vesselFilter]);

  const sortedMissions = useMemo(() => {
    return [...filteredMissions].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredMissions, sortField, sortAsc]);

  // Paginated Slice
  const totalPages = Math.ceil(sortedMissions.length / pageSize) || 1;
  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedMissions.slice(start, start + pageSize);
  }, [sortedMissions, currentPage, pageSize]);

  const handleSort = (field: keyof Mission) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedMissions.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRiskFilter('ALL');
    setVesselFilter('ALL');
    setCurrentPage(1);
    addToast('Filters Cleared', 'Displaying all recorded missions.', 'info');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#060b11] p-3 sm:p-5 lg:p-6 font-mono space-y-4">
      {/* 1. Header with Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1B2A35] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#111e2a] border border-[#1B2A35] flex items-center justify-center text-cyan-400 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#E8F0F3] tracking-wide">
              EXPEDITION VOYAGE REGISTRY
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#91A4AE]">
              National Centre for Polar and Ocean Research (NCPOR) & IMO Polar Code Voyage Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportMissions('csv')}
            className="px-3 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] bg-[#0B1721] border border-[#1B2A35] hover:border-cyan-500/40 flex items-center gap-1.5 transition cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={() => setNewMissionModalOpen(true)}
            className="px-3.5 py-1.5 rounded text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center gap-1.5 shadow-lg shadow-cyan-900/40 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Mission
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Multi-parameter Filters */}
      <div className="p-3.5 rounded-xl bg-[#0B1721]/80 border border-[#1B2A35] glass-panel space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#60737E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by mission code, title, destination, vessel, or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-[#071018] border border-[#1B2A35] rounded-lg text-xs text-[#E8F0F3] placeholder-[#60737E] focus:outline-none focus:border-cyan-400 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-[#60737E] hover:text-[#E8F0F3] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status selector */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded-lg text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">Status: All Records</option>
              <option value="Active">Status: Active Only</option>
              <option value="Planned">Status: Planned Only</option>
              <option value="Completed">Status: Completed Only</option>
            </select>
          </div>

          {/* Vessel selector */}
          <div className="sm:col-span-3">
            <select
              value={vesselFilter}
              onChange={(e) => {
                setVesselFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#071018] border border-[#1B2A35] rounded-lg text-xs text-[#E8F0F3] focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">Vessel: All Ships</option>
              {uniqueVessels.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1B2A35]/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#60737E] uppercase font-semibold mr-1">Risk Tier:</span>
            {(['ALL', 'Low', 'Moderate', 'High'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setRiskFilter(lvl);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  riskFilter === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#071018] text-[#91A4AE] border border-[#1B2A35] hover:text-[#E8F0F3]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#91A4AE]">
            <span>
              Showing <strong className="text-[#E8F0F3]">{filteredMissions.length}</strong> of{' '}
              <strong className="text-[#E8F0F3]">{missions.length}</strong> missions
            </span>
            {(searchTerm || statusFilter !== 'ALL' || riskFilter !== 'ALL' || vesselFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Floating Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 px-4 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{selectedIds.length} missions selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkUpdateMissionStatus(selectedIds, 'Active')}
              className="px-2.5 py-1 rounded bg-[#0B1721] hover:bg-[#152535] text-emerald-400 border border-emerald-500/30 text-[11px] font-bold cursor-pointer"
            >
              Mark Active
            </button>
            <button
              onClick={() => bulkUpdateMissionStatus(selectedIds, 'Completed')}
              className="px-2.5 py-1 rounded bg-[#0B1721] hover:bg-[#152535] text-[#91A4AE] border border-[#1B2A35] text-[11px] font-bold cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={() => exportMissions('csv', selectedIds)}
              className="px-2.5 py-1 rounded bg-[#0B1721] hover:bg-[#152535] text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export Selected
            </button>
            <button
              onClick={() => bulkDeleteMissions(selectedIds)}
              className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* 4. Interactive Data Management Table / Mobile Cards */}
      {paginatedMissions.length === 0 ? (
        <div className="p-8 rounded-xl bg-[#0B1721] border border-[#1B2A35] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#152535] flex items-center justify-center text-[#60737E] mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#E8F0F3]">No Missions Match Active Criteria</h3>
          <p className="text-xs text-[#91A4AE] max-w-md mx-auto">
            Try adjusting your search query, status filters, or vessel selection to view other expedition records.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 rounded text-xs font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 hover:bg-cyan-900/60 transition cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={() => setNewMissionModalOpen(true)}
              className="px-4 py-1.5 rounded text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer"
            >
              Register New Mission
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="md:hidden space-y-3">
            {paginatedMissions.map((m) => {
              const isActive = m.id === currentMission.id;
              const isSelected = selectedIds.includes(m.id);

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border transition glass-card ${
                    isActive
                      ? 'border-cyan-500 bg-[#0B1721]/90 shadow-md shadow-cyan-500/10'
                      : 'border-[#1B2A35] bg-[#0B1721]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(m.id)}
                        className="rounded accent-cyan-500 cursor-pointer"
                      />
                      <span className="font-bold text-xs text-[#E8F0F3]">{m.missionNumber}</span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-[#071018] font-bold">
                          ACTIVE VESSEL
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        m.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : m.status === 'Planned'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-[#60737E]/10 text-[#91A4AE] border-[#1B2A35]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#E8F0F3] mb-1">{m.title}</h3>
                  <div className="text-[11px] text-cyan-400 font-semibold mb-2">{m.destinationName}</div>
                  <p className="text-[10px] text-[#91A4AE] mb-3 leading-snug line-clamp-2">{m.objective}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#91A4AE] pt-2 border-t border-[#1B2A35]/60 mb-3">
                    <div>
                      <span className="text-[#60737E] block uppercase">Vessel:</span>
                      <span className="text-[#E8F0F3] font-semibold">{m.vesselName}</span>
                    </div>
                    <div>
                      <span className="text-[#60737E] block uppercase">Distance:</span>
                      <span className="text-[#E8F0F3] font-semibold">{m.distanceTotalKm} km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1B2A35]/60">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        m.riskLevel === 'High'
                          ? 'text-red-400 bg-red-950/40 border border-red-900/40'
                          : m.riskLevel === 'Moderate'
                          ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40'
                          : 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40'
                      }`}
                    >
                      Risk: {m.riskLevel}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentMission(m);
                          setActiveTab('overview');
                        }}
                        className="px-2.5 py-1 rounded bg-[#152535] text-cyan-300 hover:bg-[#20364a] text-[11px] font-bold transition cursor-pointer"
                      >
                        Select →
                      </button>
                      <button
                        onClick={() => deleteMission(m.id)}
                        className="p-1 rounded text-[#91A4AE] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete Mission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block rounded-xl bg-[#0B1721] border border-[#1B2A35] overflow-hidden glass-card shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1B2A35] bg-[#071018] text-[10px] text-[#60737E] uppercase tracking-wider">
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          paginatedMissions.length > 0 &&
                          paginatedMissions.every((m) => selectedIds.includes(m.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded accent-cyan-500 cursor-pointer"
                      />
                    </th>

                    <th
                      onClick={() => handleSort('missionNumber')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Mission</span>
                        {sortField === 'missionNumber' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('status')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('vesselName')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Vessel</span>
                        {sortField === 'vesselName' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('destinationName')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Destination</span>
                        {sortField === 'destinationName' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('departureDate')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Departure</span>
                        {sortField === 'departureDate' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('distanceTotalKm')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Distance</span>
                        {sortField === 'distanceTotalKm' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('riskLevel')}
                      className="py-3 px-3 cursor-pointer hover:text-[#E8F0F3] transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Risk</span>
                        {sortField === 'riskLevel' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1B2A35]/50">
                  {paginatedMissions.map((m) => {
                    const isActiveMission = m.id === currentMission.id;
                    const isSelected = selectedIds.includes(m.id);

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-[#152535]/40 transition group ${
                          isActiveMission ? 'bg-[#152535]/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(m.id)}
                            className="rounded accent-cyan-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-3 font-medium text-[#E8F0F3]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{m.missionNumber}</span>
                            {isActiveMission && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-[#071018] font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#91A4AE] truncate max-w-xs">{m.title}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                              m.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : m.status === 'Planned'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-[#60737E]/10 text-[#91A4AE] border-[#1B2A35]'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[#E8F0F3] font-semibold">{m.vesselName}</td>

                        <td className="py-3 px-3 text-cyan-300 font-medium">{m.destinationName}</td>

                        <td className="py-3 px-3 text-[#91A4AE] font-mono text-[11px]">{m.departureDate}</td>

                        <td className="py-3 px-3 text-[#E8F0F3] font-mono">{m.distanceTotalKm} km</td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              m.riskLevel === 'High'
                                ? 'text-red-400 bg-red-950/40 border border-red-900/40'
                                : m.riskLevel === 'Moderate'
                                ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40'
                                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40'
                            }`}
                          >
                            {m.riskLevel}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCurrentMission(m);
                                setActiveTab('overview');
                                addToast('Mission Loaded', `Bridge active mission switched to ${m.missionNumber}.`, 'info');
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                isActiveMission
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-[#152535] text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#20364a]'
                              }`}
                              title="Engage this mission in bridge overview"
                            >
                              {isActiveMission ? 'Engaged' : 'Select'}
                            </button>

                            <button
                              onClick={() => deleteMission(m.id)}
                              className="p-1 rounded text-[#60737E] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                              title="Delete Mission Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Pagination Controls */}
          <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs glass-panel">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#91A4AE]">
                Page <strong className="text-[#E8F0F3]">{currentPage}</strong> of{' '}
                <strong className="text-[#E8F0F3]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#60737E]">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-[#071018] border border-[#1B2A35] rounded text-xs text-[#E8F0F3] focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-[#071018] border border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3] disabled:opacity-40 transition cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded text-xs font-bold transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                      : 'bg-[#071018] text-[#91A4AE] hover:text-[#E8F0F3] border border-[#1B2A35]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-[#071018] border border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3] disabled:opacity-40 transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

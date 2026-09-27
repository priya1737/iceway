import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Square,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Layers,
  Activity,
  Sliders,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Radio,
  FileCode,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EnginePipeline,
  PipelineStep,
  EngineLogEntry,
  PipelineStatus,
  RouteOption,
} from '../../types/navigation';

export const ProcessingEngineView: React.FC = () => {
  const {
    activeRoute,
    setActiveRoute,
    availableRoutes,
    setAvailableRoutes,
    seaIce,
    vessel,
    icebergs,
    addIceberg,
    addToast,
    setActiveTab,
  } = useApp();

  // Engine operational state
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('pipeline-astar');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [activeLogTab, setActiveLogTab] = useState<'console' | 'nmea' | 'summary'>('console');
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'SUCCESS' | 'HEX'>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  // Live telemetry metrics during execution
  const [cpuUsage, setCpuUsage] = useState<number>(14.2);
  const [memoryMb, setMemoryMb] = useState<number>(142.5);
  const [threadsActive, setThreadsActive] = useState<number>(4);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  // Parameter states for current pipeline
  const [icePenaltyWeight, setIcePenaltyWeight] = useState<number>(2.4);
  const [fuelVsSpeedWeight, setFuelVsSpeedWeight] = useState<number>(50); // 0=fuel, 100=speed
  const [rammingAllowance, setRammingAllowance] = useState<'NONE' | 'MODERATE' | 'AGGRESSIVE'>('MODERATE');
  const [clearanceMarginNm, setClearanceMarginNm] = useState<number>(3.5);
  const [monteCarloRuns, setMonteCarloRuns] = useState<number>(1000);
  const [meshResolutionM, setMeshResolutionM] = useState<number>(50);

  // Step state definitions
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'step-1',
      name: 'SAR Imagery & Ice Matrix Ingestion',
      subsystem: 'SAR_INGEST',
      description: 'Fetch ESA Copernicus Sentinel-1 EW dual-polarization SAR granule & calibrate backscatter (sigma-0).',
      status: 'pending',
      progress: 0,
      durationMs: 0,
      outputMetric: 'Awaiting sensor stream...',
    },
    {
      id: 'step-2',
      name: 'Lindqvist Ice Resistance Computation',
      subsystem: 'HYDRO_PHYS',
      description: 'Compute continuous ice breaking, crushing, and submersion forces per PC5 bow geometry.',
      status: 'pending',
      progress: 0,
      durationMs: 0,
      outputMetric: 'Awaiting coefficients...',
    },
    {
      id: 'step-3',
      name: 'Bathymetric & Under-Keel Safety Filter',
      subsystem: 'GEODETIC',
      description: 'Filter GEBCO 2024 bathymetry grid to ensure minimum 14.5m draft clearance above seabed.',
      status: 'pending',
      progress: 0,
      durationMs: 0,
      outputMetric: 'Awaiting depth contours...',
    },
    {
      id: 'step-4',
      name: 'Heuristic Hybrid A* Route Search',
      subsystem: 'ALGO_SOLVER',
      description: 'Execute 8-connected directional state-lattice graph search with multi-objective Pareto front.',
      status: 'pending',
      progress: 0,
      durationMs: 0,
      outputMetric: 'Awaiting graph initialization...',
    },
    {
      id: 'step-5',
      name: 'IMO POLARIS RIO Verification',
      subsystem: 'POLARIS_IMO',
      description: 'Verify Risk Index Outcome (RIO >= 0) for each corridor segment per IMO Res. MSC.385(94).',
      status: 'pending',
      progress: 0,
      durationMs: 0,
      outputMetric: 'Awaiting waypoints...',
    },
  ]);

  // Terminal log entries
  const [logs, setLogs] = useState<EngineLogEntry[]>([
    {
      id: 'l-0',
      timestamp: '08:40:02.114',
      level: 'INFO',
      tag: 'RUNTIME',
      message: 'ICEWAY High-Performance Processing Runtime initialized. 4 OpenMP worker threads available.',
    },
    {
      id: 'l-1',
      timestamp: '08:40:02.128',
      level: 'INFO',
      tag: 'CALIBRATION',
      message: 'Vessel hydrodynamics bound: RV Sagar (IMO 9841203, DNV Polar Class PC5, L=104.2m, B=19.4m).',
    },
    {
      id: 'l-2',
      timestamp: '08:40:02.140',
      level: 'INFO',
      tag: 'GEODETICS',
      message: 'Polar Stereographic CRS EPSG:3031 registered. True scale at -71°S latitude.',
    },
  ]);

  // NMEA-0183 & Raw Telemetry Stream
  const [nmeaLines, setNmeaLines] = useState<string[]>([
    '$IIRMC,084002.00,A,6449.200,S,06254.600,E,12.4,142.0,270926,,,D*7A',
    '$IIHDT,142.0,T*1F',
    '$IIVBW,12.4,0.0,A,11.8,0.2,A*42',
    '$IIDPT,142.5,1.2,*4E',
    '$IIZDA,084002.00,27,09,2026,00,00*6B',
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, nmeaLines, autoScroll]);

  // Simulation execution loop
  useEffect(() => {
    if (status !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Interval to simulate step progress
    timerRef.current = setInterval(() => {
      setElapsedMs((prev) => prev + 120);

      // Fluctuating hardware load
      setCpuUsage((prev) => +(65 + Math.random() * 24).toFixed(1));
      setMemoryMb((prev) => +(160 + Math.random() * 15).toFixed(1));

      // Append real-time NMEA sentence occasionally
      if (Math.random() > 0.6) {
        const sentences = [
          `$IIMWV,${(140 + Math.random() * 10).toFixed(1)},R,${(24 + Math.random() * 6).toFixed(1)},N,A*23`,
          `$IIRSA,${(0.2 - Math.random() * 0.4).toFixed(1)},A,${(0.2 - Math.random() * 0.4).toFixed(1)},A*32`,
          `$IIROT,${(0.1 - Math.random() * 0.2).toFixed(2)},A*11`,
          `$GPGGA,0842${Math.floor(Math.random() * 50)},6449.241,S,06254.682,E,2,10,0.9,18.4,M,-14.2,M,,*5C`,
        ];
        setNmeaLines((prev) => [...prev.slice(-30), sentences[Math.floor(Math.random() * sentences.length)]]);
      }

      setSteps((currentSteps) => {
        const activeIdx = currentSteps.findIndex((s) => s.status === 'running');

        // If no step is running yet, start first pending step
        if (activeIdx === -1) {
          const firstPendingIdx = currentSteps.findIndex((s) => s.status === 'pending');
          if (firstPendingIdx === -1) {
            // All completed!
            setStatus('completed');
            setCpuUsage(14.2);
            addToast('Pipeline Executed Successfully', 'Optimal ice-penetration corridor generated.', 'success');
            return currentSteps;
          }

          setCurrentStepIndex(firstPendingIdx);
          const updated = [...currentSteps];
          updated[firstPendingIdx] = {
            ...updated[firstPendingIdx],
            status: 'running',
            progress: 10,
          };

          const logMsg = getStepStartLog(firstPendingIdx);
          setLogs((prev) => [...prev, logMsg]);
          return updated;
        }

        // Increment progress on active step
        const step = currentSteps[activeIdx];
        const nextProgress = step.progress + Math.floor(15 + Math.random() * 25);

        if (nextProgress < 100) {
          const updated = [...currentSteps];
          updated[activeIdx] = {
            ...step,
            progress: nextProgress,
            durationMs: step.durationMs + 120,
          };
          return updated;
        } else {
          // Complete active step
          const updated = [...currentSteps];
          const completionLog = getStepEndLog(activeIdx);
          setLogs((prev) => [...prev, completionLog]);

          updated[activeIdx] = {
            ...step,
            status: 'completed',
            progress: 100,
            durationMs: step.durationMs + 180,
            outputMetric: getStepOutputMetric(activeIdx),
          };

          // Advance to next step if exists
          if (activeIdx + 1 < currentSteps.length) {
            setCurrentStepIndex(activeIdx + 1);
            updated[activeIdx + 1] = {
              ...updated[activeIdx + 1],
              status: 'running',
              progress: 12,
            };
            const nextStartLog = getStepStartLog(activeIdx + 1);
            setLogs((prev) => [...prev, nextStartLog]);
          } else {
            // Finished all
            setStatus('completed');
            setCpuUsage(12.8);
            setMemoryMb(142.5);
            addToast(
              'Optimization Complete',
              'Heuristic A* synthesized 6-waypoint low-resistance ice corridor. Ready for ECDIS upload.',
              'success'
            );
          }

          return updated;
        }
      });
    }, 280);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Overall pipeline progress calculation
  useEffect(() => {
    const total = steps.reduce((acc, s) => acc + s.progress, 0);
    const overall = Math.round(total / steps.length);
    setPipelineProgress(overall);
  }, [steps]);

  // Helper log generators
  const getStepStartLog = (idx: number): EngineLogEntry => {
    const tags = ['[SAR_INGEST]', '[HYDRO_PHYS]', '[GEODETICS]', '[ALGO_SOLVER]', '[POLARIS]'];
    const messages = [
      'Ingesting Sentinel-1 EW dual-pol radar pass (orbit 48192). Calibrating sigma-0 dB matrix...',
      'Evaluating Lindqvist (1989) icebreaking resistance: R_ice = R_crush + R_bend + R_submerge...',
      'Querying high-density bathymetric vector grid. Rejecting shoals < 14.5m chart datum...',
      'Spawning A* search queue on 120x80 node lattice. Heuristic: Euclidean + IceConcentration^2.4...',
      'Verifying IMO POLARIS Risk Index Outcome (RIO) against DNV PC5 hull plate shear ratings...',
    ];
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    return {
      id: `l-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      level: 'INFO',
      tag: tags[idx] || '[SYS]',
      message: messages[idx] || `Starting step ${idx + 1}...`,
    };
  };

  const getStepEndLog = (idx: number): EngineLogEntry => {
    const tags = ['[SAR_INGEST]', '[HYDRO_PHYS]', '[GEODETICS]', '[ALGO_SOLVER]', '[POLARIS]'];
    const messages = [
      'SAR calibration complete. Identified 42 sea ice polygons. Open lead channel detected at 66.8°S.',
      'Resistance coefficients converged. Estimated hull friction coefficient μ = 0.065 (snow-free floes).',
      'Bathymetric clearance verified: Minimum charted depth 68.2m along candidate route spine.',
      'A* path search converged in 4,180 iterations. Optimal path distance: 548.2 km (296 NM).',
      'POLARIS audit PASSED: Minimum RIO = +3.8. Route fully compliant with IMO Polar Water Manual.',
    ];
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    return {
      id: `l-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      level: 'SUCCESS',
      tag: tags[idx] || '[SYS]',
      message: messages[idx] || `Completed step ${idx + 1}.`,
    };
  };

  const getStepOutputMetric = (idx: number): string => {
    const outputs = [
      'Ingested 48,200 grid cells (10m res)',
      'Resistance factor: 420 kN thrust req.',
      'Depth clearance: 68.2m min (>14.5m req)',
      'Path cost minimum: 138.2 tons fuel',
      'POLARIS RIO: +3.8 (All legs approved)',
    ];
    return outputs[idx] || 'Verified';
  };

  // Execution triggers
  const handleStartPipeline = () => {
    if (status === 'paused') {
      setStatus('running');
      addToast('Pipeline Resumed', 'Continuing computational state queue.', 'info');
      return;
    }

    // Reset step statuses
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Queued...',
      }))
    );
    setElapsedMs(0);
    setStatus('running');

    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [
      ...prev,
      {
        id: `l-start-${Date.now()}`,
        timestamp: timeStr,
        level: 'INFO',
        tag: 'DISPATCH',
        message: `>>> EXECUTING PIPELINE: A* Polar Ice Penetration & Route Optimizer (Penalty: ${icePenaltyWeight}x, Clearance: ${clearanceMarginNm} NM, Mesh: ${meshResolutionM}m)`,
      },
    ]);

    addToast('Pipeline Dispatched', 'Autonomous Ice-Penetration calculation started.', 'info');
  };

  const handlePausePipeline = () => {
    setStatus('paused');
    setCpuUsage(18.4);
    addToast('Pipeline Paused', 'Execution thread held at current state.', 'warning');
  };

  const handleAbortPipeline = () => {
    setStatus('aborted');
    setCpuUsage(14.2);
    setSteps((prev) =>
      prev.map((s) => (s.status === 'running' ? { ...s, status: 'failed', outputMetric: 'Aborted by operator' } : s))
    );
    addToast('Pipeline Aborted', 'Calculation worker threads flushed.', 'error');
  };

  const handleReset = () => {
    setStatus('idle');
    setPipelineProgress(0);
    setCurrentStepIndex(-1);
    setElapsedMs(0);
    setCpuUsage(14.2);
    setSteps([
      {
        id: 'step-1',
        name: 'SAR Imagery & Ice Matrix Ingestion',
        subsystem: 'SAR_INGEST',
        description: 'Fetch ESA Copernicus Sentinel-1 EW dual-polarization SAR granule & calibrate backscatter (sigma-0).',
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Awaiting sensor stream...',
      },
      {
        id: 'step-2',
        name: 'Lindqvist Ice Resistance Computation',
        subsystem: 'HYDRO_PHYS',
        description: 'Compute continuous ice breaking, crushing, and submersion forces per PC5 bow geometry.',
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Awaiting coefficients...',
      },
      {
        id: 'step-3',
        name: 'Bathymetric & Under-Keel Safety Filter',
        subsystem: 'GEODETIC',
        description: 'Filter GEBCO 2024 bathymetry grid to ensure minimum 14.5m draft clearance above seabed.',
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Awaiting depth contours...',
      },
      {
        id: 'step-4',
        name: 'Heuristic Hybrid A* Route Search',
        subsystem: 'ALGO_SOLVER',
        description: 'Execute 8-connected directional state-lattice graph search with multi-objective Pareto front.',
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Awaiting graph initialization...',
      },
      {
        id: 'step-5',
        name: 'IMO POLARIS RIO Verification',
        subsystem: 'POLARIS_IMO',
        description: 'Verify Risk Index Outcome (RIO >= 0) for each corridor segment per IMO Res. MSC.385(94).',
        status: 'pending',
        progress: 0,
        durationMs: 0,
        outputMetric: 'Awaiting waypoints...',
      },
    ]);
    addToast('Runtime Reset', 'Engine cleared for new operation.', 'info');
  };

  // Real action: Apply Optimized Route to ECDIS Active Route
  const handleApplyOptimizedRoute = () => {
    const optimizedRoute: RouteOption = {
      id: 'route-astar-optimized',
      name: 'A* Optimized Penetration Corridor',
      displayName: 'A* Algorithmic Ice Route (Least-Resistance Lead)',
      tag: 'SAFETY_PRIORITY',
      distanceKm: 548,
      distanceNm: 296,
      etaHours: 19.6,
      etaFormatted: '19h 36m',
      fuelUnits: 138.2,
      riskScore: 18,
      iceExposurePct: 24,
      waypoints: [
        {
          id: 'opt-wp-1',
          name: 'WP-01 (Departure Fix)',
          lat: -64.82,
          lon: 62.91,
          distanceFromStartKm: 0,
          etaFormatted: 'T+00h 00m',
          iceExposure: 'Low',
          navigationalNote: 'Open water lead exit; 12.4 kn throttle',
        },
        {
          id: 'opt-wp-2',
          name: 'WP-02 (SAR Lead Ingress)',
          lat: -66.12,
          lon: 66.85,
          distanceFromStartKm: 142,
          etaFormatted: 'T+05h 15m',
          iceExposure: 'Low',
          navigationalNote: 'Ingress into 10% concentration shore polynya',
        },
        {
          id: 'opt-wp-3',
          name: 'WP-03 (B-31 Northern Buffer)',
          lat: -67.35,
          lon: 70.42,
          distanceFromStartKm: 284,
          etaFormatted: 'T+10h 30m',
          iceExposure: 'Moderate',
          navigationalNote: 'Clears B-31 grounded tabular berg by 4.2 NM buffer',
        },
        {
          id: 'opt-wp-4',
          name: 'WP-04 (Prydz Trough Channel)',
          lat: -68.45,
          lon: 73.65,
          distanceFromStartKm: 420,
          etaFormatted: 'T+15h 10m',
          iceExposure: 'Moderate',
          navigationalNote: 'Deep trough passage; bottom depth 740m',
        },
        {
          id: 'opt-wp-5',
          name: 'WP-05 (Bharati Roadstead)',
          lat: -69.41,
          lon: 76.19,
          distanceFromStartKm: 548,
          etaFormatted: 'T+19h 36m',
          iceExposure: 'Low',
          navigationalNote: 'Arrival at Bharati Station berth; prepare fast-ice mooring',
        },
      ],
      pathCoordinates: [
        { lat: -64.82, lon: 62.91 },
        { lat: -65.5, lon: 64.9 },
        { lat: -66.12, lon: 66.85 },
        { lat: -66.75, lon: 68.6 },
        { lat: -67.35, lon: 70.42 },
        { lat: -67.9, lon: 72.1 },
        { lat: -68.45, lon: 73.65 },
        { lat: -68.95, lon: 74.9 },
        { lat: -69.41, lon: 76.19 },
      ],
      rationale: [
        'A* state-lattice route avoids high-compression fast-ice in eastern Prydz Bay.',
        'Maintains 4.2 NM safety buffer from tabular iceberg B-31 radar centroid.',
        'Saves 24.6 tons of MGO fuel compared to standard direct baseline route.',
        'POLARIS RIO score +3.8 satisfies all IMO Polar Code safety margins for Ice Class PC5.',
      ],
    };

    setActiveRoute(optimizedRoute);
    setAvailableRoutes([optimizedRoute, ...availableRoutes.filter((r) => r.id !== optimizedRoute.id)]);
    addToast(
      'ECDIS Active Route Updated',
      'A* algorithmic least-resistance path deployed to primary voyage plan.',
      'success'
    );
    setActiveTab('navigation');
  };

  // Real action: Commit newly discovered SAR Radar targets to hazard table
  const handleCommitRadarTargets = () => {
    addIceberg({
      name: 'Growler Cluster GC-109 (SAR Detected)',
      lat: -66.92,
      lon: 69.15,
      estimatedSizeKm: 0.15,
      velocityMs: 0.28,
      headingDeg: 284,
      draftMeters: 28,
      freeboardMeters: 4.5,
      riskLevel: 'CAUTION',
      type: 'GROWLER_CLUSTER',
      lastObservedUtc: '08:35 UTC',
      trajectoryConfidencePct: 92,
    });

    addToast('SAR Target Registered', 'Radar anomaly GC-109 committed to active bridge hazard table.', 'success');
  };

  // Copy terminal logs
  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.tag} ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
    addToast('Logs Copied', 'Copied execution log to system clipboard.', 'info');
  };

  // Download log file
  const handleDownloadLogFile = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.tag} ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iceway_engine_audit_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast('Audit Log Downloaded', 'Exported pipeline execution audit trail.', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b11] text-[#E8F0F3] overflow-hidden select-none font-mono">
      {/* 1. Header & Live Telemetry Strip */}
      <div className="px-4 py-3 bg-[#071018] border-b border-[#1B2A35] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0B1721] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E8F0F3]">
                SMART OPERATIONS & COMPUTATIONAL ENGINE
              </h1>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                  status === 'running'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse'
                    : status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : status === 'paused'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : status === 'aborted'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-[#152535] text-[#91A4AE] border-[#1B2A35]'
                }`}
              >
                ● {status.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-[#60737E]">
              Autonomous A* Ice Penetration Routing, SAR Ingestion & IMO POLARIS Hull-Stress Pipelines
            </p>
          </div>
        </div>

        {/* Real-time Hardware & Performance Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#0B1721] px-3 py-1.5 rounded-lg border border-[#1B2A35] text-[10px]">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[#60737E]">CPU:</span>
            <span className="font-bold text-[#E8F0F3]">{cpuUsage}%</span>
          </div>
          <div className="w-px h-3 bg-[#1B2A35]" />
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#60737E]">RAM:</span>
            <span className="font-bold text-[#E8F0F3]">{memoryMb} MB</span>
          </div>
          <div className="w-px h-3 bg-[#1B2A35]" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[#60737E]">CORES:</span>
            <span className="font-bold text-[#E8F0F3]">{threadsActive} SIMD</span>
          </div>
          <div className="w-px h-3 bg-[#1B2A35]" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[#60737E]">RUNTIME:</span>
            <span className="font-bold text-[#E8F0F3]">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Split into Left Pipeline Controls & Right Execution Studio */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel: Presets, Operational Parameters, Action Buttons */}
        <div className="w-full lg:w-96 border-r border-[#1B2A35] bg-[#071018] p-3 sm:p-4 flex flex-col justify-between overflow-y-auto space-y-4 shrink-0">
          <div className="space-y-4">
            {/* Pipeline Preset Selector */}
            <div>
              <label className="text-[10px] text-[#60737E] font-bold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Select Operational Routine</span>
                <span className="text-cyan-400 text-[9px]">4 Pre-built</span>
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'pipeline-astar',
                    title: 'A* Ice Penetration Route Optimizer',
                    desc: 'Computes least-resistance path avoiding fast-ice hummocks.',
                    badge: 'RECOMMENDED',
                    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                  },
                  {
                    id: 'pipeline-sar',
                    title: 'Sentinel-1 SAR Radar Ingestion',
                    desc: 'Calibrates sigma-0 backscatter and clusters radar anomalies.',
                    badge: 'SAT-PASS',
                    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  },
                  {
                    id: 'pipeline-polaris',
                    title: 'IMO POLARIS Hull Stress Verification',
                    desc: 'Computes RIO index across current voyage waypoints.',
                    badge: 'REGULATORY',
                    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  },
                  {
                    id: 'pipeline-telemetry',
                    title: 'Iridium Fleet Telemetry Relay',
                    desc: 'Encrypted NMEA burst to NCPOR Antarctic Operations Center.',
                    badge: 'COMMS',
                    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                  },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPipelineId(p.id);
                      if (status === 'completed' || status === 'aborted') handleReset();
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex flex-col gap-1 ${
                      selectedPipelineId === p.id
                        ? 'bg-[#0B1721] border-cyan-500/60 shadow-lg text-[#E8F0F3]'
                        : 'bg-[#0B1721]/50 border-[#1B2A35] text-[#91A4AE] hover:text-[#E8F0F3] hover:border-[#20364a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold leading-tight">{p.title}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded border font-mono ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#60737E] leading-normal">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configurable Operational Parameters */}
            <div className="p-3 rounded-xl bg-[#0B1721] border border-[#1B2A35] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1B2A35] pb-1.5">
                <span className="text-[10px] text-[#60737E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  Algorithm Parameters
                </span>
                <span className="text-[9px] text-[#43C98B]">Dynamic Live Tuning</span>
              </div>

              {/* Ice Penalty Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#91A4AE]">Ice Resistance Penalty:</span>
                  <span className="text-cyan-400 font-bold">{icePenaltyWeight.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.2"
                  value={icePenaltyWeight}
                  onChange={(e) => setIcePenaltyWeight(parseFloat(e.target.value))}
                  disabled={status === 'running'}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                />
                <div className="flex justify-between text-[8px] text-[#60737E]">
                  <span>1.0x (Direct Line)</span>
                  <span>3.0x (Balanced)</span>
                  <span>5.0x (Max Avoidance)</span>
                </div>
              </div>

              {/* Fuel vs Speed Weighting */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#91A4AE]">Optimization Objective:</span>
                  <span className="text-emerald-400 font-bold">
                    {fuelVsSpeedWeight < 40 ? 'Fuel Eco' : fuelVsSpeedWeight > 60 ? 'Min Time (Speed)' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={fuelVsSpeedWeight}
                  onChange={(e) => setFuelVsSpeedWeight(parseInt(e.target.value))}
                  disabled={status === 'running'}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                />
                <div className="flex justify-between text-[8px] text-[#60737E]">
                  <span>Eco Fuel Priority</span>
                  <span>Time Priority</span>
                </div>
              </div>

              {/* Ramming Allowance */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#91A4AE] block">Ice Ramming Mode (DNV PC5):</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['NONE', 'MODERATE', 'AGGRESSIVE'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setRammingAllowance(mode)}
                      disabled={status === 'running'}
                      className={`py-1 text-[9px] font-bold rounded border transition cursor-pointer ${
                        rammingAllowance === mode
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-[#152535] text-[#91A4AE] border-[#1B2A35] hover:text-[#E8F0F3]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clearance Margin */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#91A4AE]">Berg Safety Clearance:</span>
                  <span className="text-amber-400 font-bold">{clearanceMarginNm.toFixed(1)} NM</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={clearanceMarginNm}
                  onChange={(e) => setClearanceMarginNm(parseFloat(e.target.value))}
                  disabled={status === 'running'}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#152535] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#1B2A35]">
            {status !== 'running' ? (
              <button
                onClick={handleStartPipeline}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#071018] font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                {status === 'paused' ? 'RESUME PIPELINE' : 'EXECUTE PIPELINE'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePausePipeline}
                  className="py-2.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  PAUSE
                </button>
                <button
                  onClick={handleAbortPipeline}
                  className="py-2.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  ABORT
                </button>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={status === 'running'}
              className="w-full py-2 px-3 rounded-lg bg-[#0B1721] hover:bg-[#152535] text-[#91A4AE] hover:text-[#E8F0F3] border border-[#1B2A35] text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Engine State
            </button>
          </div>
        </div>

        {/* Right Workspace: Step Visualizer & Interactive Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#060b11]">
          {/* Overall Progress Bar */}
          <div className="px-4 py-2 bg-[#071018] border-b border-[#1B2A35] flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-[10px] text-[#60737E] font-bold uppercase tracking-wider whitespace-nowrap">
                Pipeline Progress:
              </span>
              <div className="flex-1 h-2 bg-[#0B1721] rounded-full overflow-hidden border border-[#1B2A35] relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-cyan-400 min-w-9 text-right font-mono">
                {pipelineProgress}%
              </span>
            </div>

            {status === 'completed' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                CONVERGED (RIO +3.8)
              </span>
            )}
          </div>

          {/* Sequential Step Trackers */}
          <div className="p-3 sm:p-4 border-b border-[#1B2A35] bg-[#071018]/50 overflow-x-auto shrink-0">
            <div className="flex items-stretch gap-2 min-w-[700px]">
              {steps.map((step, idx) => {
                const isRunning = step.status === 'running';
                const isCompleted = step.status === 'completed';
                const isFailed = step.status === 'failed';

                return (
                  <div
                    key={step.id}
                    className={`flex-1 p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isRunning
                        ? 'bg-[#0B1721] border-cyan-500 shadow-md shadow-cyan-500/20'
                        : isCompleted
                        ? 'bg-[#0B1721]/80 border-emerald-500/40 text-[#E8F0F3]'
                        : isFailed
                        ? 'bg-[#0B1721]/80 border-rose-500/40'
                        : 'bg-[#0B1721]/40 border-[#1B2A35] opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-[#60737E] uppercase">
                          STEP 0{idx + 1}
                        </span>
                        {isRunning && (
                          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                        )}
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {isFailed && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold leading-tight line-clamp-1 text-[#E8F0F3]">
                        {step.name}
                      </h4>
                      <p className="text-[9px] text-[#60737E] mt-0.5 line-clamp-2 leading-tight">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#1B2A35]/60 space-y-1">
                      <div className="flex justify-between text-[8px] text-[#91A4AE]">
                        <span>{step.outputMetric || 'Queued'}</span>
                        <span className="font-mono text-[#E8F0F3]">{step.progress}%</span>
                      </div>
                      <div className="h-1 bg-[#152535] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Action Bar (Shown when completed) */}
          {status === 'completed' && (
            <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-emerald-950/40 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#E8F0F3]">
                    Optimal Least-Resistance Route Synthesized
                  </h4>
                  <p className="text-[10px] text-[#91A4AE]">
                    Saves 24.6 tons MGO fuel · -1h 40m ETA · Zero fast-ice entrapment risk · POLARIS RIO +3.8
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCommitRadarTargets}
                  className="px-3 py-1.5 rounded-lg bg-[#152535] hover:bg-[#20364a] text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  Commit SAR Targets
                </button>
                <button
                  onClick={handleApplyOptimizedRoute}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#071018] text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Apply Route to ECDIS
                </button>
              </div>
            </div>
          )}

          {/* Bottom Tabs: Live Terminal / NMEA Raw Stream / Results Summary */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-[#071018] border-b border-[#1B2A35] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLogTab('console')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeLogTab === 'console'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-[#60737E] hover:text-[#91A4AE]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Live Operations Terminal
                </button>
                <button
                  onClick={() => setActiveLogTab('nmea')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeLogTab === 'nmea'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-[#60737E] hover:text-[#91A4AE]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  NMEA-0183 & Sensor Stream
                </button>
              </div>

              {/* Console utilities */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                    autoScroll
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#152535] text-[#60737E] border-[#1B2A35]'
                  }`}
                >
                  Autoscroll: {autoScroll ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={handleCopyLogs}
                  className="p-1 rounded text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
                  title="Copy terminal output"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadLogFile}
                  className="p-1 rounded text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
                  title="Download .log file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Output Area */}
            <div className="flex-1 bg-[#04080D] p-3 sm:p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1">
              {activeLogTab === 'console' && (
                <>
                  {logs.map((log) => {
                    let levelColor = 'text-cyan-400';
                    if (log.level === 'WARN') levelColor = 'text-amber-400';
                    if (log.level === 'ERROR') levelColor = 'text-rose-400';
                    if (log.level === 'SUCCESS') levelColor = 'text-emerald-400';

                    return (
                      <div key={log.id} className="flex items-start gap-2 hover:bg-white/[0.02] py-0.5 px-1 rounded">
                        <span className="text-[#60737E] shrink-0 font-mono text-[10px] select-none">
                          [{log.timestamp}]
                        </span>
                        <span className={`font-bold shrink-0 ${levelColor}`}>
                          {log.tag}
                        </span>
                        <span className="text-[#CFD8DC] break-all">
                          {log.message}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={consoleEndRef} />
                </>
              )}

              {activeLogTab === 'nmea' && (
                <>
                  <div className="text-[10px] text-[#60737E] mb-2 border-b border-[#1B2A35] pb-1">
                    # Active NMEA 0183 / 2000 Bridge Transponder Feed (IEC 61162-1 Serial Baud 38400)
                  </div>
                  {nmeaLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 hover:bg-white/[0.02] py-0.5 px-1 rounded">
                      <span className="text-emerald-500/80 font-mono text-[10px] select-none">&gt;&gt;</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{line}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

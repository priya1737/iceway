import React from 'react';
import { Plus, Minus, RotateCcw, Crosshair, Maximize2, Minimize2, Navigation, MapPin } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterVessel: () => void;
  onFitVoyage?: () => void;
  onCenterDestination?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterVessel,
  onFitVoyage,
  onCenterDestination,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 flex flex-col gap-1 sm:gap-1.5 select-none pointer-events-auto">
      {/* Zoom controls */}
      <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded p-0.5 sm:p-1 flex flex-col gap-0.5 sm:gap-1 shadow-xl">
        <button
          onClick={onZoomIn}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#38bdf8] hover:bg-[#152535] transition cursor-pointer"
          title="Zoom In (+)"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <div className="text-[9px] sm:text-[10px] font-mono text-center text-[#38bdf8] py-0.5 border-y border-[#1B2A35]">
          {(zoom * 100).toFixed(0)}%
        </div>
        <button
          onClick={onZoomOut}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#38bdf8] hover:bg-[#152535] transition cursor-pointer"
          title="Zoom Out (-)"
        >
          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Navigation Shortcuts */}
      <div className="bg-[#0B1721]/95 backdrop-blur-md border border-[#1B2A35] rounded p-0.5 sm:p-1 flex flex-col gap-0.5 sm:gap-1 shadow-xl">
        <button
          onClick={onCenterVessel}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#38bdf8] hover:text-white hover:bg-[#152535] transition cursor-pointer group relative"
          title="Center on RV Sagar (Vessel)"
        >
          <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="sr-only">Center Vessel</span>
        </button>

        {onFitVoyage && (
          <button
            onClick={onFitVoyage}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#34d399] hover:text-white hover:bg-[#152535] transition cursor-pointer"
            title="Fit Entire Voyage Track"
          >
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-45" />
          </button>
        )}

        {onCenterDestination && (
          <button
            onClick={onCenterDestination}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#fbbf24] hover:text-white hover:bg-[#152535] transition cursor-pointer"
            title="Center on Bharati Station"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        <button
          onClick={onResetView}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title="Reset Antarctic View"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>
    </div>
  );
};

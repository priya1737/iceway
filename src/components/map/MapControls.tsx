import React from 'react';
import { Plus, Minus, RotateCcw, Crosshair, Maximize2, Minimize2 } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterVessel: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterVessel,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 select-none">
      <div className="bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded p-1 flex flex-col gap-1 shadow-lg">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-mono text-center text-[#60737E] py-0.5 border-y border-[#1B2A35]">
          {(zoom * 100).toFixed(0)}%
        </div>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#0B1721]/90 backdrop-blur-sm border border-[#1B2A35] rounded p-1 flex flex-col gap-1 shadow-lg">
        <button
          onClick={onCenterVessel}
          className="w-8 h-8 rounded flex items-center justify-center text-[#5DADE2] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title="Center on RV Sagar"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={onResetView}
          className="w-8 h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title="Reset Antarctic View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleFullscreen}
          className="w-8 h-8 rounded flex items-center justify-center text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

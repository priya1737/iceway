import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useApp();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none font-mono">
      <div className="bg-[#0B1721] border border-red-500/40 rounded-xl shadow-2xl w-full max-w-md overflow-hidden glass-card">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1B2A35] bg-[#071018]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F0F3]">
                {confirmDialog.title}
              </h3>
              <span className="text-[10px] text-red-400 font-semibold tracking-wide">
                DESTRUCTIVE ACTION REQUIRED
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirmDialog.onCancel) confirmDialog.onCancel();
              closeConfirmDialog();
            }}
            className="text-[#91A4AE] hover:text-[#E8F0F3] p-1 rounded hover:bg-[#152535] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#C5D1D9] leading-relaxed">
            {confirmDialog.message}
          </p>

          <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-[11px] text-red-300">
            ⚠️ This will alter live operational records. Changes are permanently persisted to local storage.
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#1B2A35] bg-[#071018]/80 flex justify-end gap-2.5">
          <button
            onClick={() => {
              if (confirmDialog.onCancel) confirmDialog.onCancel();
              closeConfirmDialog();
            }}
            className="px-3.5 py-1.5 rounded text-xs text-[#91A4AE] hover:text-[#E8F0F3] hover:bg-[#152535] border border-transparent transition cursor-pointer"
          >
            {confirmDialog.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={confirmDialog.onConfirm}
            className="px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDialog.confirmLabel || 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  );
};

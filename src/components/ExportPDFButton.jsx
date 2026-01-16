import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportDashboardToPDF } from '../utils/exportPDF';

/**
 * Export to PDF button component with loading state and error handling
 */
export default function ExportPDFButton({ targetElementId, filename }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      await exportDashboardToPDF(targetElementId, filename);
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
          isExporting
            ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-800'
        }`}
        aria-label="Export dashboard to PDF"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export to PDF
          </>
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

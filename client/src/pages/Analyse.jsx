import { useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import AnalysisReport from '../components/AnalysisReport';
import ExportButton from '../components/ExportButton';
import { useAnalysis } from '../hooks/useAnalysis';
import { RotateCcw, Zap } from 'lucide-react';

export default function Analyse({ darkMode }) {
  const { status, report, reportId, error, analyse, reset } = useAnalysis();

  const handleAnalyse = (data) => {
    analyse(data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap size={22} className="text-primary" />
            Analyse Test Cases
          </h1>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            Upload test data and get AI-powered analysis in seconds
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(status === 'complete' || status === 'error') && (
            <button onClick={reset} className="btn-ghost text-sm">
              <RotateCcw size={14} />
              New Analysis
            </button>
          )}
          {status === 'complete' && reportId && (
            <ExportButton reportId={reportId} reportText={report} darkMode={darkMode} />
          )}
        </div>
      </div>

      {/* Show upload panel if idle or error */}
      {(status === 'idle' || status === 'error') && (
        <>
          {error && (
            <div className="px-4 py-3 rounded-xl animate-slide-up"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-sm text-danger font-medium">{error}</p>
              <button onClick={reset} className="text-xs text-danger/70 hover:text-danger mt-1 underline">
                Try again
              </button>
            </div>
          )}
          <UploadPanel 
            onAnalyse={handleAnalyse} 
            isStreaming={false} 
            darkMode={darkMode} 
          />
        </>
      )}

      {/* Show streaming upload panel */}
      {status === 'streaming' && (
        <UploadPanel onAnalyse={() => {}} isStreaming={true} darkMode={darkMode} />
      )}

      {/* Show report */}
      {(status === 'streaming' || status === 'complete') && report && (
        <AnalysisReport report={report} status={status} darkMode={darkMode} />
      )}
    </div>
  );
}

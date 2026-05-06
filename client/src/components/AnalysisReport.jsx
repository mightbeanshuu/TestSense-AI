import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatReport, extractReleaseDecision, extractScorecard } from '../utils/formatReport';

export default function AnalysisReport({ report, status, darkMode }) {
  const [collapsed, setCollapsed] = useState({});

  const { sections } = useMemo(() => formatReport(report), [report]);
  const releaseDecision = useMemo(() => extractReleaseDecision(report), [report]);
  const scorecard = useMemo(() => extractScorecard(report), [report]);

  const toggleSection = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const gradeColor = (grade) => {
    const map = { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444' };
    return map[grade] || '#6B7280';
  };

  if (!report) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Streaming indicator */}
      {status === 'streaming' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse-glow"
          style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}>
          <div className="spinner" />
          <span className="text-sm font-medium text-primary">AI is analysing your test cases...</span>
        </div>
      )}

      {/* Release Decision Banner */}
      {releaseDecision !== 'UNKNOWN' && status === 'complete' && (
        <div className={`px-6 py-5 rounded-2xl text-center ${
          releaseDecision === 'SAFE' ? 'banner-safe' :
          releaseDecision === 'DO_NOT_RELEASE' ? 'banner-danger' :
          'banner-conditional'
        }`} style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {releaseDecision === 'SAFE' ? <CheckCircle size={28} /> : 
             releaseDecision === 'DO_NOT_RELEASE' ? <Shield size={28} /> : 
             <AlertTriangle size={28} />}
            <span className="text-2xl font-bold">
              {releaseDecision === 'SAFE' ? 'Safe to Release' :
               releaseDecision === 'DO_NOT_RELEASE' ? 'Do NOT Release' :
               'Conditional Release'}
            </span>
          </div>
          <p className="text-sm opacity-80">
            {releaseDecision === 'SAFE' ? 'All critical checks passed. This build is ready for deployment.' :
             releaseDecision === 'DO_NOT_RELEASE' ? 'Critical issues detected. Fix blocking problems before releasing.' :
             'Some issues need attention. Review the conditions below.'}
          </p>
        </div>
      )}

      {/* Scorecard */}
      {scorecard.length > 0 && status === 'complete' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4">📊 Quality Scorecard</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {scorecard.map(({ metric, score, grade }) => (
              <div key={metric} className="text-center">
                <div className="grade-circle mx-auto mb-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${gradeColor(grade)}, ${gradeColor(grade)}cc)`,
                    width: '56px', height: '56px', fontSize: '22px'
                  }}>
                  {grade}
                </div>
                <p className="text-xs font-medium truncate">{metric.replace(/[^\w\s]/g, '').trim()}</p>
                <p className="text-xs mt-0.5" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                  {score}/100
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Sections */}
      {sections.length > 0 ? (
        sections.map((section) => (
          <div key={section.id} className="card overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-primary/5"
            >
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span>{section.emoji}</span>
                <span>{section.title.replace(/^[\p{Emoji}\u200d\ufe0f\s]+/u, '')}</span>
              </h3>
              {collapsed[section.id] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {!collapsed[section.id] && (
              <div className="px-5 pb-5 report-content animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))
      ) : (
        /* Raw markdown fallback during streaming */
        <div className="card p-5 report-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report}
          </ReactMarkdown>
          {status === 'streaming' && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 rounded-sm" />
          )}
        </div>
      )}
    </div>
  );
}

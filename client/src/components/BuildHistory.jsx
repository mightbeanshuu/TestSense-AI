import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useHistory } from '../hooks/useHistory';
import { History, Trash2, Eye, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BuildHistory({ darkMode }) {
  const { builds, loading, fetchBuild, deleteBuild } = useHistory();
  const [expandedBuild, setExpandedBuild] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const navigate = useNavigate();

  const chartData = [...builds].reverse().map(b => ({
    build: `#${b.buildNumber}`,
    passRate: b.passRate || 0,
    failed: b.failed || 0,
    date: b.buildDate
  }));

  const gradeColor = (grade) => {
    const map = { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444' };
    return map[grade] || '#6B7280';
  };

  const handleExpand = async (buildId) => {
    if (expandedBuild === buildId) {
      setExpandedBuild(null);
      setExpandedReport(null);
      return;
    }
    
    setExpandedBuild(buildId);
    setLoadingReport(true);
    try {
      const build = await fetchBuild(buildId);
      setExpandedReport(build);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDelete = async (buildId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this build and its report?')) return;
    try {
      await deleteBuild(buildId);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History size={22} className="text-primary" />
          Build History
        </h1>
        <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
          {builds.length} builds analysed
        </p>
      </div>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Pass Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2D2A3E' : '#E5E1F0'} />
              <XAxis dataKey="build" tick={{ fontSize: 11, fill: darkMode ? '#9794A8' : '#6B6880' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: darkMode ? '#9794A8' : '#6B6880' }} />
              <Tooltip
                contentStyle={{
                  background: darkMode ? '#221F31' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#2D2A3E' : '#E5E1F0'}`,
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="passRate" stroke="#6C63FF" strokeWidth={2.5}
                fill="url(#passGradient)" name="Pass Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Builds table */}
      {builds.length > 0 ? (
        <div className="space-y-2">
          {builds.map((build) => (
            <div key={build._id} className="card overflow-hidden">
              <div
                onClick={() => handleExpand(build._id)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-primary/5"
              >
                <div className="flex-shrink-0">
                  {expandedBuild === build._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <div className="grade-circle flex-shrink-0"
                  style={{ 
                    width: '40px', height: '40px', fontSize: '16px',
                    background: `linear-gradient(135deg, ${gradeColor(build.healthGrade)}, ${gradeColor(build.healthGrade)}cc)` 
                  }}>
                  {build.healthGrade || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Build #{build.buildNumber}</p>
                  <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                    {build.buildDate} • {build.environment}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs">
                  <div className="text-center">
                    <p className="font-bold">{build.totalTests || 0}</p>
                    <p style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Total</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-success">{build.passed || 0}</p>
                    <p style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-danger">{build.failed || 0}</p>
                    <p style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-primary">{build.passRate || 0}%</p>
                    <p style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Pass Rate</p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(build._id, e)}
                  className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-danger/60 hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded report */}
              {expandedBuild === build._id && (
                <div className="px-5 pb-5 border-t animate-fade-in"
                  style={{ borderColor: darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)' }}>
                  {loadingReport ? (
                    <div className="flex justify-center py-8"><div className="spinner" /></div>
                  ) : expandedReport?.rawReport ? (
                    <div className="mt-4 report-content max-h-[500px] overflow-y-auto pr-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {expandedReport.rawReport.substring(0, 2000)}
                      </ReactMarkdown>
                      {expandedReport.rawReport.length > 2000 && (
                        <p className="text-xs text-primary mt-2 cursor-pointer hover:underline"
                          onClick={() => navigate(`/history`)}>
                          ... Click to view full report
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm py-4" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                      No report content available
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <History size={40} className="mx-auto mb-4 text-primary opacity-40" />
          <p className="font-medium">No builds yet</p>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            Run your first analysis to see build history
          </p>
        </div>
      )}
    </div>
  );
}

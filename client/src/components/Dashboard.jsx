import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/useAuth';
import { Activity, TrendingUp, AlertTriangle, Bug, FlaskConical, ArrowRight, Clock, Zap } from 'lucide-react';

export default function Dashboard({ darkMode }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBuilds: 0,
    avgPassRate: 0,
    openRegressions: 0,
    flakyCount: 0,
    latestBuild: null,
    recentReports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [historyRes, reportsRes] = await Promise.all([
          api.get('/history').catch(() => ({ data: { builds: [] } })),
          api.get('/reports').catch(() => ({ data: { reports: [] } }))
        ]);

        const builds = historyRes.data.builds || [];
        const reports = reportsRes.data.reports || [];

        const avgPass = builds.length > 0
          ? Math.round(builds.reduce((sum, b) => sum + (b.passRate || 0), 0) / builds.length)
          : 0;

        setStats({
          totalBuilds: builds.length,
          avgPassRate: avgPass,
          openRegressions: builds.filter(b => b.releaseDecision === 'DO_NOT_RELEASE').length,
          flakyCount: builds.reduce((sum, b) => sum + (b.flakyTests?.length || 0), 0),
          latestBuild: builds[0] || null,
          recentReports: reports.slice(0, 5)
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const summaryCards = [
    { icon: Activity, label: 'Total Builds', value: stats.totalBuilds, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
    { icon: TrendingUp, label: 'Avg Pass Rate', value: `${stats.avgPassRate}%`, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { icon: AlertTriangle, label: 'Open Issues', value: stats.openRegressions, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { icon: Bug, label: 'Flaky Tests', value: stats.flakyCount, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ];

  const gradeColor = (grade) => {
    const map = { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444' };
    return map[grade] || '#6B7280';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            Your test intelligence overview
          </p>
        </div>
        <button onClick={() => navigate('/analyse')} className="btn-primary">
          <FlaskConical size={16} />
          Analyse New Build
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <div key={label} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-2xl font-bold">{loading ? '—' : value}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Build Health */}
        <div className="card p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Latest Build Health
          </h3>
          
          {stats.latestBuild ? (
            <div className="text-center py-4">
              <div className="grade-circle mx-auto mb-4"
                style={{ 
                  background: `linear-gradient(135deg, ${gradeColor(stats.latestBuild.healthGrade)}, ${gradeColor(stats.latestBuild.healthGrade)}dd)`,
                  width: '80px', height: '80px', fontSize: '32px'
                }}>
                {stats.latestBuild.healthGrade || '?'}
              </div>
              <p className="font-semibold">Build #{stats.latestBuild.buildNumber}</p>
              <p className="text-xs mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                {stats.latestBuild.buildDate} • {stats.latestBuild.passRate}% pass rate
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <span className="text-success font-medium">✓ {stats.latestBuild.passed} passed</span>
                <span className="text-danger font-medium">✕ {stats.latestBuild.failed} failed</span>
              </div>

              {/* Release decision banner */}
              {stats.latestBuild.releaseDecision && stats.latestBuild.releaseDecision !== 'UNKNOWN' && (
                <div className={`mt-4 px-4 py-2 rounded-xl text-sm font-bold ${
                  stats.latestBuild.releaseDecision === 'SAFE' ? 'banner-safe' :
                  stats.latestBuild.releaseDecision === 'DO_NOT_RELEASE' ? 'banner-danger' :
                  'banner-conditional'
                }`}>
                  {stats.latestBuild.releaseDecision === 'SAFE' ? '✅ Safe to Release' :
                   stats.latestBuild.releaseDecision === 'DO_NOT_RELEASE' ? '🚫 Do NOT Release' :
                   '⚠️ Conditional Release'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(108,99,255,0.1)' }}>
                <FlaskConical size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium">No builds yet</p>
              <p className="text-xs mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                Upload your first test case to get started
              </p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            Recent Reports
          </h3>
          
          {stats.recentReports.length > 0 ? (
            <div className="space-y-3">
              {stats.recentReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/history`)}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{ 
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grade-circle`} 
                      style={{ 
                        width: '36px', height: '36px', fontSize: '14px',
                        background: `linear-gradient(135deg, ${gradeColor(report.healthGrade)}, ${gradeColor(report.healthGrade)}dd)`
                      }}>
                      {report.healthGrade || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                No reports yet. Run your first analysis to see results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

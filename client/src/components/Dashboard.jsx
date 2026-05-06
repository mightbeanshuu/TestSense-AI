import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/useAuth';
import { Activity, TrendingUp, AlertTriangle, Bug, FlaskConical, ArrowRight, Clock, Zap, ArrowUpRight, BarChart3 } from 'lucide-react';

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
    { icon: Activity, label: 'Total Builds', value: stats.totalBuilds, gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', glow: '#7C3AED' },
    { icon: TrendingUp, label: 'Avg Pass Rate', value: `${stats.avgPassRate}%`, gradient: 'linear-gradient(135deg, #059669, #10B981)', glow: '#10B981' },
    { icon: AlertTriangle, label: 'Open Issues', value: stats.openRegressions, gradient: 'linear-gradient(135deg, #E11D48, #F43F5E)', glow: '#F43F5E' },
    { icon: Bug, label: 'Flaky Tests', value: stats.flakyCount, gradient: 'linear-gradient(135deg, #D97706, #F59E0B)', glow: '#F59E0B' },
  ];

  const gradeColor = (grade) => {
    const map = { A: '#10B981', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#F43F5E' };
    return map[grade] || '#71717A';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
            OVERVIEW
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Test Intelligence Dashboard</h1>
          <p className="text-sm mt-1.5" style={{ color: darkMode ? '#71717A' : '#A1A1AA' }}>
            Real-time insights into your test suite health and quality metrics.
          </p>
        </div>
        <button onClick={() => navigate('/analyse')} className="btn-primary flex-shrink-0">
          <FlaskConical size={15} />
          New Analysis
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ icon: Icon, label, value, gradient, glow }, i) => (
          <div key={label} className="stat-card animate-slide-up group cursor-default" 
            style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', filter: 'blur(35px)', opacity: 0.12, background: glow, pointerEvents: 'none', transition: 'opacity 0.3s' }} />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: gradient, boxShadow: `0 4px 12px ${glow}33` }}>
                <Icon size={18} className="text-white" />
              </div>
              <ArrowUpRight size={14} style={{ color: darkMode ? '#3F3F46' : '#D4D4D8' }} 
                className="group-hover:text-primary transition-colors" />
            </div>
            <p className="text-3xl font-bold tracking-tight relative z-10">{loading ? '—' : value}</p>
            <p className="text-[11px] font-medium mt-1.5 tracking-wide relative z-10" 
              style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Latest Build Health */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.1)' }}>
                <Zap size={11} style={{ color: '#A78BFA' }} />
              </div>
              Latest Build
            </h3>
            {stats.latestBuild && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                style={{ 
                  background: `${gradeColor(stats.latestBuild.healthGrade)}15`,
                  color: gradeColor(stats.latestBuild.healthGrade)
                }}>
                Grade {stats.latestBuild.healthGrade}
              </span>
            )}
          </div>
          
          {stats.latestBuild ? (
            <div className="text-center">
              <div className="grade-circle mx-auto mb-4"
                style={{ 
                  background: `linear-gradient(135deg, ${gradeColor(stats.latestBuild.healthGrade)}, ${gradeColor(stats.latestBuild.healthGrade)}bb)`,
                  width: '72px', height: '72px', fontSize: '28px',
                  boxShadow: `0 8px 30px ${gradeColor(stats.latestBuild.healthGrade)}33`
                }}>
                {stats.latestBuild.healthGrade || '?'}
              </div>
              <p className="font-semibold text-[15px]">Build #{stats.latestBuild.buildNumber}</p>
              <p className="text-xs mt-1" style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                {stats.latestBuild.buildDate} • {stats.latestBuild.passRate}% pass rate
              </p>
              
              {/* Pass/Fail bar */}
              <div className="mt-4 mx-auto max-w-[200px]">
                <div className="flex gap-1 h-2 rounded-full overflow-hidden"
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                  <div className="rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.latestBuild.passRate || 0}%`,
                      background: 'linear-gradient(90deg, #059669, #10B981)'
                    }} />
                  <div className="rounded-full transition-all duration-500"
                    style={{ 
                      width: `${100 - (stats.latestBuild.passRate || 0)}%`,
                      background: 'linear-gradient(90deg, #E11D48, #F43F5E)'
                    }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-medium">
                  <span className="text-success">{stats.latestBuild.passed} passed</span>
                  <span className="text-danger">{stats.latestBuild.failed} failed</span>
                </div>
              </div>

              {/* Release decision */}
              {stats.latestBuild.releaseDecision && stats.latestBuild.releaseDecision !== 'UNKNOWN' && (
                <div className={`mt-5 px-4 py-2.5 rounded-xl text-[12px] font-bold ${
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
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))' }}>
                <FlaskConical size={22} style={{ color: '#A78BFA' }} />
              </div>
              <p className="text-sm font-medium">No builds yet</p>
              <p className="text-xs mt-1.5" style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                Run your first analysis to get started
              </p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.1)' }}>
                <BarChart3 size={11} style={{ color: '#22D3EE' }} />
              </div>
              Recent Reports
            </h3>
            {stats.recentReports.length > 0 && (
              <button onClick={() => navigate('/reports')} 
                className="text-[11px] font-semibold flex items-center gap-1 transition-colors hover:text-primary"
                style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                View all <ArrowRight size={11} />
              </button>
            )}
          </div>
          
          {stats.recentReports.length > 0 ? (
            <div className="space-y-2">
              {stats.recentReports.map((report, i) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/history`)}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group"
                  style={{ 
                    background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                    e.currentTarget.style.background = darkMode ? 'rgba(124,58,237,0.04)' : 'rgba(124,58,237,0.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="grade-circle" 
                      style={{ 
                        width: '32px', height: '32px', fontSize: '12px',
                        background: `linear-gradient(135deg, ${gradeColor(report.healthGrade)}, ${gradeColor(report.healthGrade)}bb)`
                      }}>
                      {report.healthGrade || '?'}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{report.title}</p>
                      <p className="text-[11px]" style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-transparent group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                No reports yet. Run your first analysis to see results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

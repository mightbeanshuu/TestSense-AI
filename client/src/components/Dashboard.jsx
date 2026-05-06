import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/useAuth';
import { Activity, TrendingUp, AlertTriangle, Bug, FlaskConical, ArrowRight, Zap, BarChart3 } from 'lucide-react';

export default function Dashboard({ darkMode }) {
  const navigate = useNavigate();
  const dm = darkMode;
  const [stats, setStats] = useState({
    totalBuilds: 0, avgPassRate: 0, openRegressions: 0, flakyCount: 0,
    latestBuild: null, recentReports: []
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
          ? Math.round(builds.reduce((sum, b) => sum + (b.passRate || 0), 0) / builds.length) : 0;
        setStats({
          totalBuilds: builds.length, avgPassRate: avgPass,
          openRegressions: builds.filter(b => b.releaseDecision === 'DO_NOT_RELEASE').length,
          flakyCount: builds.reduce((sum, b) => sum + (b.flakyTests?.length || 0), 0),
          latestBuild: builds[0] || null,
          recentReports: reports.slice(0, 5)
        });
      } catch (err) { console.error('Failed:', err); }
      finally { setLoading(false); }
    }
    fetchStats();
  }, []);

  const cards = [
    { icon: Activity, label: 'Total Builds', value: stats.totalBuilds, color: '#7C3AED' },
    { icon: TrendingUp, label: 'Avg Pass Rate', value: `${stats.avgPassRate}%`, color: '#10B981' },
    { icon: AlertTriangle, label: 'Open Issues', value: stats.openRegressions, color: '#F43F5E' },
    { icon: Bug, label: 'Flaky Tests', value: stats.flakyCount, color: '#F59E0B' },
  ];

  const gc = (g) => ({ A: '#10B981', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#F43F5E' }[g] || '#666');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Dashboard</h1>
          <p className="text-[13px] mt-1" style={{ color: dm ? '#555' : '#999' }}>
            Test intelligence overview
          </p>
        </div>
        <button onClick={() => navigate('/analyse')} className="btn-primary">
          <FlaskConical size={14} /> New Analysis <ArrowRight size={12} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ icon: Icon, label, value, color }, i) => (
          <div key={label} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${color}12` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-[28px] font-bold tracking-tight leading-none">{loading ? '—' : value}</p>
            <p className="text-[11px] font-medium mt-2" style={{ color: dm ? '#555' : '#999' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Build health */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-[12px] font-semibold mb-4 flex items-center gap-2"
            style={{ color: dm ? '#777' : '#888' }}>
            <Zap size={12} style={{ color: '#A78BFA' }} /> LATEST BUILD
          </h3>
          
          {stats.latestBuild ? (
            <div className="text-center">
              <div className="grade-circle mx-auto mb-3"
                style={{ 
                  background: `linear-gradient(135deg, ${gc(stats.latestBuild.healthGrade)}, ${gc(stats.latestBuild.healthGrade)}bb)`,
                  width: '64px', height: '64px', fontSize: '24px'
                }}>
                {stats.latestBuild.healthGrade || '?'}
              </div>
              <p className="font-semibold text-[14px]">Build #{stats.latestBuild.buildNumber}</p>
              <p className="text-[11px] mt-0.5" style={{ color: dm ? '#555' : '#aaa' }}>
                {stats.latestBuild.buildDate} · {stats.latestBuild.passRate}% pass rate
              </p>
              
              {/* Progress bar */}
              <div className="mt-4 mx-auto max-w-[180px]">
                <div className="flex h-1.5 rounded-full overflow-hidden gap-px"
                  style={{ background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  {stats.latestBuild.passRate > 0 && (
                    <div className="rounded-full" style={{ 
                      width: `${stats.latestBuild.passRate}%`, background: '#10B981'
                    }} />
                  )}
                  {(100 - stats.latestBuild.passRate) > 0 && (
                    <div className="rounded-full" style={{ 
                      width: `${100 - stats.latestBuild.passRate}%`, background: '#F43F5E'
                    }} />
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] font-medium">
                  <span style={{ color: '#10B981' }}>{stats.latestBuild.passed} passed</span>
                  <span style={{ color: '#F43F5E' }}>{stats.latestBuild.failed} failed</span>
                </div>
              </div>

              {stats.latestBuild.releaseDecision && stats.latestBuild.releaseDecision !== 'UNKNOWN' && (
                <div className={`mt-4 px-3 py-2 rounded-lg text-[11px] font-bold ${
                  stats.latestBuild.releaseDecision === 'SAFE' ? 'banner-safe' :
                  stats.latestBuild.releaseDecision === 'DO_NOT_RELEASE' ? 'banner-danger' :
                  'banner-conditional'
                }`}>
                  {stats.latestBuild.releaseDecision === 'SAFE' ? '✅ Safe to Release' :
                   stats.latestBuild.releaseDecision === 'DO_NOT_RELEASE' ? '🚫 Do NOT Release' :
                   '⚠️ Conditional'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center animate-float"
                style={{ background: dm ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.04)' }}>
                <FlaskConical size={18} style={{ color: '#A78BFA' }} />
              </div>
              <p className="text-[13px] font-medium">No builds yet</p>
              <p className="text-[11px] mt-1" style={{ color: dm ? '#555' : '#aaa' }}>
                Run your first analysis
              </p>
            </div>
          )}
        </div>

        {/* Recent reports */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-semibold flex items-center gap-2"
              style={{ color: dm ? '#777' : '#888' }}>
              <BarChart3 size={12} style={{ color: '#22D3EE' }} /> RECENT REPORTS
            </h3>
            {stats.recentReports.length > 0 && (
              <button onClick={() => navigate('/reports')} 
                className="text-[10px] font-semibold flex items-center gap-1 transition-colors hover:text-primary"
                style={{ color: dm ? '#444' : '#bbb' }}>
                View all <ArrowRight size={10} />
              </button>
            )}
          </div>
          
          {stats.recentReports.length > 0 ? (
            <div className="space-y-1.5">
              {stats.recentReports.map((report) => (
                <div key={report._id} onClick={() => navigate('/history')}
                  className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200"
                  style={{ border: `1px solid transparent` }}
                  onMouseEnter={e => { e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'; e.currentTarget.style.borderColor = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grade-circle" style={{ 
                      width: '28px', height: '28px', fontSize: '11px',
                      background: `linear-gradient(135deg, ${gc(report.healthGrade)}, ${gc(report.healthGrade)}bb)`
                    }}>
                      {report.healthGrade || '?'}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium">{report.title}</p>
                      <p className="text-[10px]" style={{ color: dm ? '#444' : '#bbb' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={12} style={{ color: dm ? '#333' : '#ddd' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[12px]" style={{ color: dm ? '#444' : '#bbb' }}>
                Run your first analysis to see reports
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

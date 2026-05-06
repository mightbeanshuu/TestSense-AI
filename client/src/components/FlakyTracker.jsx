import { useEffect, useState, useMemo } from 'react';
import { api } from '../hooks/useAuth';
import { Bug, Filter, ArrowUpDown, TrendingDown, Activity } from 'lucide-react';

const RECOMMENDATIONS = {
  'MONITOR': { color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  'QUARANTINE': { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  'FIX NOW': { color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  'FIX_NOW': { color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  'DISABLE IMMEDIATELY': { color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  'DISABLE_IMMEDIATELY': { color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  'DISABLED': { color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

function flakinessColor(score) {
  if (score <= 20) return '#22C55E';
  if (score <= 50) return '#F59E0B';
  if (score <= 80) return '#F97316';
  return '#EF4444';
}

export default function FlakyTracker({ darkMode }) {
  const [flakyTests, setFlakyTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('flakinessScore');
  const [sortDir, setSortDir] = useState('desc');
  const [filterScore, setFilterScore] = useState('all');

  useEffect(() => {
    async function fetchFlaky() {
      try {
        const res = await api.get('/reports/flaky/all');
        setFlakyTests(res.data.flakyTests || []);
      } catch (err) {
        console.error('Failed to fetch flaky tests:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlaky();
  }, []);

  const filtered = useMemo(() => {
    let result = [...flakyTests];

    if (filterScore === 'low') result = result.filter(t => t.flakinessScore <= 20);
    else if (filterScore === 'medium') result = result.filter(t => t.flakinessScore > 20 && t.flakinessScore <= 50);
    else if (filterScore === 'high') result = result.filter(t => t.flakinessScore > 50 && t.flakinessScore <= 80);
    else if (filterScore === 'critical') result = result.filter(t => t.flakinessScore > 80);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'flakinessScore') cmp = (a.flakinessScore || 0) - (b.flakinessScore || 0);
      else if (sortField === 'name') cmp = (a.testName || '').localeCompare(b.testName || '');
      else if (sortField === 'lastSeen') cmp = (a.lastSeen || '').localeCompare(b.lastSeen || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [flakyTests, filterScore, sortField, sortDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug size={22} className="text-warning" />
            Flaky Test Tracker
          </h1>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            {flakyTests.length} flaky tests detected across all builds
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'low', label: '0-20%', color: '#22C55E' },
            { id: 'medium', label: '21-50%', color: '#F59E0B' },
            { id: 'high', label: '51-80%', color: '#F97316' },
            { id: 'critical', label: '81-100%', color: '#EF4444' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterScore(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterScore === f.id ? 'text-white' : ''
              }`}
              style={filterScore === f.id 
                ? { background: f.color || 'var(--color-primary)' }
                : { background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 text-xs">
        <span style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Sort by:</span>
        {[
          { id: 'flakinessScore', label: 'Score' },
          { id: 'name', label: 'Name' },
          { id: 'lastSeen', label: 'Last Seen' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => {
              if (sortField === s.id) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
              else { setSortField(s.id); setSortDir('desc'); }
            }}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              sortField === s.id ? 'text-primary' : ''
            }`}
            style={sortField !== s.id ? { color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' } : {}}
          >
            {s.label} {sortField === s.id && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
        ))}
      </div>

      {/* Flaky test cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((test, i) => {
            const recConfig = RECOMMENDATIONS[test.recommendation?.toUpperCase()] || RECOMMENDATIONS['MONITOR'];
            const color = flakinessColor(test.flakinessScore || 0);
            
            return (
              <div key={test.testId || i} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{test.testName || test.testId}</p>
                    <p className="text-xs font-mono text-primary">{test.testId}</p>
                  </div>
                  <span className="badge text-xs" style={{ background: recConfig.bg, color: recConfig.color }}>
                    {(test.recommendation || 'MONITOR').replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Flakiness bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                      Flakiness Score
                    </span>
                    <span className="font-bold" style={{ color }}>{test.flakinessScore || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                  }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${test.flakinessScore || 0}%`, background: color }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Pass Rate</p>
                    <p className="text-sm font-bold">{test.passRate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Builds</p>
                    <p className="text-sm font-bold">{test.buildCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>Last Seen</p>
                    <p className="text-sm font-bold">{test.lastSeen || 'N/A'}</p>
                  </div>
                </div>

                {/* Root cause */}
                {test.rootCause && test.rootCause !== 'Unknown' && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <span className="font-medium">Root Cause: </span>
                    <span style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                      {test.rootCause}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Activity size={40} className="mx-auto mb-4 text-primary opacity-40" />
          <p className="font-medium">No flaky tests found</p>
          <p className="text-sm mt-1" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            {flakyTests.length === 0 
              ? 'Run some analyses to detect flaky tests'
              : 'No tests match the current filter'}
          </p>
        </div>
      )}
    </div>
  );
}

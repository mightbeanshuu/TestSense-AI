import { useState, useMemo } from 'react';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

export default function TestTable({ data, darkMode }) {
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'REGRESSION', 'FLAKY', 'CONSISTENTLY FAILING', 'STABLE PASSING', 'NEW TEST', 'SKIPPED', 'FIXED'];

  // Parse markdown table into rows
  const rows = useMemo(() => {
    if (!data) return [];
    
    if (Array.isArray(data)) return data;
    
    // Parse from markdown table
    const lines = data.split('\n').filter(l => l.startsWith('|') && !l.includes('---'));
    if (lines.length < 2) return [];
    
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    
    return lines.slice(1).map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      const row = {};
      headers.forEach((h, i) => {
        const key = h.toLowerCase().replace(/\s+/g, '_');
        row[key] = cells[i] || '';
      });
      return {
        id: row.test_id || row.id || '',
        name: row.test_name || row.name || '',
        category: (row.category || '').replace(/[🔴🎲💀✅🆕⏭️🔧]/g, '').trim(),
        confidence: row.confidence || '',
        reason: row.reason || ''
      };
    });
  }, [data]);

  const filtered = useMemo(() => {
    let result = rows;
    
    if (filterCategory !== 'ALL') {
      result = result.filter(r => r.category?.toUpperCase().includes(filterCategory));
    }
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => 
        r.id?.toLowerCase().includes(s) || 
        r.name?.toLowerCase().includes(s) ||
        r.reason?.toLowerCase().includes(s)
      );
    }
    
    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [rows, filterCategory, search, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" 
            style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }} />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCategory === cat ? 'bg-primary text-white' : ''
              }`}
              style={filterCategory !== cat ? {
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)'
              } : {}}
            >
              {cat === 'ALL' ? 'All' : cat.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{
        border: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}`
      }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ 
              background: darkMode ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)',
              borderBottom: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}`
            }}>
              {[
                { key: 'id', label: 'Test ID' },
                { key: 'name', label: 'Test Name' },
                { key: 'category', label: 'Category' },
                { key: 'confidence', label: 'Confidence' },
                { key: 'reason', label: 'Reason' }
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
                  style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={12} className={sortField === col.key ? 'text-primary' : 'opacity-30'} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-primary/5"
                style={{ borderBottom: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}` }}>
                <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{row.id}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3"><CategoryBadge category={row.category} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${
                    row.confidence?.toUpperCase() === 'HIGH' ? 'text-success' :
                    row.confidence?.toUpperCase() === 'MEDIUM' ? 'text-warning' : 'text-danger'
                  }`}>
                    {row.confidence}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs max-w-[300px] truncate" 
                  style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
                  {row.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
            No tests match your filters
          </div>
        )}
      </div>
      <p className="text-xs" style={{ color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)' }}>
        Showing {filtered.length} of {rows.length} tests
      </p>
    </div>
  );
}

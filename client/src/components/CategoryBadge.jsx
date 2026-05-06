export default function CategoryBadge({ category }) {
  const config = {
    'REGRESSION':            { emoji: '🔴', className: 'badge-regression', label: 'Regression' },
    'FLAKY':                 { emoji: '🎲', className: 'badge-flaky', label: 'Flaky' },
    'CONSISTENTLY FAILING':  { emoji: '💀', className: 'badge-failing', label: 'Failing' },
    'CONSISTENTLY_FAILING':  { emoji: '💀', className: 'badge-failing', label: 'Failing' },
    'STABLE PASSING':        { emoji: '✅', className: 'badge-passing', label: 'Passing' },
    'STABLE_PASSING':        { emoji: '✅', className: 'badge-passing', label: 'Passing' },
    'NEW TEST':              { emoji: '🆕', className: 'badge-new', label: 'New' },
    'NEW_TEST':              { emoji: '🆕', className: 'badge-new', label: 'New' },
    'SKIPPED':               { emoji: '⏭️', className: 'badge-skipped', label: 'Skipped' },
    'BLOCKED':               { emoji: '⏭️', className: 'badge-skipped', label: 'Blocked' },
    'SKIPPED/BLOCKED':       { emoji: '⏭️', className: 'badge-skipped', label: 'Skipped' },
    'FIXED':                 { emoji: '🔧', className: 'badge-fixed', label: 'Fixed' },
  };

  const normalized = (category || '').toUpperCase().trim();
  const match = config[normalized] || { emoji: '📋', className: 'badge-skipped', label: category || 'Unknown' };

  return (
    <span className={`badge ${match.className}`}>
      <span>{match.emoji}</span>
      <span>{match.label}</span>
    </span>
  );
}

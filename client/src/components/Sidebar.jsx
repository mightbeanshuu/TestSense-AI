import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, History, FileText, Bug, Menu, X, Zap } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analyse', icon: FlaskConical, label: 'Analyse' },
  { path: '/history', icon: History, label: 'Build History' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/flaky', icon: Bug, label: 'Flaky Tracker' },
];

export default function Sidebar({ collapsed, setCollapsed, darkMode }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-0 lg:w-20' : 'w-[260px]'
        }`}
        style={{
          background: darkMode 
            ? 'linear-gradient(180deg, #1A1726 0%, #0F0D1A 100%)' 
            : 'linear-gradient(180deg, #FFFFFF 0%, #F8F7FC 100%)',
          borderRight: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}`,
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
            <Zap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold gradient-text">TestSense</h1>
              <p className="text-[10px] font-medium opacity-50 tracking-widest uppercase">AI Analysis</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive 
                  ? 'text-white' 
                  : darkMode 
                    ? 'text-dark-muted hover:text-dark-text hover:bg-white/5' 
                    : 'text-light-muted hover:text-light-text hover:bg-black/5'
                }
              `}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)'
              } : {}}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                  style={{ 
                    background: darkMode ? 'var(--color-dark-card)' : 'var(--color-light-card)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t hidden lg:block"
          style={{ borderColor: darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
            style={{ 
              color: darkMode ? 'var(--color-dark-muted)' : 'var(--color-light-muted)',
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' 
            }}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 p-2 rounded-xl lg:hidden"
        style={{ 
          background: darkMode ? 'var(--color-dark-card)' : 'var(--color-light-card)',
          border: `1px solid ${darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)'}` 
        }}
      >
        <Menu size={20} />
      </button>
    </>
  );
}

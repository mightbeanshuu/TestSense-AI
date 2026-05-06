import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, History, FileText, Bug, Menu, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & stats' },
  { path: '/analyse', icon: FlaskConical, label: 'Analyse', desc: 'Run AI analysis' },
  { path: '/history', icon: History, label: 'Build History', desc: 'Past builds' },
  { path: '/reports', icon: FileText, label: 'Reports', desc: 'Export & share' },
  { path: '/flaky', icon: Bug, label: 'Flaky Tracker', desc: 'Track flaky tests' },
];

export default function Sidebar({ collapsed, setCollapsed, darkMode }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-0 lg:w-[72px]' : 'w-[260px]'
        }`}
        style={{
          background: darkMode 
            ? 'linear-gradient(180deg, #111113 0%, #09090B 100%)' 
            : 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F5 100%)',
          borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 relative"
          style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Zap size={19} className="text-white" />
            <div className="absolute inset-0 rounded-xl" 
              style={{ boxShadow: '0 0 20px rgba(124,58,237,0.3)' }} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-[15px] font-bold gradient-text tracking-tight">TestSense</h1>
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                AI INTELLIGENCE
              </p>
            </div>
          )}
        </div>

        {/* Section label */}
        {!collapsed && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: darkMode ? '#3F3F46' : '#D4D4D8' }}>
              NAVIGATION
            </p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-2 px-2.5 space-y-0.5">
          {navItems.map(({ path, icon: Icon, label, desc }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                transition-all duration-200 group relative
                ${isActive 
                  ? 'text-white' 
                  : darkMode 
                    ? 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-white/[0.04]' 
                    : 'text-[#71717A] hover:text-[#09090B] hover:bg-black/[0.03]'
                }
              `}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
              } : {}}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors`}>
                <Icon size={17} className="flex-shrink-0" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block leading-tight">{label}</span>
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 rounded-xl text-xs font-medium
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 
                  translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-[9999]"
                  style={{ 
                    background: darkMode ? '#27272A' : '#FFFFFF',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    color: darkMode ? '#FAFAFA' : '#09090B'
                  }}>
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="rounded-xl p-3 mb-3" style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))'
                : 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(6,182,212,0.03))',
              border: `1px solid ${darkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)'}`
            }}>
              <p className="text-[11px] font-semibold" style={{ color: darkMode ? '#A78BFA' : '#7C3AED' }}>
                Pro Tip
              </p>
              <p className="text-[10px] mt-1 leading-relaxed" style={{ color: darkMode ? '#71717A' : '#A1A1AA' }}>
                Upload historical logs for deeper trend analysis and flaky detection.
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="p-2.5 hidden lg:block"
          style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ 
              color: darkMode ? '#52525B' : '#A1A1AA',
              background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' 
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl lg:hidden transition-all active:scale-95"
        style={{ 
          background: darkMode ? 'rgba(28,28,34,0.9)' : 'rgba(255,255,255,0.9)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Menu size={18} />
      </button>
    </>
  );
}

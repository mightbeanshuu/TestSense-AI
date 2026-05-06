import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, History, FileText, Bug, Menu, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analyse', icon: FlaskConical, label: 'Analyse' },
  { path: '/history', icon: History, label: 'Build History' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/flaky', icon: Bug, label: 'Flaky Tracker' },
];

export default function Sidebar({ collapsed, setCollapsed, darkMode }) {
  const dm = darkMode;
  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setCollapsed(true)}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collapsed ? 'w-0 lg:w-[64px]' : 'w-[240px]'
        }`}
        style={{
          background: dm ? '#0E0E10' : '#FAFAFA',
          borderRight: `1px solid ${dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-[56px] flex-shrink-0"
          style={{ borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Zap size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <span className="text-[14px] font-bold tracking-tight gradient-text">TestSense</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium
                transition-all duration-200 group relative
                ${isActive 
                  ? 'text-white' 
                  : dm ? 'text-[#666] hover:text-[#ccc] hover:bg-white/[0.03]' 
                       : 'text-[#888] hover:text-[#333] hover:bg-black/[0.03]'
                }
              `}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                boxShadow: '0 2px 12px rgba(124,58,237,0.25)'
              } : {}}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[999]"
                  style={{ 
                    background: dm ? '#222' : '#fff',
                    border: `1px solid ${dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    color: dm ? '#eee' : '#333'
                  }}>
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse */}
        <div className="p-2 hidden lg:block flex-shrink-0"
          style={{ borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` }}>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-xs transition-all duration-200"
            style={{ color: dm ? '#444' : '#bbb' }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Mobile burger */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3.5 left-3 z-50 p-2 rounded-lg lg:hidden transition-all active:scale-95"
        style={{ 
          background: dm ? 'rgba(14,14,16,0.9)' : 'rgba(255,255,255,0.9)',
          border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          backdropFilter: 'blur(8px)'
        }}>
        <Menu size={16} />
      </button>
    </>
  );
}

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, Bell, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 glass" style={{ 
      left: 'var(--sidebar-width, 260px)',
      transition: 'left 0.3s ease'
    }}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Status pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
            background: darkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)'}`
          }}>
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-semibold text-success tracking-wide">ONLINE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
            background: darkMode ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.05)',
          }}>
            <Sparkles size={11} style={{ color: '#A78BFA' }} />
            <span className="text-[10px] font-medium" style={{ color: darkMode ? '#A78BFA' : '#7C3AED' }}>
              Groq AI
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: darkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(124, 58, 237, 0.06)',
              border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(124, 58, 237, 0.08)'}`
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun size={15} className="text-warning" />
            ) : (
              <Moon size={15} className="text-primary" />
            )}
          </button>

          {/* Notifications */}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 relative"
            style={{ 
              background: darkMode ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)',
              border: `1px solid ${darkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)'}`
            }}>
            <Bell size={15} style={{ color: '#A78BFA' }} />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                border: `2px solid ${darkMode ? '#18181B' : '#FFFFFF'}`,
                boxShadow: '0 0 8px rgba(244,63,94,0.4)'
              }} />
          </button>

          {/* User menu */}
          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-[13px] font-medium hidden sm:inline">{user.name}</span>
                <ChevronDown size={12} style={{ color: darkMode ? '#52525B' : '#A1A1AA' }} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl py-1.5 z-50 animate-slide-up"
                    style={{ 
                      background: darkMode ? '#1C1C22' : '#FFFFFF',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: darkMode 
                        ? '0 16px 48px rgba(0,0,0,0.5)' 
                        : '0 16px 48px rgba(0,0,0,0.12)'
                    }}>
                    <div className="px-4 py-3" 
                      style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                      <p className="text-[13px] font-semibold">{user.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: darkMode ? '#52525B' : '#A1A1AA' }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
                        style={{ color: '#F43F5E' }}
                        onMouseEnter={e => e.target.style.background = 'rgba(244,63,94,0.08)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

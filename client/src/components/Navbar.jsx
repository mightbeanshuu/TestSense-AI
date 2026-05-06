import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, Activity, User, Bell } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 glass" style={{ 
      left: 'var(--sidebar-width, 260px)',
      transition: 'left 0.3s ease'
    }}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: App status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">System Online</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Dark/Light toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
            style={{
              background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(108, 99, 255, 0.1)',
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun size={18} className="text-warning" />
            ) : (
              <Moon size={18} className="text-primary" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-xl transition-all duration-300 hover:scale-110 relative"
            style={{ background: 'rgba(108, 99, 255, 0.1)' }}>
            <Bell size={18} className="text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-danger border-2"
              style={{ borderColor: darkMode ? 'var(--color-dark-surface)' : 'var(--color-light-surface)' }} />
          </button>

          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(139, 133, 255, 0.1))',
                  border: '1px solid rgba(108, 99, 255, 0.2)'
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2 z-50 card animate-slide-up"
                    style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                    <div className="px-4 py-2 border-b" style={{ borderColor: darkMode ? 'var(--color-dark-border)' : 'var(--color-light-border)' }}>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs opacity-60">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
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

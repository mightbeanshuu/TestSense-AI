import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, Bell, ChevronDown } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const dm = darkMode;

  return (
    <nav className="fixed top-0 right-0 z-40 glass" style={{ 
      left: 'var(--sidebar-width, 240px)',
      transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      height: '56px'
    }}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Left */}
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[11px] font-medium" style={{ color: dm ? '#555' : '#aaa' }}>
            System Online
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setDarkMode(!dm)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{ background: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            {dm ? <Sun size={14} style={{ color: '#F59E0B' }} /> : <Moon size={14} style={{ color: '#7C3AED' }} />}
          </button>

          <button className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-all duration-200 hover:scale-105"
            style={{ background: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            <Bell size={14} style={{ color: dm ? '#555' : '#999' }} />
          </button>

          {user && (
            <div className="relative ml-1">
              <button onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg transition-all duration-200 hover:bg-white/[0.03]"
                style={{ border: `1px solid ${dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-[12px] font-medium hidden sm:inline">{user.name}</span>
                <ChevronDown size={10} style={{ color: dm ? '#444' : '#bbb' }} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg py-1 z-50 animate-slide-up"
                    style={{ 
                      background: dm ? '#1A1A1E' : '#fff',
                      border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                    }}>
                    <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <p className="text-[12px] font-semibold">{user.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: dm ? '#555' : '#aaa' }}>{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { logout(); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-[12px] font-medium text-danger transition-colors hover:bg-danger/10">
                        <LogOut size={12} /> Sign Out
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

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FlakyTracker from './components/FlakyTracker';

// Pages
import Home from './pages/Home';
import Analyse from './pages/Analyse';
import History from './pages/History';
import Reports from './pages/Reports';
import Login from './pages/Login';

function ProtectedRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('testsense_darkmode');
    return saved !== null ? saved === 'true' : true; // default dark
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Apply theme to body
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem('testsense_darkmode', darkMode);
  }, [darkMode]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
        style={{ background: 'var(--color-dark-bg)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
          <p className="text-sm" style={{ color: 'var(--color-dark-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Auth pages (no sidebar/navbar)
  if (!user) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: darkMode ? '#221F31' : '#FFFFFF',
            color: darkMode ? '#E8E6F0' : '#1E1B2E',
            border: `1px solid ${darkMode ? '#2D2A3E' : '#E5E1F0'}`,
            borderRadius: '12px',
            fontSize: '14px'
          }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  const sidebarWidth = sidebarCollapsed ? (window.innerWidth >= 1024 ? '64px' : '0px') : '240px';

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: darkMode ? '#221F31' : '#FFFFFF',
          color: darkMode ? '#E8E6F0' : '#1E1B2E',
          border: `1px solid ${darkMode ? '#2D2A3E' : '#E5E1F0'}`,
          borderRadius: '12px',
          fontSize: '14px'
        }
      }} />

      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        darkMode={darkMode} 
      />

      <div 
        className="min-h-screen transition-all duration-300"
        style={{ 
          marginLeft: sidebarWidth,
          '--sidebar-width': sidebarWidth
        }}
      >
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <main style={{ paddingTop: '80px', paddingBottom: '40px' }} className="px-5 sm:px-7 lg:px-8 relative z-10">
          <div className="max-w-[1100px] mx-auto">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute user={user}><Home darkMode={darkMode} /></ProtectedRoute>
              } />
              <Route path="/analyse" element={
                <ProtectedRoute user={user}><Analyse darkMode={darkMode} /></ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute user={user}><History darkMode={darkMode} /></ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute user={user}><Reports darkMode={darkMode} /></ProtectedRoute>
              } />
              <Route path="/flaky" element={
                <ProtectedRoute user={user}><FlakyTracker darkMode={darkMode} /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

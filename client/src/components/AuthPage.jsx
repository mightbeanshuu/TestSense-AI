import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-dark-bg)' }}>
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1726 0%, #2D1B69 50%, #6C63FF 100%)' }}>
        
        {/* Animated orbs */}
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #8B85FF, transparent)', top: '10%', left: '10%' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-15 animate-pulse"
          style={{ background: 'radial-gradient(circle, #6C63FF, transparent)', bottom: '15%', right: '10%', animationDelay: '1s' }} />
        
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Zap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">TestSense AI</h1>
          <p className="text-lg text-white/60 max-w-md mx-auto leading-relaxed">
            AI-powered test intelligence that transforms hours of manual review into 10-second actionable reports.
          </p>
          <div className="flex items-center justify-center gap-8 mt-12">
            {[
              { num: '10s', label: 'Analysis Time' },
              { num: '7', label: 'Test Categories' },
              { num: 'A-F', label: 'Health Grades' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">TestSense AI</h1>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-dark-text)' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-dark-muted)' }}>
            {isLogin 
              ? 'Sign in to access your test intelligence dashboard' 
              : 'Start analysing your test cases with AI'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-slide-up">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" 
                  style={{ color: 'var(--color-dark-muted)' }} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" 
                style={{ color: 'var(--color-dark-muted)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" 
                style={{ color: 'var(--color-dark-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11 pr-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-dark-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--color-dark-muted)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

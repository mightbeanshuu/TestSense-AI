import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, Loader2, Shield, BarChart3, Bug } from 'lucide-react';

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

  const features = [
    { icon: Zap, label: '10-Second Analysis', desc: 'AI-powered instant reports' },
    { icon: Shield, label: 'Release Decisions', desc: 'Safe / Conditional / Block' },
    { icon: BarChart3, label: 'Quality Scorecards', desc: 'A-F grading system' },
    { icon: Bug, label: 'Flaky Detection', desc: 'Pattern-based tracking' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#09090B' }}>
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #09090B 0%, #1a0a2e 40%, #0f172a 100%)' }}>
        
        {/* Ambient orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)', 
            top: '-10%', left: '20%',
            animation: 'float 8s ease-in-out infinite'
          }} />
        <div className="absolute w-[400px] h-[400px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)', 
            bottom: '0%', right: '10%',
            animation: 'float 6s ease-in-out infinite reverse'
          }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        
        <div className="relative z-10 px-12 max-w-lg">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
              boxShadow: '0 0 40px rgba(124,58,237,0.3)'
            }}>
            <Zap size={28} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            TestSense <span style={{ color: '#A78BFA' }}>AI</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-10" style={{ color: '#71717A' }}>
            Transform hours of manual test review into actionable intelligence in seconds. 
            Built for engineering teams who ship fast.
          </p>
          
          {/* Feature cards */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex items-center gap-4 p-3 rounded-xl animate-slide-up"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.12)' }}>
                  <Icon size={16} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{label}</p>
                  <p className="text-[11px]" style={{ color: '#52525B' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10 mt-10 pt-8" 
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { num: '~10s', label: 'Analysis' },
              { num: '7', label: 'Categories' },
              { num: 'A-F', label: 'Grading' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold gradient-text">{num}</p>
                <p className="text-[10px] font-medium mt-1 tracking-wider uppercase" 
                  style={{ color: '#3F3F46' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" 
        style={{ background: '#09090B' }}>
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">TestSense AI</h1>
          </div>

          <h2 className="text-[22px] font-bold mb-1.5 tracking-tight" style={{ color: '#FAFAFA' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-[13px] mb-7" style={{ color: '#52525B' }}>
            {isLogin 
              ? 'Sign in to your test intelligence dashboard' 
              : 'Start analysing your test cases with AI'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-[13px] font-medium animate-slide-up"
              style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div className="relative animate-slide-up">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" 
                  style={{ color: '#3F3F46' }} />
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
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" 
                style={{ color: '#3F3F46' }} />
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
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" 
                style={{ color: '#3F3F46' }} />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                style={{ color: '#3F3F46' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-[14px] mt-2"
              style={{ borderRadius: '12px' }}
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-[13px] text-center mt-6" style={{ color: '#52525B' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold transition-colors hover:underline"
              style={{ color: '#A78BFA' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

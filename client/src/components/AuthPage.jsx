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
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0C' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A0A0C 0%, #15072b 50%, #0c1624 100%)' }}>
        
        {/* Soft orbs */}
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ 
          background: 'radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)', top: '5%', left: '20%' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full" style={{ 
          background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)', bottom: '10%', right: '15%' }} />
        
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative z-10 px-14 max-w-md">
          <div className="w-12 h-12 rounded-xl mb-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            TestSense <span style={{ color: '#A78BFA' }}>AI</span>
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#555' }}>
            Transform hours of manual test review into actionable intelligence in seconds.
          </p>
          
          <div className="flex gap-8 mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {[{ n: '~10s', l: 'Analysis' }, { n: '7', l: 'Categories' }, { n: 'A-F', l: 'Grades' }].map(({ n, l }) => (
              <div key={l}>
                <p className="text-lg font-bold gradient-text">{n}</p>
                <p className="text-[9px] font-medium mt-1 tracking-wider uppercase" style={{ color: '#333' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-[14px] font-bold gradient-text">TestSense AI</span>
          </div>

          <h2 className="text-[20px] font-bold mb-1 tracking-tight" style={{ color: '#F0F0F2' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-[12px] mb-6" style={{ color: '#555' }}>
            {isLogin ? 'Sign in to your dashboard' : 'Start analysing with AI'}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-[12px] font-medium animate-slide-up"
              style={{ background: 'rgba(244,63,94,0.07)', color: '#F43F5E', border: '1px solid rgba(244,63,94,0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="relative animate-slide-up">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#333' }} />
                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" />
              </div>
            )}
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#333' }} />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#333' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-10" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#333' }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-[13px] mt-1">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={13} /></>}
            </button>
          </form>

          <p className="text-[12px] text-center mt-5" style={{ color: '#444' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold hover:underline" style={{ color: '#A78BFA' }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

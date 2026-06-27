import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardHat, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const fillCredentials = (role) => {
    switch (role) {
      case 'admin':
        setEmail('admin@tracker.com');
        setPassword('Admin123!');
        break;
      case 'manager':
        setEmail('manager@tracker.com');
        setPassword('Manager123!');
        break;
      case 'engineer':
        setEmail('engineer@tracker.com');
        setPassword('Engineer123!');
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Visual background elements */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo and Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-indigo-600 p-3.5 text-white shadow-xl shadow-indigo-600/30">
            <HardHat size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">ConstructAI</h2>
          <p className="mt-2 text-sm text-slate-400">Enterprise Site Progress & Risk Tracking Dashboard</p>
        </div>

        {/* Login Form Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 p-3.5 text-xs text-rose-300">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick-select Test Credentials */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h5 className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo Accounts Quick Fill</h5>
            <div className="mt-3.5 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => fillCredentials('admin')}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-white/10 hover:text-rose-200 transition-all"
              >
                Admin
              </button>
              <button
                onClick={() => fillCredentials('manager')}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-all"
              >
                PM Manager
              </button>
              <button
                onClick={() => fillCredentials('engineer')}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-white/10 hover:text-emerald-200 transition-all"
              >
                Engineer
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;

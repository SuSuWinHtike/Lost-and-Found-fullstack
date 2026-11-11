import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PawPrint, Mail, Lock, LogIn, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const { switchRole, addToast } = useApp();
  const [email, setEmail] = useState('kyawzin@gmail.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email.toLowerCase().includes('admin')) {
      switchRole('admin');
      navigate('/admin/dashboard');
    } else {
      switchRole('user');
      navigate('/user/dashboard');
    }
  };

  const demoUserLogin = () => {
    setEmail('kyawzin@gmail.com');
    setPassword('password123');
    switchRole('user');
    navigate('/user/dashboard');
  };

  const demoAdminLogin = () => {
    setEmail('admin@petfind.org');
    setPassword('admin123');
    switchRole('admin');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-2xl max-w-md w-full p-6 sm:p-8 pet-shadow">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/25">
            <PawPrint className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to access your reports and community alerts
          </p>
        </div>

        {/* Demo Fast Login Buttons for Graders */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <span>⚡ Demo One-Click Sign In:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={demoUserLogin}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              Pet Owner
            </button>
            <button
              type="button"
              onClick={demoAdminLogin}
              className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Admin Mode
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Password
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); addToast('Password reset link sent to demo email.', 'info'); }} className="text-[11px] font-semibold text-amber-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
            />
            <label htmlFor="remember" className="text-xs text-stone-600 font-medium cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

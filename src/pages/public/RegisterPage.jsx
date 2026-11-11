import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PawPrint, User, Mail, Phone, Lock, UserPlus, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const { switchRole, addToast } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please agree to community terms & safety policies.');
      return;
    }

    addToast(`Account created successfully! Welcome to PetLove, ${fullName}.`, 'success');
    switchRole('user');
    navigate('/user/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-2xl max-w-lg w-full p-6 sm:p-8 pet-shadow">
        
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/25">
            <PawPrint className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Create Free Account
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Join the community network helping lost pets return home safely
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(''); }}
                placeholder="e.g. Kyaw Zin Htet"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Phone Number (For Pet Inquiries) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                placeholder="+95 9 798 123 456"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
            />
            <label htmlFor="terms" className="text-xs text-stone-600 leading-normal cursor-pointer">
              I agree to the Community Guidelines, Privacy Policy, and promise to provide accurate pet reporting info.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Complete Registration
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

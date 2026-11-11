import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PawPrint, User, Mail, Phone, Lock, UserPlus, MapPin, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const { register, locations, addToast } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Yangon Region');
  const [selectedTownship, setSelectedTownship] = useState('Hlaing Township');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute available townships for the chosen state/region
  const availableTownships = useMemo(() => {
    const r = locations.find(l => l.region === selectedRegion);
    return r?.cities?.[0]?.townships || ['Hlaing Township', 'Kamayut Township', 'Bahan Township'];
  }, [selectedRegion, locations]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreed) {
      setError('Please agree to community terms & safety policies.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await register({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
        state_region: selectedRegion,
        township: selectedTownship,
      });

      // Once registered, user is authenticated with token in DB
      navigate('/user/dashboard');
    } catch (err) {
      let msg = 'Registration failed. Please check your information.';
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        msg = err.response.data.errors[firstErrorKey][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
                placeholder="e.g. Su Su Win Htike"
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

          {/* Location: State/Region & Township */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                State / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    const nextRegion = e.target.value;
                    setSelectedRegion(nextRegion);
                    const r = locations.find(l => l.region === nextRegion);
                    const firstTownship = r?.cities?.[0]?.townships?.[0] || '';
                    setSelectedTownship(firstTownship);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white cursor-pointer"
                >
                  {locations.map(l => (
                    <option key={l.id || l.region} value={l.region}>{l.region}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Township
              </label>
              <select
                value={selectedTownship}
                onChange={(e) => setSelectedTownship(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white cursor-pointer"
              >
                {availableTownships.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer transition p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer transition p-0.5"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
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
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-stone-600 leading-normal cursor-pointer">
              I agree to the Community Guidelines, Privacy Policy, and promise to provide accurate pet reporting info.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
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

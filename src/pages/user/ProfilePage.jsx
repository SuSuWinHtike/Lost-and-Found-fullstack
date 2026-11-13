import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import dashboardService from '../../services/dashboardService';
import authService from '../../services/authService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Save,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Upload
} from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, setCurrentUser, locations = [], addToast } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [stateRegion, setStateRegion] = useState(currentUser?.state_region || 'Yangon Region');
  const [township, setTownship] = useState(currentUser?.township || 'Hlaing Township');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setTownship(currentUser.township || 'Hlaing Township');
      setStateRegion(currentUser.state_region || 'Yangon Region');
      if (currentUser.avatar) {
        setAvatar(
          currentUser.avatar.startsWith('/storage')
            ? ('http://127.0.0.1:8000' + currentUser.avatar)
            : currentUser.avatar
        );
      }
    }
  }, [currentUser]);

  // Derived location dropdowns
  const availableCities = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    const r = locations.find(l => l && (l.region === stateRegion || l.name === stateRegion));
    return r ? (r.cities || []) : [];
  }, [stateRegion, locations]);

  const availableTownships = useMemo(() => {
    if (!Array.isArray(availableCities) || availableCities.length === 0) {
      return ['Kamayut Township', 'Hlaing Township', 'Bahan Township', 'Mayangone Township', 'Sanchaung Township'];
    }
    return availableCities[0]?.townships || ['Kamayut Township', 'Hlaing Township', 'Bahan Township'];
  }, [availableCities]);

  // Handle local avatar file selection & immediate upload
  const handleAvatarChange = async (e) => {
    const input = e.target;
    const file = e.target.files?.[0];
    input.value = '';
    if (!file) return;

    if (!authService.isAuthenticated()) {
      if (addToast) addToast('Please sign in to update your profile picture.', 'error');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      if (addToast) addToast('Choose a JPG, PNG, or WebP image.', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      if (addToast) addToast('Profile pictures must be 3 MB or smaller.', 'error');
      return;
    }

    const previousAvatar = avatar;
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await dashboardService.updateAvatar(form);
      if (!res.user?.avatar) {
        throw new Error('The server did not return the updated profile picture.');
      }

      const formattedUser = {
        ...res.user,
        avatar: res.user.avatar.startsWith('/storage')
          ? 'http://127.0.0.1:8000' + res.user.avatar
          : res.user.avatar
      };
      setCurrentUser(formattedUser);
      localStorage.setItem('petlove_user', JSON.stringify(formattedUser));
      setAvatar(formattedUser.avatar);
      if (addToast) addToast('Profile picture uploaded & updated!', 'success');
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setAvatar(previousAvatar);
      const msg = err.response?.data?.errors?.avatar?.[0]
        || err.response?.data?.message
        || err.message
        || 'Failed to upload profile picture.';
      if (addToast) addToast(msg, 'error');
    } finally {
      URL.revokeObjectURL(previewUrl);
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (authService.isAuthenticated()) {
        const res = await dashboardService.updateProfile({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          state_region: stateRegion,
          township: township,
        });

        if (res && res.user) {
          const updatedUser = {
            ...currentUser,
            ...res.user,
            avatar: res.user.avatar || currentUser?.avatar
          };
          setCurrentUser(updatedUser);
          localStorage.setItem('petlove_user', JSON.stringify(updatedUser));
        }

        if (addToast) addToast('Profile details updated successfully in database!', 'success');
      } else {
        if (addToast) addToast('Please sign in to update your profile.', 'error');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : 'Failed to update profile information.';
      if (addToast) addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (addToast) addToast('Please fill out all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      if (addToast) addToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      if (addToast) addToast('New password must be at least 8 characters.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      if (authService.isAuthenticated()) {
        await dashboardService.changePassword({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        });
        if (addToast) addToast('Password changed successfully in MySQL!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      if (addToast) addToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Account Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          User Profile Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your personal details, location township for local match alerts, and account security.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/90 shadow-sm pet-shadow space-y-8">
        
        {/* Avatar Upload Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-28 h-28 rounded-full object-cover border-4 border-amber-400 shadow-lg group-hover:opacity-90 transition"
            />
            <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition shadow-md border-2 border-white">
              {isUploadingAvatar ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-stone-900">{name || 'Pet Caretaker'}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Caretaker'}
              </span>
            </div>
            <p className="text-xs text-stone-500">{email || 'Registered Community Member'}</p>
            <p className="text-[11px] text-stone-400 pt-0.5">
              Click the camera icon to upload a JPG, PNG, or WebP image (3 MB max).
            </p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Phone Number (For Pet Sighting Calls) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09-450-123-789"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* State / Region */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                State / Region
              </label>
              <div className="relative">
                <select
                  value={stateRegion}
                  onChange={(e) => {
                    setStateRegion(e.target.value);
                    const newCities = locations.find(l => l && (l.region === e.target.value || l.name === e.target.value))?.cities || [];
                    setTownship(newCities[0]?.townships[0] || 'Kamayut Township');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.region || l.name}>{l.region || l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Township */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Township
              </label>
              <div className="relative">
                <select
                  value={township}
                  onChange={(e) => setTownship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {availableTownships.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="pt-8 border-t border-stone-100">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              Change Password
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Ensure your account uses a secure password of at least 8 characters.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer transition p-0.5"
                  tabIndex={-1}
                  aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer transition p-0.5"
                    tabIndex={-1}
                    aria-label={showNewPass ? 'Hide password' : 'Show password'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer transition p-0.5"
                    tabIndex={-1}
                    aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

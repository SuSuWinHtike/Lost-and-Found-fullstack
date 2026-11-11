import React, { useState, useEffect } from 'react';
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
  EyeOff
} from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, setCurrentUser, updateUser, addToast } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Kyaw Zin Htet');
  const [email, setEmail] = useState(currentUser?.email || 'kyawzin@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+95 9 798 123 456');
  const [township, setTownship] = useState(currentUser?.township || 'Hlaing Township');
  const [stateRegion, setStateRegion] = useState(currentUser?.state_region || 'Yangon Region');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
        setAvatar(currentUser.avatar.startsWith('/storage') ? ('http://127.0.0.1:8000' + currentUser.avatar) : currentUser.avatar);
      }
    }
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (authService.isAuthenticated()) {
        const res = await dashboardService.updateProfile({
          name,
          email,
          phone,
          state_region: stateRegion,
          township,
        });

        if (avatarFile) {
          const form = new FormData();
          form.append('avatar', avatarFile);
          const avRes = await dashboardService.updateAvatar(form);
          if (avRes.user) setCurrentUser(avRes.user);
        } else if (res.user) {
          setCurrentUser(res.user);
        }
        addToast('Profile updated successfully!', 'success');
      } else {
        updateUser(currentUser?.id || 'u1', { name, email, phone, township, state_region: stateRegion });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
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
        addToast('Password changed successfully!', 'success');
      } else {
        addToast('Password updated in session.', 'success');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      addToast(msg, 'error');
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
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Update your public profile, contact details for pet inquiries, and security preferences.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/90 shadow-sm pet-shadow space-y-8">
        
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-300 shadow-md"
            />
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition shadow">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-lg font-extrabold text-stone-900">{name}</h3>
            <p className="text-xs text-stone-500">Registered Community Member</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Member since {currentUser?.joinedDate || '2026-01-15'}
            </p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Phone Number (For Inquiries)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Township & City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Personal Bio / Community Note
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Update Profile Information
          </button>
        </form>

        {/* Change Password Section */}
        <div className="pt-8 border-t border-stone-100">
          <h3 className="text-base font-extrabold text-stone-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            Change Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
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
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
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
              className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs transition"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

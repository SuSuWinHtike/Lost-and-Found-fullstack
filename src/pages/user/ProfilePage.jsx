import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Save,
  CheckCircle2,
  Shield
} from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, updateUser, addToast } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Kyaw Zin Htet');
  const [email, setEmail] = useState(currentUser?.email || 'kyawzin@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+95 9 798 123 456');
  const [location, setLocation] = useState(currentUser?.location || 'Kamayut, Yangon');
  const [bio, setBio] = useState(currentUser?.bio || 'Pet lover and community volunteer.');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(currentUser?.id || 'u1', {
      name,
      email,
      phone,
      location,
      bio,
      avatar
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    addToast('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
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

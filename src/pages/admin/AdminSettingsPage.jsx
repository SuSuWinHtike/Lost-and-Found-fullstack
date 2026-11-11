import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Lock,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const AdminSettingsPage = () => {
  const { addToast } = useApp();

  const [adminName, setAdminName] = useState('System Administrator');
  const [adminEmail, setAdminEmail] = useState('admin@petfind.org');
  const [matchingThreshold, setMatchingThreshold] = useState('75');
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    addToast('System configuration & administrative profile updated.', 'success');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    addToast('Administrator master credentials updated successfully.', 'success');
    setCurrentPw('');
    setNewPw('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Master Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Admin Settings & Platform Controls
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Tune matching sensitivity algorithms, manage security credentials, and configure system alerts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8">
        
        {/* Section 1: Admin Profile */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            1. Super Administrator Account
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-stone-700 mb-1">Admin Display Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-stone-700 mb-1">Administrative Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Section 2: Platform Engine Tuning */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-extrabold text-xs text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                Intelligent Matching & Platform Parameters
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-stone-700 mb-1">
                    <span>Possible Matches Sensitivity Threshold:</span>
                    <span className="text-amber-600">{matchingThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={matchingThreshold}
                    onChange={(e) => setMatchingThreshold(e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Reports with breed, location, and color similarity score above {matchingThreshold}% will trigger automated match notifications.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div>
                    <span className="font-bold text-stone-800 block">Automated Email Alerts to Rescuers</span>
                    <span className="text-[11px] text-stone-500">Send instant notification when a lost pet is reported in same township</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEmailAlerts}
                    onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div>
                    <span className="font-bold text-amber-950 block">System Maintenance Mode</span>
                    <span className="text-[11px] text-amber-800/80">Only administrators can access the portal when active</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save System Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Admin Security */}
        <div className="pt-6 border-t border-stone-100">
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            2. Master Administrative Security
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md text-xs">
            <div>
              <label className="block font-bold uppercase text-stone-700 mb-1">Current Master Password</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-stone-700 mb-1">New Master Password</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold"
            >
              Update Admin Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AdminSettingsPage;

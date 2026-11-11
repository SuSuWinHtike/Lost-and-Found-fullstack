import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Menu, ShieldCheck, Bell, ExternalLink, Globe } from 'lucide-react';

const AdminTopbar = ({ onOpenMobileMenu }) => {
  const { currentUser } = useApp();

  return (
    <header className="bg-white border-b border-amber-100 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight flex items-center gap-2">
              System Administration
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Super Admin
              </span>
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block">
              PetLove Lost & Found Platform Control Center
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/user/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition"
        >
          User Dashboard
        </Link>
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
        >
          <Globe className="w-3.5 h-3.5" />
          Public View
        </Link>

        {/* Admin profile */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-50 border border-stone-200">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-amber-400"
          />
          <div className="hidden lg:block text-left pr-2">
            <div className="text-xs font-bold text-stone-900 leading-none">Admin System</div>
            <div className="text-[10px] text-amber-700 font-semibold leading-none mt-1">Super User</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;

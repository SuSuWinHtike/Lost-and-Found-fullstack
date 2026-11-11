import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  PlusCircle,
  Search,
  MessageSquare,
  Check,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const UserTopbar = ({ onOpenMobileMenu }) => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-amber-100/80 sticky top-8 z-20 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
            User Workspace
          </h1>
          <p className="text-xs text-stone-500 hidden sm:block">
            Welcome back, <span className="font-semibold text-amber-700">{currentUser?.name || 'Pet Owner'}</span>
          </p>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        
        {/* Quick Report Pet Button */}
        <Link
          to="/user/create-report"
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Report a Pet</span>
          <span className="sm:hidden">Report</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-amber-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  Notifications ({unreadCount} new)
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.slice(0, 4).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setNotificationsOpen(false);
                      if (notif.link) navigate(notif.link);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer text-xs transition border ${
                      notif.read ? 'bg-white border-transparent hover:bg-stone-50 text-stone-600' : 'bg-amber-50/70 border-amber-100 text-stone-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-stone-800">{notif.title}</span>
                      <span className="text-[10px] text-stone-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-stone-100 text-center">
                <Link
                  to="/user/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
                >
                  View All Notifications <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Link */}
        <Link
          to="/user/profile"
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-50 transition border border-transparent hover:border-stone-200"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full object-cover border border-amber-300"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-stone-800 leading-none">{currentUser?.name}</div>
            <div className="text-[10px] text-stone-400 leading-none mt-1">Pet Owner</div>
          </div>
        </Link>

      </div>
    </header>
  );
};

export default UserTopbar;

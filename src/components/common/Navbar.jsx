import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  PawPrint,
  Home,
  Search,
  PlusCircle,
  GitCompare,
  MessageSquare,
  Bell,
  Users2,
  FileText,
  User,
  LayoutDashboard,
  LogOut,
  Shield,
  Menu,
  X,
  Phone,
  ArrowRight,
  Check,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { currentUser, currentRole, notifications, conversations, markNotificationRead, markAllNotificationsRead, switchRole, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    if (logout) await logout();
    navigate('/login');
  };

  // When logged in, top navigation links (Dashboard and My Reports are moved to Profile Pop-up as requested!)
  const loggedInLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Pet Reports', path: '/user/pet-reports', icon: Search },
    { name: 'Possible Matches', path: '/user/matches', icon: GitCompare, badge: 2 },
    { name: 'Messages', path: '/user/messages', icon: MessageSquare, badge: unreadMessages },
  ];

  // When guest
  const guestLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Pet Reports', path: '/user/pet-reports', icon: Search },
    { name: 'How It Works', path: '/#how-it-works', isAnchor: true },
  ];

  const activeLinks = currentUser ? loggedInLinks : guestLinks;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-stone-900">
                  Pet<span className="text-amber-500">Love</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                  Community
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-tight">Lost & Found Pet Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {activeLinks.map((item) => {
              if (item.isAnchor) {
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-950 hover:bg-stone-50 transition"
                  >
                    {item.name}
                  </a>
                );
              }

              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-extrabold border border-amber-200/90 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />}
                  <span>{item.name}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            

            {/* If Logged in */}
            {currentUser ? (
              <>
                {/* Create Report Button */}
                <Link
                  to="/user/create-report"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all hover:scale-102 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Report a Pet</span>
                  <span className="sm:hidden">Report</span>
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileDropdownOpen(false); }}
                    className="relative p-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition bg-white"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-amber-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-stone-800">
                          Notifications ({unreadNotifs} new)
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
                            className={`p-3 rounded-2xl cursor-pointer text-xs transition border ${
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

                {/* Profile Avatar with Pop-up Bar (User Dashboard & My Reports inside here!) */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotificationsOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-stone-50 transition border border-stone-200/90 bg-white shadow-2xs"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={currentUser?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-extrabold text-stone-900 leading-none truncate max-w-[120px]">
                        {currentUser?.name || 'Kyaw Zin Htet'}
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold leading-none mt-1">
                        Caretaker
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                  </button>

                  {/* Profile Pop-up Bar */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      {/* User info banner */}
                      <div className="px-3 pt-2 pb-3 border-b border-stone-100 mb-2">
                        <p className="font-black text-sm text-stone-900 truncate">
                          {currentUser?.name || 'Kyaw Zin Htet'}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {currentUser?.email || 'kyawzin@gmail.com'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {/* 1. User Dashboard (Moved to profile pop-up as requested!) */}
                        <Link
                          to="/user/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-bold transition group"
                        >
                          <LayoutDashboard className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                          <span>User Dashboard</span>
                        </Link>

                        {/* 2. My Reports (Moved to profile pop-up as requested!) */}
                        <Link
                          to="/user/my-reports"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-bold transition group"
                        >
                          <FileText className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                          <span>My Submitted Reports</span>
                        </Link>

                        {/* 3. Profile Settings */}
                        <Link
                          to="/user/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-bold transition group"
                        >
                          <User className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                          <span>Profile Settings</span>
                        </Link>
                      </div>

                      {/* 5. Sign Out */}
                      <div className="pt-2 mt-2 border-t border-stone-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-102"
                >
                  Register
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl border border-amber-200 text-stone-700 hover:bg-amber-50 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {activeLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-stone-700 font-bold text-xs hover:text-amber-600"
            >
              {item.name}
            </Link>
          ))}

          {currentUser ? (
            <div className="pt-3 border-t border-stone-100 space-y-1">
              <Link
                to="/user/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700"
              >
                <LayoutDashboard className="w-4 h-4 text-stone-400" /> User Dashboard
              </Link>
              <Link
                to="/user/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700"
              >
                <FileText className="w-4 h-4 text-stone-400" /> My Submitted Reports
              </Link>
              <Link
                to="/user/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700"
              >
                <User className="w-4 h-4 text-stone-400" /> Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-amber-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-amber-200 text-amber-900 font-bold text-xs"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

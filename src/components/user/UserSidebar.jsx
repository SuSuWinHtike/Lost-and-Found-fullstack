import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSearch,
  PlusCircle,
  GitCompare,
  MessageSquare,
  Bell,
  Users2,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PawPrint
} from 'lucide-react';

const UserSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { notifications, conversations, switchRole } = useApp();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Pet Reports', path: '/user/pet-reports', icon: FileSearch, badge: 'All/Lost/Found' },
    { name: 'Create Report', path: '/user/create-report', icon: PlusCircle, highlight: true },
    { name: 'Possible Matches', path: '/user/matches', icon: GitCompare, badgeCount: 2 },
    { name: 'Messages', path: '/user/messages', icon: MessageSquare, badgeCount: unreadMessages },
    { name: 'Notifications', path: '/user/notifications', icon: Bell, badgeCount: unreadNotifs },
    { name: 'Community Assistance', path: '/user/community', icon: Users2 },
    { name: 'My Reports', path: '/user/my-reports', icon: FileText },
    { name: 'Profile', path: '/user/profile', icon: User },
  ];

  const handleLogout = () => {
    switchRole('guest');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-300 border-r border-stone-800">
      
      {/* Brand Header */}
      <div className={`p-4 border-b border-stone-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
            <PawPrint className="w-5 h-5 fill-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Pet<span className="text-amber-400">Love</span></span>
              <p className="text-[10px] text-amber-300/80 font-medium tracking-tight">User Portal</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : item.highlight
                    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}
              {!collapsed && item.badgeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                  {item.badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-stone-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;

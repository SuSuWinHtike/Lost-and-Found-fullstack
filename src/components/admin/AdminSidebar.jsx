import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  Layers,
  MapPin,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PawPrint
} from 'lucide-react';

const AdminSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { pets, complaints, switchRole } = useApp();
  const navigate = useNavigate();

  const pendingLost = pets.filter(p => p.reportType === 'lost' && p.status === 'Pending').length;
  const pendingFound = pets.filter(p => p.reportType === 'found' && p.status === 'Pending').length;
  const pendingComplaints = complaints.filter(c => ['pending', 'in_review'].includes(c.status)).length;

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ShieldAlert },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Lost Pet Reports', path: '/admin/lost-reports', icon: Search, badgeCount: pendingLost },
    { name: 'Found Pet Reports', path: '/admin/found-reports', icon: CheckCircle, badgeCount: pendingFound },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertTriangle, badgeCount: pendingComplaints },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Locations', path: '/admin/locations', icon: MapPin },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'System Reports', path: '/admin/system-reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    switchRole('guest');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#181310] text-stone-300 border-r border-amber-950/60">
      
      {/* Brand Header */}
      <div className={`p-4 border-b border-amber-950/60 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Admin<span className="text-amber-500">Panel</span></span>
              <p className="text-[10px] text-amber-400/90 font-medium tracking-tight">PetLove Platform Management</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition"
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
                    : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}
              {!collapsed && item.badgeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {item.badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-amber-950/60">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Exit Admin Panel</span>}
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
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
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

export default AdminSidebar;

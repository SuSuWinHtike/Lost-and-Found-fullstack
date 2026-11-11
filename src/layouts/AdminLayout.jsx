import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import authService from '../services/authService';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import PetDetailModal from '../components/user/PetDetailModal';
import Toast from '../components/common/Toast';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = authService.getCurrentUser();
  if (!authService.isAuthenticated() || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col font-sans">
      <div className="flex-1 flex">
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar onOpenMobileMenu={() => setMobileOpen(true)} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <PetDetailModal />
      <Toast />
    </div>
  );
};

export default AdminLayout;

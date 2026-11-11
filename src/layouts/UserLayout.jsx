import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/user/UserNavbar';
import Footer from '../components/common/Footer';
import PetDetailModal from '../components/user/PetDetailModal';
import SightingModal from '../components/user/SightingModal';
import Toast from '../components/common/Toast';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#FCF9F2] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation Bar (No side bar) */}
      <UserNavbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals and Toasts */}
      <PetDetailModal />
      <SightingModal />
      <Toast />
    </div>
  );
};

export default UserLayout;

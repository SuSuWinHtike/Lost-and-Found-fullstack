import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useApp } from '../context/AppContext';
import Navbar from '../components/common/Navbar';
import UserNavbar from '../components/user/UserNavbar';
import Footer from '../components/common/Footer';
import PetDetailModal from '../components/user/PetDetailModal';
import SightingModal from '../components/user/SightingModal';
import Toast from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';

const UserLayout = () => {
  const { currentUser } = useApp();
  const location = useLocation();
  const protectedPaths = ['/user/dashboard', '/user/matches', '/user/create-report', '/user/messages', '/user/notifications', '/user/my-reports', '/user/profile'];

  const requiresAuth = protectedPaths.some(p => location.pathname.startsWith(p));
  if (requiresAuth && !authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <ErrorBoundary fallback={<div className="h-20 bg-white border-b border-amber-100 flex items-center px-8 font-bold">PetLove Community</div>}>
        {currentUser ? <UserNavbar /> : <Navbar />}
      </ErrorBoundary>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals and Toasts protected by ErrorBoundary */}
      <ErrorBoundary fallback={null}>
        <PetDetailModal />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <SightingModal />
      </ErrorBoundary>
      <Toast />
    </div>
  );
};

export default UserLayout;

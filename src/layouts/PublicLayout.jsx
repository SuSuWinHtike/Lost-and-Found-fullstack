import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import PetDetailModal from '../components/user/PetDetailModal';
import SightingModal from '../components/user/SightingModal';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#FCF9F2] text-stone-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PetDetailModal />
      <SightingModal />
      <Toast />
    </div>
  );
};

export default PublicLayout;

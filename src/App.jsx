import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// User Dashboard Pages
import UserDashboardPage from './pages/user/UserDashboardPage';
import PetReportsPage from './pages/user/PetReportsPage';
import CreateReportPage from './pages/user/CreateReportPage';
import PossibleMatchesPage from './pages/user/PossibleMatchesPage';
import MessagesPage from './pages/user/MessagesPage';
import NotificationsPage from './pages/user/NotificationsPage';
import CommunityAssistancePage from './pages/user/CommunityAssistancePage';
import MyReportsPage from './pages/user/MyReportsPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Dashboard Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import LostPetReportsPage from './pages/admin/LostPetReportsPage';
import FoundPetReportsPage from './pages/admin/FoundPetReportsPage';
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import LocationManagementPage from './pages/admin/LocationManagementPage';
import AnnouncementManagementPage from './pages/admin/AnnouncementManagementPage';
import SystemReportsPage from './pages/admin/SystemReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* User Dashboard Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="pet-reports" element={<PetReportsPage />} />
            <Route path="create-report" element={<CreateReportPage />} />
            <Route path="matches" element={<PossibleMatchesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="community" element={<CommunityAssistancePage />} />
            <Route path="my-reports" element={<MyReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="lost-reports" element={<LostPetReportsPage />} />
            <Route path="found-reports" element={<FoundPetReportsPage />} />
            <Route path="complaints" element={<ComplaintManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="locations" element={<LocationManagementPage />} />
            <Route path="announcements" element={<AnnouncementManagementPage />} />
            <Route path="system-reports" element={<SystemReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

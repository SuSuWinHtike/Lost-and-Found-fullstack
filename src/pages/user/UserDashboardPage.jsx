import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, formatPetForFrontend } from '../../context/AppContext';
import dashboardService from '../../services/dashboardService';
import PetCard from '../../components/user/PetCard';
import Badge from '../../components/common/Badge';
import {
  FileText,
  Search,
  CheckCircle2,
  GitCompare,
  MessageSquare,
  Bell,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  PawPrint
} from 'lucide-react';

const UserDashboardPage = () => {
  const { pets, notifications, conversations, setSelectedPetForModal, currentUser } = useApp();
  const navigate = useNavigate();

  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    dashboardService.getDashboardStats()
      .then(stats => setDbStats(stats))
      .catch(() => {});
  }, []);

  // Metrics from real DB if loaded, fallback to state
  const totalLost = dbStats ? dbStats.active_lost_reports : pets.filter(p => p.reportType === 'lost').length;
  const totalFound = dbStats ? dbStats.active_found_reports : pets.filter(p => p.reportType === 'found').length;
  const totalReunited = dbStats ? dbStats.reunited_pets : pets.filter(p => p.status === 'Reunited').length;
  const possibleMatchesCount = dbStats ? dbStats.potential_matches : 3;

  // Recent reports
  const recentReports = (dbStats?.recent_reports && dbStats.recent_reports.length > 0)
    ? dbStats.recent_reports.map(formatPetForFrontend)
    : pets.slice(0, 3);

  // Recent messages
  const recentConversations = conversations.slice(0, 3);

  // Recent notifications
  const recentNotifs = (dbStats?.recent_notifications && dbStats.recent_notifications.length > 0)
    ? dbStats.recent_notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        link: n.action_url || '/user/notifications',
      }))
    : notifications.slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-3 tracking-wide">
            <PawPrint className="w-3.5 h-3.5" /> Community Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {currentUser?.name || 'Pet Caretaker'}!
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Here is your live lost & found overview. We actively scan reported pets across your township to surface possible matches.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/user/create-report"
            className="px-5 py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            Create Pet Report
          </Link>
          <Link
            to="/user/pet-reports"
            className="px-5 py-3 rounded-2xl bg-amber-950/30 hover:bg-amber-950/40 text-white font-bold text-xs border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Reports
          </Link>
        </div>

        {/* Decorative background paw */}
        <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none">
          <PawPrint className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 4.1 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Lost */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm pet-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Lost Pet Reports
            </span>
            <div className="text-3xl font-black text-rose-600">{totalLost}</div>
            <span className="text-[11px] text-stone-400 mt-1 block">Active missing alerts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Search className="w-6 h-6" />
          </div>
        </div>

        {/* Total Found */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm pet-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Found Pet Reports
            </span>
            <div className="text-3xl font-black text-emerald-600">{totalFound}</div>
            <span className="text-[11px] text-stone-400 mt-1 block">Pets safely sheltered</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Possible Matches */}
        <Link
          to="/user/matches"
          className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm pet-shadow flex items-center justify-between hover:border-amber-400 transition group"
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Possible Matches
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            </div>
            <div className="text-3xl font-black text-amber-600">{possibleMatchesCount}</div>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block group-hover:underline">
              Review comparisons →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <GitCompare className="w-6 h-6" />
          </div>
        </Link>

        {/* Reunited Pets */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm pet-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Reunited Pets
            </span>
            <div className="text-3xl font-black text-purple-700">{totalReunited}</div>
            <span className="text-[11px] text-stone-400 mt-1 block">Success reunions 🎉</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Reports & Activity widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Recent Pet Reports
              </h2>
              <p className="text-xs text-stone-500">
                Latest submissions from nearby communities
              </p>
            </div>
            <Link
              to="/user/pet-reports"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              View Combined Pet Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentReports.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                onSelect={setSelectedPetForModal}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Recent Messages & Notifications widgets */}
        <div className="space-y-6">
          
          {/* Recent Messages Widget */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 pet-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Recent Messages
              </h3>
              <Link to="/user/messages" className="text-xs font-bold text-amber-600 hover:underline">
                Open Chat
              </Link>
            </div>

            <div className="space-y-3">
              {recentConversations.map(conv => (
                <Link
                  key={conv.id}
                  to="/user/messages"
                  className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition border border-transparent hover:border-stone-200"
                >
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Re: {conv.relatedPetName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 pet-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Recent Notifications
              </h3>
              <Link to="/user/notifications" className="text-xs font-bold text-amber-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotifs.map(n => (
                <div
                  key={n.id}
                  className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{n.title}</span>
                    <span className="text-[10px] text-stone-400">{n.timestamp}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help Guide */}
          <div className="bg-gradient-to-br from-stone-900 to-amber-950 p-5 rounded-3xl text-white space-y-3 shadow-md">
            <h4 className="font-bold text-sm text-amber-300">
              Community Assistance Tip
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Found a wandering animal? Keep them safe and submit a Found Report immediately with a photo and the nearest landmark.
            </p>
            <Link
              to="/user/community"
              className="inline-block text-xs font-bold text-amber-400 hover:underline pt-1"
            >
              Explore sightings & help network →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserDashboardPage;

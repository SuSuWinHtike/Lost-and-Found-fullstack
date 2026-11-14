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
  PawPrint,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const UserDashboardPage = () => {
  const { pets = [], setSelectedPetForModal, currentUser } = useApp();
  const navigate = useNavigate();

  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState('my'); // 'my' | 'community'

  const loadDashboardData = async () => {
    try {
      const stats = await dashboardService.getDashboardStats();
      if (stats) {
        setDbStats(stats);
      }
    } catch (err) {
      console.error('Failed to load user dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Metrics from real DB
  const totalLost = dbStats ? dbStats.active_lost_reports : 0;
  const totalFound = dbStats ? dbStats.active_found_reports : 0;
  const totalReunited = dbStats ? dbStats.reunited_pets : 0;
  const possibleMatchesCount = dbStats ? dbStats.potential_matches : 0;

  // Real user reports from DB or filtered from pets state
  const myReports = (dbStats?.recent_reports && dbStats.recent_reports.length > 0)
    ? dbStats.recent_reports.map(formatPetForFrontend).filter(Boolean)
    : pets.filter(p => p && (p.userId === currentUser?.id || p.owner?.id === currentUser?.id));

  // Community recent reports
  const communityReports = pets.slice(0, 4);

  const displayedReports = reportTab === 'my' ? myReports : communityReports;

  // Real conversations from DB
  const recentConversations = (dbStats?.recent_conversations && dbStats.recent_conversations.length > 0)
    ? dbStats.recent_conversations.map(c => {
        const petImg = c.pet_report?.images?.[0]?.image_path;
        const formattedImg = petImg
          ? (petImg.startsWith('/storage') ? 'http://127.0.0.1:8000' + petImg : petImg)
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80';

        return {
          id: c.id,
          participantName: c.other_user?.name || 'Pet Caretaker',
          participantAvatar: c.other_user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          lastMessage: c.last_message?.message_text || 'Conversation initiated',
          lastTimestamp: c.last_message?.created_at
            ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          relatedPetName: c.pet_report?.pet_name || 'Pet Inquest',
          unreadCount: c.unread_count || 0,
        };
      })
    : [];

  // Real notifications from DB
  const recentNotifs = (dbStats?.recent_notifications && dbStats.recent_notifications.length > 0)
    ? dbStats.recent_notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: n.created_at
          ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Recent',
        link: n.action_url || '/user/notifications',
        isRead: !!n.is_read,
      }))
    : [];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-3 tracking-wide">
            <PawPrint className="w-3.5 h-3.5" /> Real-time Caretaker Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Mingalarbar, {currentUser?.name || 'Pet Caretaker'}!
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Here is your live lost & found overview. We actively track your reports and compare lost and found animals to surface matches in real time.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/user/create-report"
            className="px-5 py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            Report a Pet
          </Link>
          <Link
            to="/user/pet-reports"
            className="px-5 py-3 rounded-2xl bg-amber-950/30 hover:bg-amber-950/40 text-white font-bold text-xs border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
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

      {/* Key Statistics Cards (Directly from MySQL Database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Lost */}
        <Link
          to="/user/my-reports"
          className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm pet-shadow flex items-center justify-between hover:border-rose-300 transition group"
        >
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              My Lost Reports
            </span>
            <div className="text-3xl font-black text-rose-600">
              {loading ? '...' : totalLost}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block group-hover:text-rose-600 transition">
              Active missing listings →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Search className="w-6 h-6" />
          </div>
        </Link>

        {/* Total Found */}
        <Link
          to="/user/my-reports"
          className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm pet-shadow flex items-center justify-between hover:border-emerald-300 transition group"
        >
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              My Found Reports
            </span>
            <div className="text-3xl font-black text-emerald-600">
              {loading ? '...' : totalFound}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block group-hover:text-emerald-600 transition">
              Sheltered animals →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Link>

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
              {possibleMatchesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <div className="text-3xl font-black text-amber-600">
              {loading ? '...' : possibleMatchesCount}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block group-hover:underline">
              Compare lost & found →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <GitCompare className="w-6 h-6" />
          </div>
        </Link>

        {/* Reunited Pets */}
        <Link
          to="/user/my-reports"
          className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm pet-shadow flex items-center justify-between hover:border-purple-300 transition group"
        >
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Reunited Pets
            </span>
            <div className="text-3xl font-black text-purple-700">
              {loading ? '...' : totalReunited}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block group-hover:text-purple-600 transition">
              Success reunions 🎉
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Link>

      </div>

      {/* Main Grid: Recent Reports & Activity widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Reports Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Pet Reports Overview
              </h2>
              <p className="text-xs text-stone-500">
                Directly from MySQL database
              </p>
            </div>

            {/* Toggle Tab */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200">
                <button
                  onClick={() => setReportTab('my')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    reportTab === 'my'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  My Reports ({myReports.length})
                </button>
                <button
                  onClick={() => setReportTab('community')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    reportTab === 'community'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Community Reports
                </button>
              </div>

              <Link
                to="/user/pet-reports"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hidden sm:flex"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-stone-400 space-y-2 bg-white rounded-3xl border border-stone-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
              <p>Loading real reports from database...</p>
            </div>
          ) : displayedReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedReports.map(pet => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onSelect={setSelectedPetForModal}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-200 space-y-3">
              <PawPrint className="w-10 h-10 text-stone-300 mx-auto" />
              <div className="max-w-sm mx-auto">
                <p className="font-bold text-sm text-stone-700">No pet reports found</p>
                <p className="text-xs text-stone-400 mt-1">
                  You haven't posted any pet listings yet. Create a report to track your missing or rescued companion.
                </p>
              </div>
              <Link
                to="/user/create-report"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post First Report
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Real Messages & Notifications widgets */}
        <div className="space-y-6">
          
          {/* Real Messages Widget */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 pet-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Live Inquiries & Discussions
              </h3>
              <Link to="/user/messages" className="text-xs font-bold text-amber-600 hover:underline">
                Open Chat →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto text-amber-500 mb-1" />
                  Loading discussions...
                </div>
              ) : recentConversations.length > 0 ? (
                recentConversations.map(conv => (
                  <Link
                    key={conv.id}
                    to={`/user/messages?convId=${conv.id}`}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-amber-50/60 transition border border-stone-100 hover:border-amber-200"
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
                      {conv.relatedPetName && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md mt-1.5 inline-block truncate max-w-full">
                          Re: {conv.relatedPetName}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                  <MessageSquare className="w-6 h-6 text-stone-300 mx-auto" />
                  <p className="font-semibold text-stone-600">No active discussions</p>
                  <p className="text-[11px]">Chat with responders directly from pet reports.</p>
                </div>
              )}
            </div>
          </div>

          {/* Real Notifications Widget */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100 pet-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Recent Alerts
              </h3>
              <Link to="/user/notifications" className="text-xs font-bold text-amber-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto text-amber-500 mb-1" />
                  Loading alerts...
                </div>
              ) : recentNotifs.length > 0 ? (
                recentNotifs.map(n => (
                  <Link
                    key={n.id}
                    to={n.link}
                    className="block p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100/70 text-xs space-y-1 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 truncate">{n.title}</span>
                      <span className="text-[10px] text-stone-400 flex-shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                  <Bell className="w-6 h-6 text-stone-300 mx-auto" />
                  <p className="font-semibold text-stone-600">No new notifications</p>
                  <p className="text-[11px]">You are completely up to date!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-gradient-to-br from-stone-900 to-amber-950 p-5 rounded-3xl text-white space-y-3 shadow-md">
            <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pet Reunion Guide
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Found a wandering animal? Keep them safe and submit a Found Report immediately with clear photos and landmark details.
            </p>
            <Link
              to="/user/pet-reports"
              className="inline-block text-xs font-bold text-amber-400 hover:underline pt-1"
            >
              Explore pet reports directory →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserDashboardPage;

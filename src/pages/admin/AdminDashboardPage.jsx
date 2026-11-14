import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dashboardService from '../../services/dashboardService';

const CATEGORY_COLORS = ['#F59E0B', '#EA580C', '#10B981', '#6366F1', '#EC4899', '#14B8A6'];
const ACTIVITY_DOT_COLORS = {
  report: 'bg-rose-500',
  user: 'bg-emerald-500',
  complaint: 'bg-amber-500',
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setStats(await dashboardService.getAdminDashboardStats());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totals = stats?.totals || {};
  const monthlyData = stats?.monthly_activity || [];
  const petTypeData = (stats?.pet_categories || []).map((category, index) => ({
    ...category,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
  const recentActivities = stats?.recent_activities || [];
  const displayTotal = (key) => loading ? '…' : stats ? (Number(totals[key]) || 0).toLocaleString() : '—';

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
            Executive Summary
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Live platform metrics, report moderation status, and analytics from the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-60 text-stone-700 font-bold text-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/lost-reports"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
          >
            Review Pending Reports {!loading && `(${Number(totals.pending_reports) || 0})`}
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={refreshDashboard} className="font-bold underline underline-offset-2 self-start sm:self-auto">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-stone-900">{displayTotal('total_users')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1">
            {loading ? ' ' : stats ? `${Number(totals.users_this_month) || 0} joined this month` : 'Data unavailable'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lost Reports</span>
            <Search className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600">{displayTotal('lost_reports')}</div>
          <span className="text-[11px] text-stone-400 mt-1">Missing companions</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Found Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{displayTotal('found_reports')}</div>
          <span className="text-[11px] text-stone-400 mt-1">Discovered animals</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Reunited Pets</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700">{displayTotal('reunited_pets')}</div>
          <span className="text-[11px] text-stone-400 mt-1">Reunited safely</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between bg-amber-50/40">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700">{displayTotal('pending_reports')}</div>
          <span className="text-[11px] text-rose-600 font-bold mt-1">
            {loading ? ' ' : stats ? `${Number(totals.active_complaints) || 0} active complaints` : 'Data unavailable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Monthly Pet Reports &amp; Reunifications
            </h3>
            <p className="text-xs text-stone-500">
              Database activity across the last six calendar months
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend />
                <Bar dataKey="Lost" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Found" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Reunited" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Pet Category Distribution
            </h3>
            <p className="text-xs text-stone-500">
              Reports grouped by category
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {petTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={petTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {petTypeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-stone-400">
                {loading ? 'Loading categories…' : error ? 'Category data unavailable.' : 'No pet categories found.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-stone-100">
            {petTypeData.map((category) => (
              <div key={category.name} className="p-2 rounded-xl bg-stone-50">
                <span className="text-[11px] font-bold text-stone-700 block">{category.name}</span>
                <span className="text-base font-black" style={{ color: category.color }}>
                  {Number(category.value).toLocaleString()} reports
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Recent System Activity
            </h3>
            <p className="text-xs text-stone-500">
              Latest reports, registrations, and complaints from the database
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ACTIVITY_DOT_COLORS[activity.type] || 'bg-stone-400'}`} />
                <span className="font-bold text-stone-800 flex-shrink-0">{activity.action}:</span>
                <span className="text-stone-600 font-semibold truncate">{activity.target}</span>
              </div>
              <span className="text-[11px] text-stone-400 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
          {!loading && !error && recentActivities.length === 0 && (
            <p className="py-6 text-center text-sm text-stone-400">No recent activity recorded.</p>
          )}
          {loading && (
            <p className="py-6 text-center text-sm text-stone-400">Loading recent activity…</p>
          )}
          {!loading && error && (
            <p className="py-6 text-center text-sm text-stone-400">Activity data unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

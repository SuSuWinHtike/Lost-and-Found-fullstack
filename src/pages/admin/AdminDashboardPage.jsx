import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  PawPrint
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboardPage = () => {
  const { users, pets, complaints, announcements } = useApp();

  const totalUsers = users.length;
  const totalLost = pets.filter(p => p.reportType === 'lost').length;
  const totalFound = pets.filter(p => p.reportType === 'found').length;
  const totalReunited = pets.filter(p => p.status === 'Reunited').length;
  const pendingReports = pets.filter(p => p.status === 'Pending').length;
  const activeComplaints = complaints.filter(c => c.status === 'Investigating').length;

  // Chart data: Monthly trends
  const monthlyData = [
    { month: 'Oct', Lost: 12, Found: 8, Reunited: 6 },
    { month: 'Nov', Lost: 18, Found: 14, Reunited: 10 },
    { month: 'Dec', Lost: 24, Found: 19, Reunited: 15 },
    { month: 'Jan', Lost: 19, Found: 22, Reunited: 17 },
    { month: 'Feb', Lost: 28, Found: 25, Reunited: 22 },
    { month: 'Mar', Lost: 34, Found: 29, Reunited: 27 },
  ];

  // Chart data: Pet Types
  const petTypeData = [
    { name: 'Dogs', value: pets.filter(p => p.petType === 'Dog').length, color: '#F59E0B' },
    { name: 'Cats', value: pets.filter(p => p.petType === 'Cat').length, color: '#EA580C' },
  ];

  const recentActivities = [
    { id: 1, action: 'New pet report submitted', target: 'Milo (Golden Retriever)', time: '10 mins ago', type: 'report' },
    { id: 2, action: 'User registered', target: 'May Thu Zar (maythu@gmail.com)', time: '25 mins ago', type: 'user' },
    { id: 3, action: 'Report approved by Admin', target: 'Coco (Beagle)', time: '1 hour ago', type: 'approval' },
    { id: 4, action: 'Complaint filed', target: 'Spam Message Solicitation', time: '3 hours ago', type: 'complaint' },
    { id: 5, action: 'Reunification celebrated 🎉', target: 'Bella (Pomeranian)', time: 'Yesterday', type: 'reunion' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
            Executive Summary
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time platform metrics, report moderation status, and analytics across Myanmar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/lost-reports"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition"
          >
            Review Pending Reports ({pendingReports})
          </Link>
        </div>
      </div>

      {/* 5.1 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Registered Users */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-stone-900">{totalUsers}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1">
            +14% this month
          </span>
        </div>

        {/* Total Lost Pet Reports */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lost Reports</span>
            <Search className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600">{totalLost}</div>
          <span className="text-[11px] text-stone-400 mt-1">Missing companions</span>
        </div>

        {/* Total Found Pet Reports */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Found Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{totalFound}</div>
          <span className="text-[11px] text-stone-400 mt-1">Discovered animals</span>
        </div>

        {/* Total Reunited */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Reunited Pets</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700">{totalReunited}</div>
          <span className="text-[11px] text-stone-400 mt-1">Reunited safely 🎉</span>
        </div>

        {/* Pending & Complaints */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between bg-amber-50/40">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700">{pendingReports}</div>
          <span className="text-[11px] text-rose-600 font-bold mt-1">
            {activeComplaints} active complaints
          </span>
        </div>

      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Activity Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                Monthly Pet Reports & Reunifications
              </h3>
              <p className="text-xs text-stone-500">
                Comparative volume of lost, found, and reunited pets over the last 6 months
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
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

        {/* Pet Types Doughnut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Pet Category Distribution
            </h3>
            <p className="text-xs text-stone-500">
              Breakdown of registered animal species
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
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
                >
                  {petTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-stone-100">
            <div className="p-2 rounded-xl bg-amber-50">
              <span className="text-[11px] font-bold text-amber-800 block">Dogs</span>
              <span className="text-base font-black text-amber-600">{petTypeData[0].value} reports</span>
            </div>
            <div className="p-2 rounded-xl bg-orange-50">
              <span className="text-[11px] font-bold text-orange-800 block">Cats</span>
              <span className="text-base font-black text-orange-600">{petTypeData[1].value} reports</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Recent System Activity Log
            </h3>
            <p className="text-xs text-stone-500">
              Latest events recorded across users, reports, and administrative decisions
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {recentActivities.map(act => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-bold text-stone-800">{act.action}:</span>
                <span className="text-stone-600 font-semibold">{act.target}</span>
              </div>
              <span className="text-[11px] text-stone-400 flex-shrink-0">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const SystemReportsPage = () => {
  const { users, pets, addToast } = useApp();

  const totalUsers = users.length;
  const totalLost = pets.filter(p => p.reportType === 'lost').length;
  const totalFound = pets.filter(p => p.reportType === 'found').length;
  const totalReunited = pets.filter(p => p.status === 'Reunited').length;

  const resolutionRate = Math.round((totalReunited / Math.max(pets.length, 1)) * 100);

  // Yearly data
  const yearlyAnalytics = [
    { year: '2023', reports: 120, reunited: 78, rate: '65%' },
    { year: '2024', reports: 280, reunited: 210, rate: '75%' },
    { year: '2025', reports: 490, reunited: 412, rate: '84%' },
    { year: '2026 (YTD)', reports: 610, reunited: 538, rate: '88%' },
  ];

  const regionalDistribution = [
    { region: 'Yangon', total: 42, active: 18 },
    { region: 'Mandalay', total: 28, active: 11 },
    { region: 'Naypyidaw', total: 14, active: 6 },
    { region: 'Shan State', total: 19, active: 7 },
    { region: 'Bago', total: 12, active: 4 },
  ];

  const handleExport = (format) => {
    addToast(`Exporting System Analytics as ${format.toUpperCase()}... Download starting.`, 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
            Institutional Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            System Reports & Reunification Metrics
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Aggregated audit reports, resolution ratios, and regional demographic statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export Audit PDF
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Total System Users</span>
          <div className="text-3xl font-black text-stone-900">{totalUsers}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Registered caretakers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Total Lost Reports</span>
          <div className="text-3xl font-black text-rose-600">{totalLost}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Tracked since launch</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Total Found Reports</span>
          <div className="text-3xl font-black text-emerald-600">{totalFound}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Rescued / Reported</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase block mb-1">Reunification Rate</span>
          <div className="text-3xl font-black text-purple-700">{resolutionRate}%</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">High community success</span>
        </div>
      </div>

      {/* Chart: Historical Reunification Rate */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-stone-900">
            Multi-Year Reunification & Growth Trend
          </h3>
          <p className="text-xs text-stone-500">
            Cumulative total reports vs confirmed reunions
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyAnalytics}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReunited" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="reports" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" name="Total Reports" />
              <Area type="monotone" dataKey="reunited" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReunited)" name="Reunited Pets" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="font-extrabold text-base text-stone-900">
          Regional Activity Breakdown (Myanmar)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase">
              <tr>
                <th className="py-3 px-4">State / Region</th>
                <th className="py-3 px-4">Total Reports Registered</th>
                <th className="py-3 px-4">Active Search Cases</th>
                <th className="py-3 px-4">Reunification Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {regionalDistribution.map((r, i) => (
                <tr key={i} className="hover:bg-amber-50/30">
                  <td className="py-3 px-4 font-bold">{r.region}</td>
                  <td className="py-3 px-4">{r.total}</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">{r.active}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">
                    {Math.round(((r.total - r.active) / r.total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SystemReportsPage;

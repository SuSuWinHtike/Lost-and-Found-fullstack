import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const LostPetReportsPage = () => {
  const { pets, approveReport, rejectReport, deletePet, setSelectedPetForModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const lostReports = pets.filter(p => p.reportType === 'lost');

  const filteredReports = lostReports.filter(p => {
    if (statusFilter !== 'all' && p.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.petName?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        p.township?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full">
          Moderation Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Lost Pet Reports Management ({lostReports.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review, approve, reject, or remove submitted missing pet announcements.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by pet name, breed, township..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="reunited">Reunited</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Missing Pet</th>
                <th className="py-3.5 px-6">Breed & Colour</th>
                <th className="py-3.5 px-6">Last Seen Location</th>
                <th className="py-3.5 px-6">Owner Contact</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filteredReports.map(pet => (
                <tr key={pet.id} className="hover:bg-amber-50/30 transition">
                  {/* Pet */}
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={pet.images[0]}
                      alt={pet.petName}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-200"
                    />
                    <div>
                      <div className="font-extrabold text-stone-900">{pet.petName}</div>
                      <div className="text-[11px] text-stone-400">ID: #{pet.id}</div>
                    </div>
                  </td>

                  {/* Breed */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-800">{pet.breed}</div>
                    <div className="text-[11px] text-stone-500">{pet.colour}</div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-800">{pet.township}, {pet.city}</div>
                    <div className="text-[11px] text-stone-400">{pet.date}</div>
                  </td>

                  {/* Owner */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-800">{pet.userName}</div>
                    <div className="text-[11px] text-stone-500">{pet.userPhone}</div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <Badge type={pet.status} text={pet.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-1.5">
                    {/* View */}
                    <button
                      onClick={() => setSelectedPetForModal(pet)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Approve button */}
                    {pet.status !== 'Approved' && (
                      <button
                        onClick={() => approveReport(pet.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] hover:bg-emerald-100"
                        title="Approve Report"
                      >
                        Approve
                      </button>
                    )}

                    {/* Reject button */}
                    {pet.status !== 'Rejected' && (
                      <button
                        onClick={() => rejectReport(pet.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-bold text-[11px] hover:bg-amber-100"
                        title="Reject Report"
                      >
                        Reject
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete report #${pet.id}?`)) deletePet(pet.id);
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Remove Inappropriate Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default LostPetReportsPage;

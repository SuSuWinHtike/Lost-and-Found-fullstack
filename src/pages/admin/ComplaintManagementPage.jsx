import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  AlertTriangle,
  Search,
  CheckCircle,
  Eye,
  X,
  MessageSquare,
  User,
  ShieldAlert
} from 'lucide-react';

const ComplaintManagementPage = () => {
  const { complaints, resolveComplaint, addToast } = useApp();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleResolve = (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    resolveComplaint(selectedComplaint.id, resolutionNote || 'Reviewed and addressed by admin team.');
    setSelectedComplaint(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full">
          Safety & Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Complaint Management ({complaints.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review community reports regarding fraud, suspicious spam, harassment, or inaccurate pet locations.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {['all', 'Investigating', 'Resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filterStatus === st
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {st === 'all' ? 'All Complaints' : st}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Case ID</th>
                <th className="py-3.5 px-6">Complainant</th>
                <th className="py-3.5 px-6">Reported Party / Entity</th>
                <th className="py-3.5 px-6">Reason / Category</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-4 px-6 font-bold text-stone-900">#{c.id}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-800">{c.complainantName}</div>
                    <div className="text-[11px] text-stone-400">{c.complainantEmail}</div>
                  </td>
                  <td className="py-4 px-6 font-bold text-rose-700">{c.reportedUserName}</td>
                  <td className="py-4 px-6 text-stone-700 max-w-xs truncate">{c.reason}</td>
                  <td className="py-4 px-6 text-stone-500">{c.date}</td>
                  <td className="py-4 px-6">
                    <Badge
                      type={c.status === 'Resolved' ? 'Approved' : 'Pending'}
                      text={c.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => { setSelectedComplaint(c); setResolutionNote(c.resolutionNote || ''); }}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 font-bold text-stone-700 text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Complaint Review: #{selectedComplaint.id}
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 space-y-2">
              <div className="font-bold text-rose-900 text-sm">Reason: {selectedComplaint.reason}</div>
              <p className="text-stone-700 leading-relaxed italic">
                "{selectedComplaint.description}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Filed By</span>
                <span className="font-extrabold text-stone-900">{selectedComplaint.complainantName}</span>
                <span className="text-[11px] text-stone-400 block">{selectedComplaint.complainantEmail}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase block">Reported User</span>
                <span className="font-extrabold text-rose-700">{selectedComplaint.reportedUserName}</span>
                <span className="text-[11px] text-stone-400 block">Report Ref: {selectedComplaint.reportId || 'N/A'}</span>
              </div>
            </div>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Resolution Decision & Admin Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain steps taken (e.g. Warning issued to user, phone flagged, report removed)..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 font-bold text-stone-600"
                >
                  Close
                </button>
                {selectedComplaint.status !== 'Resolved' && (
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintManagementPage;

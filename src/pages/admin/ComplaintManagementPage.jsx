import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  AlertTriangle,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Complaints' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  in_review: 'Investigating',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const ComplaintManagementPage = () => {
  const { complaints = [], refreshComplaints, updateComplaint } = useApp();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    refreshComplaints()
      .then(() => {
        if (active) setError('');
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Could not load complaints. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshComplaints]);

  const filtered = useMemo(() => complaints.filter((complaint) => {
    if (filterStatus !== 'all' && complaint.status !== filterStatus) return false;
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return [
      complaint.complainantName,
      complaint.complainantEmail,
      complaint.reportedUserName,
      complaint.reason,
      String(complaint.id),
    ].some((value) => value?.toLowerCase().includes(query));
  }), [complaints, filterStatus, searchTerm]);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      await refreshComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (status) => {
    if (!selectedComplaint || saving) return;
    setSaving(true);
    setError('');

    try {
      const updated = await updateComplaint(selectedComplaint.id, {
        status,
        admin_notes: resolutionNote.trim(),
      });
      setSelectedComplaint(updated);
      setResolutionNote(updated.resolutionNote);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this complaint. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full">
          Safety &amp; Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Complaint Management ({loading ? '…' : complaints.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review community reports regarding fraud, suspicious spam, harassment, or inaccurate pet listings.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filterStatus === status.value
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search cases..."
              className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={reload} className="font-bold underline underline-offset-2">Try again</button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Case ID</th>
                <th className="py-3.5 px-6">Complainant</th>
                <th className="py-3.5 px-6">Reported Party / Post</th>
                <th className="py-3.5 px-6">Reason / Category</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {!loading && filtered.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-4 px-6 font-bold text-stone-900">#{complaint.id}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-stone-800">{complaint.complainantName}</div>
                    <div className="text-[11px] text-stone-400">{complaint.complainantEmail}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-rose-700">{complaint.reportedUserName}</div>
                    {complaint.reportId && (
                      <div className="text-[11px] text-stone-400">Pet post #{complaint.reportId}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-stone-700 max-w-xs truncate">{complaint.reason}</td>
                  <td className="py-4 px-6 text-stone-500">{complaint.date}</td>
                  <td className="py-4 px-6">
                    <Badge
                      type={complaint.status === 'resolved' ? 'Approved' : complaint.status === 'dismissed' ? 'Rejected' : 'Pending'}
                      text={STATUS_LABELS[complaint.status] || complaint.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setResolutionNote(complaint.resolutionNote || '');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 font-bold text-stone-700 text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review Case
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan="7" className="py-12 text-center text-sm text-stone-400">Loading complaints from database…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-stone-300" />
                      <span>{error ? 'Complaint data is unavailable.' : 'No complaints match this filter.'}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Complaint Review: #{selectedComplaint.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                aria-label="Close complaint review"
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 space-y-2">
              <div className="font-bold text-rose-900 text-sm">Reason: {selectedComplaint.reason}</div>
              <p className="text-stone-700 leading-relaxed">{selectedComplaint.description}</p>
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
                <span className="text-[11px] text-stone-400 block">
                  Pet post: {selectedComplaint.reportId ? `#${selectedComplaint.reportId}` : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="complaint-admin-note" className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Admin Note
              </label>
              <textarea
                id="complaint-admin-note"
                rows={3}
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Record actions taken. Required to resolve or dismiss this case."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {error && <p role="alert" className="text-rose-700">{error}</p>}

            <div className="pt-2 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 font-bold text-stone-600"
              >
                Close
              </button>
              {['pending', 'in_review'].includes(selectedComplaint.status) && (
                <>
                  {selectedComplaint.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleUpdate('in_review')}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Start Investigation'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUpdate('dismissed')}
                    disabled={saving || !resolutionNote.trim()}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 font-bold disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('resolved')}
                    disabled={saving || !resolutionNote.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Mark Resolved'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintManagementPage;

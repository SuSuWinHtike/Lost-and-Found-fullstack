import React, { useCallback, useEffect, useState } from 'react';
import { useApp, formatPetForFrontend } from '../../context/AppContext';
import petReportService from '../../services/petReportService';
import Badge from '../../components/common/Badge';
import { CheckCircle, Eye, RefreshCw, Search, Trash2, XCircle } from 'lucide-react';

const PAGE_DETAILS = {
  lost: {
    label: 'Lost',
    badge: 'text-rose-700 bg-rose-100/80',
    petHeading: 'Missing Pet',
    locationHeading: 'Last Seen Location',
    contactHeading: 'Owner Contact',
    description: 'Review and moderate submitted missing pet announcements.',
    placeholder: 'Search by pet name, breed, township...',
  },
  found: {
    label: 'Found',
    badge: 'text-emerald-700 bg-emerald-100/80',
    petHeading: 'Found Animal',
    locationHeading: 'Discovered Location',
    contactHeading: 'Finder Contact',
    description: 'Review and moderate community reports of found animals.',
    placeholder: 'Search by pet name, breed, township...',
  },
};

const fetchAdminPetReports = async (type) => {
  const response = await petReportService.getAdminPetReports(type);
  if (!Array.isArray(response.data)) {
    throw new Error('The server returned an invalid report list.');
  }
  return response.data.map(formatPetForFrontend).filter(Boolean);
};

const AdminPetReportsPage = ({ type }) => {
  const { addToast, refreshPets, setSelectedPetForModal } = useApp();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [workingReportId, setWorkingReportId] = useState(null);
  const [error, setError] = useState('');
  const details = PAGE_DETAILS[type];

  const loadReports = useCallback(async () => {
    try {
      setReports(await fetchAdminPetReports(type));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const refreshReports = useCallback(() => {
    setLoading(true);
    setError('');
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    let active = true;
    fetchAdminPetReports(type)
      .then((loadedReports) => {
        if (active) {
          setReports(loadedReports);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || err.message || 'Could not load reports. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const filteredReports = reports.filter((report) => {
    if (statusFilter !== 'all' && report.status.toLowerCase() !== statusFilter) return false;
    if (!searchTerm.trim()) return true;

    const query = searchTerm.toLowerCase();
    return [
      report.petName,
      report.breed,
      report.township,
      report.userName,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  const updateStatus = async (report, status) => {
    setWorkingReportId(report.id);
    setError('');
    try {
      const response = await petReportService.updateAdminPetReportStatus(report.id, status);
      if (!response.data) {
        throw new Error('The server did not return the updated report.');
      }
      const updatedReport = formatPetForFrontend(response.data);
      setReports((current) => current.map((item) => item.id === report.id ? updatedReport : item));
      await refreshPets();
      addToast(response.message || 'Pet report status updated.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Could not update this report.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setWorkingReportId(null);
    }
  };

  const deleteReport = async (report) => {
    if (!window.confirm(`Delete report #${report.id}?`)) return;

    setWorkingReportId(report.id);
    setError('');
    try {
      const response = await petReportService.deleteAdminPetReport(report.id);
      setReports((current) => current.filter((item) => item.id !== report.id));
      await refreshPets();
      addToast(response.message || 'Pet report removed.', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not delete this report.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setWorkingReportId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${details.badge}`}>
          Moderation Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          {details.label} Pet Reports Management ({loading ? '…' : reports.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">{details.description}</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={details.placeholder}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="reunited">Reunited</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={refreshReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={refreshReports} className="font-bold underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">{details.petHeading}</th>
                <th className="py-3.5 px-6">Breed &amp; Colour</th>
                <th className="py-3.5 px-6">{details.locationHeading}</th>
                <th className="py-3.5 px-6">{details.contactHeading}</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {!loading && filteredReports.map((report) => {
                const isWorking = workingReportId === report.id;
                const canModerate = report.status !== 'Reunited';

                return (
                  <tr key={report.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.images?.[0]}
                          alt={report.petName}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-200"
                        />
                        <div>
                          <div className="font-extrabold text-stone-900">{report.petName}</div>
                          <div className="text-[11px] text-stone-400">ID: #{report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-800">{report.breed}</div>
                      <div className="text-[11px] text-stone-500">{report.colour}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-800">{report.township}, {report.city}</div>
                      <div className="text-[11px] text-stone-400">{report.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-800">{report.userName}</div>
                      <div className="text-[11px] text-stone-500">{report.userPhone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge type={report.status} text={report.status} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedPetForModal(report)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModerate && report.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(report, 'approved')}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] hover:bg-emerald-100 disabled:opacity-60"
                            title="Approve Report"
                          >
                            {isWorking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Approve
                          </button>
                        )}
                        {canModerate && report.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(report, 'rejected')}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-bold text-[11px] hover:bg-amber-100 disabled:opacity-60"
                            title="Reject Report"
                          >
                            {isWorking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteReport(report)}
                          disabled={isWorking}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                          title="Remove Inappropriate Report"
                        >
                          {isWorking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-stone-400">Loading reports from database…</td>
                </tr>
              )}
              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-stone-400">
                    {error ? 'Report data is unavailable.' : 'No reports match your search or status filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPetReportsPage;

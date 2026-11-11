import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp, formatPetForFrontend } from '../../context/AppContext';
import petReportService from '../../services/petReportService';
import Badge from '../../components/common/Badge';
import {
  FileText,
  Edit3,
  Trash2,
  CheckCircle,
  PlusCircle,
  MapPin,
  Calendar,
  X,
  Eye,
  AlertTriangle,
  Sparkles,
  Camera
} from 'lucide-react';

const MyReportsPage = () => {
  const { pets, sightings, refreshSightings, updatePet, deletePet, markPetReunited, currentUser, setSelectedPetForModal } = useApp();
  
  const [dbReports, setDbReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadMyReports = useCallback(() => {
    setLoading(true);
    petReportService.getMyReports()
      .then(res => {
        if (res.data) {
          setDbReports(res.data.map(formatPetForFrontend));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMyReports();
  }, [loadMyReports]);

  // Fallback to local filtering if not loaded from API
  const userId = currentUser?.id || 'u1';
  const rawList = dbReports !== null ? dbReports : pets.filter(p => p.userId === userId || p.owner?.id === userId);

  const myReports = rawList.filter(p => {
    if (filterType !== 'all' && p.reportType !== filterType) return false;
    if (filterStatus !== 'all' && p.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  // Edit Modal State
  const [editingPet, setEditingPet] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editReward, setEditReward] = useState('');

  const openEditModal = (pet) => {
    setEditingPet(pet);
    setEditName(pet.petName || '');
    setEditDescription(pet.description || '');
    setEditLocation(pet.location || '');
    setEditReward(pet.reward ? pet.reward.replace(' MMK', '') : '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPet) return;

    await updatePet(editingPet.rawId || editingPet.id, {
      pet_name: editName,
      description: editDescription,
      last_seen_or_found_location: editLocation,
      reward_amount: editReward ? `${editReward} MMK` : null
    });

    setEditingPet(null);
    loadMyReports();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the report for "${name}"?`)) {
      await deletePet(id);
      loadMyReports();
    }
  };

  const handleReunited = async (id) => {
    await markPetReunited(id);
    loadMyReports();
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
            Manage Submissions
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            My Pet Reports ({myReports.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track, update status, edit details, or celebrate reunions for your reported pets.
          </p>
        </div>

        <Link
          to="/user/create-report"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Report
        </Link>
      </div>

      {/* Reports Table / Card List */}
      {myReports.length > 0 ? (
        <div className="space-y-4">
          {myReports.map(pet => {
            const isReunited = pet.status === 'Reunited';
            const petSightings = (sightings || []).filter(s =>
              String(s.petId) === String(pet.id) ||
              String(s.pet_report_id) === String(pet.id) ||
              (pet.rawId && (String(s.petId) === String(pet.rawId) || String(s.pet_report_id) === String(pet.rawId)))
            );

            return (
              <div
                key={pet.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-sm pet-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Main info */}
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                    alt={pet.petName || 'My pet report'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-amber-200 shadow-sm flex-shrink-0"
                  />
                  
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-lg text-stone-900">
                        {pet.petName}
                      </h3>
                      <Badge type={pet.status === 'Reunited' ? 'Reunited' : pet.reportType} />
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        {pet.petType}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium">
                      {pet.breed} • {pet.colour} • {pet.township}, {pet.city}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Reported: {pet.date}
                      </span>
                      {pet.reward && (
                        <span className="font-bold text-amber-700">
                          Reward: {pet.reward}
                        </span>
                      )}
                      {petSightings.length > 0 && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-emerald-600" />
                          {petSightings.length} Sighting{petSightings.length > 1 ? 's' : ''} Reported
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 justify-end">
                  
                  {/* View Sightings Button for Owner */}
                  {petSightings.length > 0 && (
                    <button
                      onClick={() => setSelectedPetForModal(pet)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
                      title="View all community sighting clues and witness photos"
                    >
                      <Camera className="w-4 h-4" />
                      View Sightings ({petSightings.length})
                    </button>
                  )}

                  {/* Mark as Reunited */}
                  {!isReunited && (
                    <button
                      onClick={() => markPetReunited(pet.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      title="Mark pet as safely reunited"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Mark Reunited
                    </button>
                  )}

                  {/* View Details */}
                  <button
                    onClick={() => setSelectedPetForModal(pet)}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-stone-600" />
                    View
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(pet)}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(pet.id, pet.petName)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200 text-stone-500">
          <p className="text-sm font-semibold">You haven't submitted any pet reports yet.</p>
          <Link
            to="/user/create-report"
            className="mt-3 inline-block font-bold text-xs text-amber-600 hover:underline"
          >
            Create your first report now →
          </Link>
        </div>
      )}

      {/* Edit Report Modal Dialog */}
      {editingPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="font-extrabold text-lg text-stone-900">
                Edit Report: {editingPet.petName}
              </h3>
              <button
                onClick={() => setEditingPet(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Exact Location / Landmark
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {editingPet.reportType === 'lost' && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Reward (MMK)
                  </label>
                  <input
                    type="text"
                    value={editReward}
                    onChange={(e) => setEditReward(e.target.value)}
                    placeholder="e.g. 250,000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPet(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyReportsPage;

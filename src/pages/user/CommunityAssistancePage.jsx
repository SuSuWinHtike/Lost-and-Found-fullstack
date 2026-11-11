import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  Users2,
  MapPin,
  Calendar,
  AlertCircle,
  Share2,
  Heart,
  PlusCircle,
  Eye,
  Camera,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Clock
} from 'lucide-react';

const CommunityAssistancePage = () => {
  const {
    pets = [],
    sightings = [],
    refreshSightings,
    refreshPets,
    setSelectedPetForModal,
    setSelectedSightingPet,
    currentUser,
    addToast
  } = useApp();

  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'my_pets'

  useEffect(() => {
    if (typeof refreshSightings === 'function') {
      refreshSightings();
    }
    if (typeof refreshPets === 'function') {
      refreshPets();
    }
  }, [refreshSightings, refreshPets]);

  const missingPetsUrgent = useMemo(() => {
    if (!Array.isArray(pets)) return [];
    return pets.filter(p => p && p.reportType === 'lost' && (p.status === 'Approved' || p.status === 'approved'));
  }, [pets]);

  // My pet IDs for owner sighting filtering
  const myPetIds = useMemo(() => {
    const uid = currentUser?.id;
    if (!uid || !Array.isArray(pets)) return [];
    return pets.filter(p => p && (p.owner?.id === uid || p.userId === uid)).map(p => String(p.id));
  }, [pets, currentUser]);

  const displayedSightings = useMemo(() => {
    if (!Array.isArray(sightings)) return [];
    if (filterMode === 'my_pets') {
      return sightings.filter(s => {
        if (!s) return false;
        return (currentUser?.id && s.petOwnerId === currentUser.id) || myPetIds.includes(String(s.petId));
      });
    }
    return sightings;
  }, [sightings, filterMode, currentUser, myPetIds]);

  const handleShare = (pet) => {
    navigator.clipboard?.writeText(window.location.origin + `/user/pet-reports?id=${pet.id}`);
    addToast(`Link for "${pet.petName}" copied to clipboard! Share on Facebook/Viber.`, 'info');
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 tracking-wide">
            <Users2 className="w-3.5 h-3.5" /> Neighborhood Volunteer Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Community Assistance Board
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Every eye on the street matters. Browse missing pet alerts in your neighborhood, submit real-time sighting photos, and assist pet owners.
          </p>
        </div>

        {missingPetsUrgent.length > 0 && (
          <button
            onClick={() => setSelectedSightingPet(missingPetsUrgent[0])}
            className="px-5 py-3 rounded-2xl bg-white text-stone-900 font-extrabold text-xs shadow-md hover:bg-stone-50 transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-600" />
            Report Sighting Photo
          </button>
        )}
      </div>

      {/* Section 1: Urgent Missing Pets Needing Community Eyes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Missing Pets in Your Vicinity
            </h2>
            <p className="text-xs text-stone-500">
              Citizens in these townships have asked for active street searches
            </p>
          </div>
        </div>

        {missingPetsUrgent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {missingPetsUrgent.slice(0, 3).map(pet => (
              <div
                key={pet.id}
                className="bg-white rounded-3xl border border-amber-200/90 shadow-sm pet-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100">
                    <img
                      src={pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                      alt={pet.petName || 'Missing Pet'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge type="lost" text="Urgent Missing" />
                    </div>
                    {pet.reward && (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow">
                        Reward: {pet.reward}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-lg text-stone-900">
                          {pet.petName}
                        </h3>
                        <p className="text-xs text-stone-500 font-semibold">
                          {pet.breed} • {pet.colour}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-800 rounded-lg">
                        {pet.township}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {pet.description}
                    </p>

                    <div className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">{pet.exactLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Last seen: {pet.date} ({pet.time})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedSightingPet(pet)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    I Saw This Pet
                  </button>
                  <button
                    onClick={() => handleShare(pet)}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Alert
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200 text-xs text-stone-500">
            No active missing pet alerts requiring street searches currently.
          </div>
        )}
      </div>

      {/* Section 2: Verified Community Sightings Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verified Street Sightings Feed
            </h2>
            <p className="text-xs text-stone-500">
              Real-time sightings reported by neighbors from MySQL to pinpoint animal movements
            </p>
          </div>

          {/* Sighting Filter Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 self-start">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Sightings ({sightings.length})
            </button>
            <button
              onClick={() => setFilterMode('my_pets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === 'my_pets'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sightings for My Pets
            </button>
          </div>
        </div>

        {displayedSightings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedSightings.map(s => {
              const matchedPet = pets.find(p => String(p.id) === String(s.petId) || String(p.rawId) === String(s.petId));

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm flex flex-col justify-between pet-shadow"
                >
                  <div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-100 mb-3 shadow-inner">
                      <img
                        src={s.photo || s.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                        alt="Sighting location"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>Sighting of</span>
                        <span className="text-amber-300 font-black">{s.petName}</span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="truncate">{s.township ? `${s.township}, ` : ''}{s.location}</span>
                        </span>
                        <span className="flex-shrink-0">{s.sightingDate} {s.sightingTime}</span>
                      </div>

                      <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                        "{s.notes}"
                      </p>

                      <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between">
                        <span>Reported by: <span className="font-bold text-stone-800">{s.submitterName}</span></span>
                        <span className="font-medium text-amber-700">{s.submitterPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    {matchedPet && (
                      <button
                        onClick={() => setSelectedPetForModal(matchedPet)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-amber-600 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        View Pet
                      </button>
                    )}

                    <a
                      href={`tel:${s.submitterPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline ml-auto"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Witness
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-200 text-stone-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">
              {filterMode === 'my_pets' ? 'No sightings reported for your lost pets yet.' : 'No community sightings recorded yet.'}
            </p>
            <p className="text-xs text-stone-400">
              When neighbors report seeing a missing pet on the street, the record and photos will show up here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CommunityAssistancePage;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Clock,
  X,
  Eye,
  AlertCircle,
  Sparkles,
  Camera,
  Upload,
  User,
  Phone,
  Mail,
  CheckCircle2,
  PawPrint,
  RefreshCw
} from 'lucide-react';

const MyReportsPage = () => {
  const {
    pets = [],
    sightings = [],
    updatePet,
    deletePet,
    markPetReunited,
    currentUser,
    setSelectedPetForModal,
    petTypes = [],
    breeds = [],
    colours = [],
    locations = [],
    addToast
  } = useApp();
  
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

  // Edit Modal State - Matching CreateReportPage completely
  const [editingPet, setEditingPet] = useState(null);
  const [reportType, setReportType] = useState('lost');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [colour, setColour] = useState('Golden / Cream');
  const [secondaryColour, setSecondaryColour] = useState('');
  const [age, setAge] = useState('2.5 Years');
  const [gender, setGender] = useState('Male');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [region, setRegion] = useState('Yangon Region');
  const [city, setCity] = useState('Yangon');
  const [township, setTownship] = useState('Hlaing Township');
  const [exactLocation, setExactLocation] = useState('');
  const [description, setDescription] = useState('');
  const [appearance, setAppearance] = useState('');
  const [holdingLocation, setHoldingLocation] = useState('');
  const [collar, setCollar] = useState('');
  const [microchipped, setMicrochipped] = useState(false);
  const [microchipId, setMicrochipId] = useState('');
  const [reward, setReward] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newRawFiles, setNewRawFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Derived location dropdowns for edit modal
  const availableCities = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    const r = locations.find(l => l && (l.region === region || l.name === region));
    return r ? (r.cities || []) : [];
  }, [region, locations]);

  const availableTownships = useMemo(() => {
    if (!Array.isArray(availableCities)) return [];
    const c = availableCities.find(c => c && c.cityName === city);
    return c ? (c.townships || []) : (availableCities[0]?.townships || ['Kamayut Township', 'Hlaing Township', 'Bahan Township']);
  }, [city, availableCities]);

  // Breeds filtered by selected pet type
  const availableBreeds = useMemo(() => {
    if (!Array.isArray(breeds)) return [];
    return breeds.filter(b => b && (b.petType || '').toLowerCase() === petType.toLowerCase());
  }, [petType, breeds]);

  const openEditModal = (pet) => {
    setEditingPet(pet);
    setReportType(pet.reportType || 'lost');
    setPetName(pet.petName || '');
    setPetType(pet.petType || 'Dog');
    setBreed(pet.breed || 'Golden Retriever');
    setColour(pet.colour || pet.color || 'Golden / Cream');
    setSecondaryColour(pet.secondaryColor || '');
    setAge(pet.age || '2.5 Years');
    setGender(pet.gender ? (pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1).toLowerCase()) : 'Male');
    setDate(pet.date ? (typeof pet.date === 'string' ? pet.date.split('T')[0] : pet.date) : new Date().toISOString().split('T')[0]);
    setTime(pet.time || '14:30');
    setRegion(pet.region || pet.stateRegion || 'Yangon Region');
    setCity(pet.city || 'Yangon');
    setTownship(pet.township || 'Hlaing Township');
    setExactLocation(pet.exactLocation || pet.location || '');
    setDescription(pet.description || '');
    setAppearance(pet.appearance || pet.condition || '');
    setHoldingLocation(pet.holdingLocation || '');
    setCollar(pet.collar === 'None' ? '' : (pet.collar || ''));
    setReward(pet.reward ? String(pet.reward).replace(/[^0-9]/g, '') : '');
    setMicrochipped(!!pet.microchipped || !!pet.microchip);
    setMicrochipId(pet.microchip || '');
    setUserName(pet.userName || currentUser?.name || 'Pet Caretaker');
    setUserPhone(pet.userPhone || currentUser?.phone || '09-450-123-789');
    setUserEmail(pet.userEmail || currentUser?.email || '');
    setExistingImages(Array.isArray(pet.images) ? pet.images : []);
    setNewImages([]);
    setNewRawFiles([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewRawFiles(prev => [...prev, ...files].slice(0, 4));
      const newUrls = files.map(file => URL.createObjectURL(file));
      setNewImages(prev => [...prev, ...newUrls].slice(0, 4));
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewRawFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPet || isSaving) return;

    if (!description.trim() || !exactLocation.trim()) {
      if (addToast) addToast('Please fill out the description and exact location.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', reportType);
      formData.append('pet_name', petName.trim() || (reportType === 'found' ? `Found ${petType}` : 'Missing Pet'));
      formData.append('pet_type', petType);
      formData.append('category_id', petType.toLowerCase() === 'cat' ? 2 : 1);

      const foundBreed = breeds.find(b => b.name === breed);
      if (foundBreed?.id) formData.append('breed_id', foundBreed.id);
      formData.append('breed', breed);

      const foundColor = colours.find(c => c.name === colour);
      if (foundColor?.id) formData.append('color_id', foundColor.id);
      formData.append('colour', colour);
      formData.append('color', colour);
      if (secondaryColour.trim()) formData.append('secondary_color', secondaryColour.trim());

      formData.append('gender', gender.toLowerCase());
      formData.append('age', age.trim() || 'Unknown');
      formData.append('event_date', date);
      formData.append('event_time', time);

      const foundRegion = locations.find(l => l.region === region || l.name === region);
      if (foundRegion?.id) formData.append('state_region_id', foundRegion.id);
      formData.append('state_region', region);
      formData.append('region', region);
      formData.append('township', township);
      formData.append('last_seen_or_found_location', exactLocation.trim());
      formData.append('description', description.trim());

      if (appearance.trim()) formData.append('physical_condition', appearance.trim());
      if (holdingLocation.trim() && reportType === 'found') formData.append('safe_holding_location', holdingLocation.trim());
      if (collar.trim()) formData.append('collar_description', collar.trim());
      if (microchipped && microchipId.trim()) formData.append('microchip_id', microchipId.trim());
      if (reward.trim() && reportType === 'lost') {
        formData.append('reward_amount', `${reward.trim()} MMK`);
      } else {
        formData.append('reward_amount', '');
      }

      formData.append('contact_name', userName.trim());
      formData.append('contact_phone', userPhone.trim());

      newRawFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      await updatePet(editingPet.rawId || editingPet.id, formData);
      setEditingPet(null);
      loadMyReports();
    } catch (err) {
      console.error('Failed to update report:', err);
    } finally {
      setIsSaving(false);
    }
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
            Manage Listings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            My Submitted Pet Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track status, edit details, mark reunited, and inspect sightings for your posts.
          </p>
        </div>

        <Link
          to="/user/create-report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Pet Report</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            Type:
          </span>
          {['all', 'lost', 'found'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                filterType === t
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          {['all', 'pending', 'approved', 'rejected', 'reunited'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                filterStatus === s
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
          <p>Loading your reports from database...</p>
        </div>
      ) : myReports.length > 0 ? (
        <div className="space-y-4">
          {myReports.map((pet) => {
            const isReunited = pet.status === 'Reunited';
            const petSightings = sightings.filter(s => s && (String(s.petId) === String(pet.id) || String(s.pet_report_id) === String(pet.id)));

            return (
              <div
                key={pet.id}
                className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:shadow-md"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <img
                    src={pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                    alt={pet.petName}
                    className="w-20 h-20 rounded-2xl object-cover border border-amber-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-stone-900">
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
                      onClick={() => handleReunited(pet.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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

                  {/* Edit - Opens full rich edit modal */}
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

      {/* FULL RICH EDIT MODAL - Exactly matching Add Report Form (CreateReportPage) */}
      {editingPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-amber-200/90 space-y-8 animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
                  Edit Report #{editingPet.id}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-2">
                  Edit Report: {petName || 'Pet'}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Modify full attributes, photos, location, and description matching the add report form.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingPet(null)}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Control / Tab Switcher (Lost vs Found) */}
            <div className="bg-stone-200/80 p-1.5 rounded-2xl flex max-w-md shadow-inner border border-stone-200">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  reportType === 'lost'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Lost Pet Report
              </button>

              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  reportType === 'found'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Found Pet Report
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-8">
              
              {/* Section 1: Basic Pet Identity */}
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-amber-600" />
                  1. Pet Identity & Characteristics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Pet Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Pet Name {reportType === 'lost' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      required={reportType === 'lost'}
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder={reportType === 'lost' ? "e.g. Milo, Luna, Buddy" : "e.g. Friendly Found Dog"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Pet Type */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Pet Type *
                    </label>
                    <select
                      value={petType}
                      onChange={(e) => {
                        setPetType(e.target.value);
                        const firstBreed = breeds.find(b => b.petType.toLowerCase() === e.target.value.toLowerCase());
                        if (firstBreed) setBreed(firstBreed.name);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Breed *
                    </label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {availableBreeds.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Colour */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Primary Colour / Pattern *
                    </label>
                    <select
                      value={colour}
                      onChange={(e) => setColour(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {colours.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Colour */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Secondary Colour / Markings
                    </label>
                    <input
                      type="text"
                      value={secondaryColour}
                      onChange={(e) => setSecondaryColour(e.target.value)}
                      placeholder="e.g. White chest, Brown paws"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {reportType === 'lost' ? 'Pet Age' : 'Estimated Age'}
                    </label>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 2.5 Years or 6 Months"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unknown">Unknown / Not Checked</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Photos */}
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-2 pb-2 border-b border-stone-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-600" />
                  2. Pet Photos
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Manage current photos or upload new pictures to help identify your pet.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Existing Photos */}
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-sm group">
                      <img src={img} alt="Current pet" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition shadow cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-stone-900/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        Saved
                      </span>
                    </div>
                  ))}

                  {/* Newly Uploaded Photos */}
                  {newImages.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm group">
                      <img src={img} alt="New upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition shadow cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        New
                      </span>
                    </div>
                  ))}

                  {/* Add more upload button */}
                  {existingImages.length + newImages.length < 5 && (
                    <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-amber-300 hover:bg-amber-50 transition cursor-pointer flex flex-col items-center justify-center text-center p-2 text-stone-500 hover:text-amber-700">
                      <Upload className="w-6 h-6 text-amber-600 mb-1" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Section 3: Date, Time & Myanmar Location */}
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  3. {reportType === 'lost' ? 'Last-Seen Date & Location' : 'Found Date & Location'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {reportType === 'lost' ? 'Last-Seen Date *' : 'Date Found *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Approximate Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      State / Region *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        const newCities = locations.find(l => l.region === e.target.value)?.cities || [];
                        setCity(newCities[0]?.cityName || '');
                        setTownship(newCities[0]?.townships[0] || '');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.region}>{l.region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Township *
                    </label>
                    <select
                      value={township}
                      onChange={(e) => setTownship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {availableTownships.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Exact Landmark / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={exactLocation}
                    onChange={(e) => setExactLocation(e.target.value)}
                    placeholder="e.g. Near Inya Lake walkway entrance, University Avenue bus stop"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 4: Physical Description & Condition */}
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  4. Detailed Description & Appearance
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Detailed Incident Story / Context *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain how the pet went missing or where they were found..."
                      className="w-full p-3.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Physical Appearance, Distinguishing Marks & Condition
                    </label>
                    <input
                      type="text"
                      value={appearance}
                      onChange={(e) => setAppearance(e.target.value)}
                      placeholder="e.g. White patch on chest, floppy ears, limping slightly..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {reportType === 'found' && (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Safe Holding / Foster Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={holdingLocation}
                        onChange={(e) => setHoldingLocation(e.target.value)}
                        placeholder="e.g. Fostered safely at home in Kamayut or Local Vet Clinic"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Collar / Tag Details
                      </label>
                      <input
                        type="text"
                        value={collar}
                        onChange={(e) => setCollar(e.target.value)}
                        placeholder="e.g. Red leather collar with brass bell"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    {reportType === 'lost' && (
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Reward (Optional)
                        </label>
                        <input
                          type="text"
                          value={reward}
                          onChange={(e) => setReward(e.target.value)}
                          placeholder="e.g. 200,000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 pt-2 mb-1.5">
                        <input
                          type="checkbox"
                          id="edit-microchip"
                          checked={microchipped}
                          onChange={(e) => setMicrochipped(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer"
                        />
                        <label htmlFor="edit-microchip" className="text-xs font-semibold text-stone-700 cursor-pointer">
                          Pet is microchipped
                        </label>
                      </div>
                      {microchipped && (
                        <input
                          type="text"
                          value={microchipId}
                          onChange={(e) => setMicrochipId(e.target.value)}
                          placeholder="Microchip ID (e.g. MC-984210)"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Contact Information */}
              <div>
                <h3 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  5. Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPet(null)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Pet Report</span>
                    </>
                  )}
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

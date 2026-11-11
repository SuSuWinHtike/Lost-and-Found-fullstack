import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PetCard from '../../components/user/PetCard';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  PawPrint,
  Heart,
  Clock,
  Gift
} from 'lucide-react';

const PetReportsPage = () => {
  const { pets, setSelectedPetForModal, petTypes, breeds, colours, locations, favorites } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Three Main Tabs: 'all' | 'lost' | 'found'
  const initialTab = searchParams.get('status') || 'all';
  const [activeTab, setActiveTab] = useState(
    initialTab === 'lost' ? 'lost' : initialTab === 'found' ? 'found' : 'all'
  );

  // Quick Filter Chips State: 'all' | 'dogs' | 'cats' | 'yangon' | 'mandalay' | 'reward' | 'recent' | 'favorites'
  const [activeQuickChip, setActiveQuickChip] = useState('all');

  // Advanced Search & Filter State
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedPetType, setSelectedPetType] = useState(searchParams.get('type') || '');
  const [selectedBreed, setSelectedBreed] = useState(searchParams.get('breed') || '');
  const [selectedColour, setSelectedColour] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTownship, setSelectedTownship] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter townships based on selected region & city
  const availableCities = useMemo(() => {
    if (!selectedRegion) return [];
    const regionObj = locations.find(l => l.region === selectedRegion);
    return regionObj ? regionObj.cities : [];
  }, [selectedRegion, locations]);

  const availableTownships = useMemo(() => {
    if (!selectedCity) {
      return availableCities.flatMap(c => c.townships);
    }
    const cityObj = availableCities.find(c => c.cityName === selectedCity);
    return cityObj ? cityObj.townships : [];
  }, [selectedCity, availableCities]);

  // Breeds filtered by selected pet type
  const availableBreeds = useMemo(() => {
    if (!selectedPetType) return breeds;
    return breeds.filter(b => b.petType.toLowerCase() === selectedPetType.toLowerCase());
  }, [selectedPetType, breeds]);

  const handleClearFilters = () => {
    setActiveQuickChip('all');
    setKeyword('');
    setSelectedPetType('');
    setSelectedBreed('');
    setSelectedColour('');
    setSelectedRegion('');
    setSelectedCity('');
    setSelectedTownship('');
    setSelectedDate('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleChipClick = (chipKey) => {
    if (activeQuickChip === chipKey) {
      setActiveQuickChip('all');
    } else {
      setActiveQuickChip(chipKey);
    }
  };

  // Master Filter Logic incorporating Tab, Quick Chips, and Advanced Selectors
  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      // 1. Tab condition
      if (activeTab === 'lost' && pet.reportType !== 'lost') return false;
      if (activeTab === 'found' && pet.reportType !== 'found') return false;

      // 2. Quick Filter Chips condition
      if (activeQuickChip === 'dogs' && pet.petType !== 'Dog') return false;
      if (activeQuickChip === 'cats' && pet.petType !== 'Cat') return false;
      if (activeQuickChip === 'yangon' && !pet.region.toLowerCase().includes('yangon')) return false;
      if (activeQuickChip === 'mandalay' && !pet.region.toLowerCase().includes('mandalay')) return false;
      if (activeQuickChip === 'reward' && !pet.reward) return false;
      if (activeQuickChip === 'favorites' && (!favorites || !favorites.includes(pet.id))) return false;

      // 3. Keyword search
      if (keyword.trim()) {
        const query = keyword.toLowerCase();
        const matchName = pet.petName?.toLowerCase().includes(query);
        const matchBreed = pet.breed?.toLowerCase().includes(query);
        const matchColour = pet.colour?.toLowerCase().includes(query);
        const matchLocation = `${pet.township} ${pet.city} ${pet.region} ${pet.exactLocation}`.toLowerCase().includes(query);
        const matchDesc = pet.description?.toLowerCase().includes(query);

        if (!matchName && !matchBreed && !matchColour && !matchLocation && !matchDesc) {
          return false;
        }
      }

      // 4. Pet Type (Cat / Dog)
      if (selectedPetType && pet.petType.toLowerCase() !== selectedPetType.toLowerCase()) {
        return false;
      }

      // 5. Breed
      if (selectedBreed && pet.breed.toLowerCase() !== selectedBreed.toLowerCase()) {
        return false;
      }

      // 6. Colour
      if (selectedColour && !pet.colour.toLowerCase().includes(selectedColour.toLowerCase())) {
        return false;
      }

      // 7. Region
      if (selectedRegion && pet.region.toLowerCase() !== selectedRegion.toLowerCase()) {
        return false;
      }

      // 8. City
      if (selectedCity && pet.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 9. Township
      if (selectedTownship && pet.township.toLowerCase() !== selectedTownship.toLowerCase()) {
        return false;
      }

      // 10. Date
      if (selectedDate && pet.date !== selectedDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00'));
      }
      if (sortBy === 'oldest') {
        return new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'));
      }
      if (sortBy === 'name') {
        return (a.petName || '').localeCompare(b.petName || '');
      }
      return 0;
    });
  }, [
    pets,
    activeTab,
    activeQuickChip,
    keyword,
    selectedPetType,
    selectedBreed,
    selectedColour,
    selectedRegion,
    selectedCity,
    selectedTownship,
    selectedDate,
    sortBy,
    favorites
  ]);

  // Counts for tabs
  const countAll = pets.length;
  const countLost = pets.filter(p => p.reportType === 'lost').length;
  const countFound = pets.filter(p => p.reportType === 'found').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header and 3 Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <PawPrint className="w-3.5 h-3.5 text-amber-600" />
            Central Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Pet Reports
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Browse and filter all missing and discovered cats and dogs in one unified community board.
          </p>
        </div>

        {/* The 3 Main Tabs: All Pets, Lost Pets, Found Pets */}
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 border border-stone-200/90 shadow-inner self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>All Pets</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-700'}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lost')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Lost Pets</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'lost' ? 'bg-white text-rose-700' : 'bg-stone-200 text-stone-700'}`}>
              {countLost}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'found'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Found Pets</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'found' ? 'bg-white text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
              {countFound}
            </span>
          </button>
        </div>
      </div>

      {/* Modern Search & Quick Filter Chips Section */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xl border border-amber-100/90 pet-card-shadow space-y-6">
        
        {/* Quick Filter Chips (One-click filters requested by user!) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Filters
            </span>
            {activeQuickChip !== 'all' && (
              <button
                onClick={() => setActiveQuickChip('all')}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Clear quick filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {/* All */}
            <button
              onClick={() => handleChipClick('all')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'all'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>✨ All Reports</span>
            </button>

            {/* Dogs */}
            <button
              onClick={() => handleChipClick('dogs')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'dogs'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>🐶 Dogs Only</span>
            </button>

            {/* Cats */}
            <button
              onClick={() => handleChipClick('cats')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'cats'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>🐱 Cats Only</span>
            </button>

            {/* Yangon */}
            <button
              onClick={() => handleChipClick('yangon')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'yangon'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Yangon Area</span>
            </button>

            {/* Mandalay */}
            <button
              onClick={() => handleChipClick('mandalay')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'mandalay'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Mandalay Area</span>
            </button>

            {/* Has Reward */}
            <button
              onClick={() => handleChipClick('reward')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'reward'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Has Reward</span>
            </button>

            {/* Saved Bookmarks */}
            <button
              onClick={() => handleChipClick('favorites')}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                activeQuickChip === 'favorites'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-102'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Saved Bookmarks ({favorites?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Detailed Search Filters */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Keyword Search */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                Keyword / Pet Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Milo, Golden, Kamayut..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              >
                <option value="">All Breeds</option>
                {availableBreeds.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* State / Region */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                State / Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedCity('');
                  setSelectedTownship('');
                }}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              >
                <option value="">All Myanmar Regions</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.region}>{loc.region}</option>
                ))}
              </select>
            </div>

            {/* Township */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                Township
              </label>
              <select
                value={selectedTownship}
                onChange={(e) => setSelectedTownship(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              >
                <option value="">All Townships</option>
                {availableTownships.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Bottom Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 font-semibold">
              Showing <span className="font-black text-stone-900">{filteredPets.length}</span> reports matching criteria
              {activeQuickChip !== 'all' && (
                <span className="ml-1.5 font-bold text-amber-700">
                  (Filter: {activeQuickChip})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-stone-200 text-xs font-bold text-stone-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="name">Sort: Pet Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Pet Cards Grid */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onSelect={setSelectedPetForModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-14 text-center border border-dashed border-amber-300 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-900">
            No pet reports found
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            Try adjusting your search keywords, clicking another quick filter chip, or clearing all filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 rounded-full bg-amber-500 text-white font-black text-xs hover:bg-amber-600 transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default PetReportsPage;

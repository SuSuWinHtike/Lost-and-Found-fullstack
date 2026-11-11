import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PetCard from '../../components/user/PetCard';
import {
  Search,
  PawPrint,
  Heart,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Users,
  Compass,
  Filter,
  Phone
} from 'lucide-react';

const HomePage = () => {
  const { pets, setSelectedPetForModal, petTypes, breeds, locations } = useApp();
  const navigate = useNavigate();

  // Search Bar Filter State
  const [searchCategory, setSearchCategory] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchBreed, setSearchBreed] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Tab for recently reported pets
  const [activeRecentTab, setActiveRecentTab] = useState('all');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchCategory) queryParams.set('type', searchCategory);
    if (searchStatus) queryParams.set('status', searchStatus);
    if (searchBreed) queryParams.set('breed', searchBreed);
    if (searchRegion) queryParams.set('region', searchRegion);
    if (searchKeyword) queryParams.set('q', searchKeyword);

    navigate(`/user/pet-reports?${queryParams.toString()}`);
  };

  const filteredRecentPets = pets.filter(p => {
    if (activeRecentTab === 'lost') return p.reportType === 'lost';
    if (activeRecentTab === 'found') return p.reportType === 'found';
    return true;
  }).slice(0, 6);

  const totalLost = pets.filter(p => p.reportType === 'lost').length;
  const totalFound = pets.filter(p => p.reportType === 'found').length;
  const totalReunited = pets.filter(p => p.status === 'Reunited').length;

  return (
    <div className="space-y-16 pb-24">
      
      {/* Hero Section (Modeled directly after the warm Japanese pet UI reference) */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Hero Card Container */}
          <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-b from-[#F7EFE4] via-[#FDF8F2] to-[#FAF5EE] border border-amber-200/60 shadow-xl min-h-[480px] md:min-h-[560px] flex flex-col justify-between p-6 sm:p-12 lg:p-16">
            
            {/* Background Cutout/Collage of Happy Dogs & Cats */}
            <div className="absolute inset-0 z-0 flex justify-end items-center opacity-90 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80"
                alt="Happy Corgi and Cat"
                className="w-full lg:w-2/3 h-full object-cover object-center lg:object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F7EFE4] via-[#F7EFE4]/90 to-transparent lg:to-[#F7EFE4]/10" />
            </div>

            {/* Hero Copy */}
            <div className="relative z-10 max-w-xl space-y-5 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-amber-300/80 text-amber-900 text-xs font-black shadow-xs">
                <PawPrint className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Community Lost & Found Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
                Find Your Missing Pet With <span className="inline-block px-3 py-1 rounded-2xl bg-amber-500 text-white shadow-md">PetLove</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-semibold max-w-lg">
                Connect directly with neighbors, local shelters, and volunteers across Myanmar. Every reported pet deserves to find their way back home.
              </p>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/user/create-report"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report a Pet
                </Link>
                <Link
                  to="/user/pet-reports"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-extrabold text-xs sm:text-sm border border-stone-200/90 shadow-sm transition-all hover:scale-102 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-amber-500" />
                  Browse Reports
                </Link>
              </div>
            </div>

            {/* Bottom Quick Metrics Counter */}
            <div className="relative z-10 pt-8 mt-12 border-t border-amber-900/10 flex flex-wrap items-center gap-6 sm:gap-10 text-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-black text-amber-600 tracking-tight">{totalLost + totalFound}+</span>
                <span className="text-xs font-bold text-stone-600 leading-tight">Active Pet<br/>Reports</span>
              </div>
              <div className="w-px h-8 bg-amber-300/60 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-black text-emerald-600 tracking-tight">{totalReunited + 18}+</span>
                <span className="text-xs font-bold text-stone-600 leading-tight">Reunited<br/>Families 🎉</span>
              </div>
              <div className="w-px h-8 bg-amber-300/60 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-black text-stone-800 tracking-tight">100%</span>
                <span className="text-xs font-bold text-stone-600 leading-tight">Free Community<br/>Network</span>
              </div>
            </div>

          </div>

          {/* Floating Search Card (Exact design inspired by reference image) */}
          <div className="relative -mt-12 sm:-mt-16 z-20 max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 search-card-shadow border border-amber-200/80">
              <form onSubmit={handleHeroSearch} className="space-y-4">
                
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  
                  {/* Category / Species */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                      Pet Category
                    </label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                    >
                      <option value="">All Pet Types</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                      Report Status
                    </label>
                    <select
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                    >
                      <option value="">Lost & Found Both</option>
                      <option value="lost">Lost Pets Only</option>
                      <option value="found">Found Pets Only</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                      Breed
                    </label>
                    <select
                      value={searchBreed}
                      onChange={(e) => setSearchBreed(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                    >
                      <option value="">All Breeds</option>
                      {breeds.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
                      State / Region
                    </label>
                    <select
                      value={searchRegion}
                      onChange={(e) => setSearchRegion(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50/70 hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                    >
                      <option value="">All Myanmar Regions</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.region}>{loc.region}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Golden Center Search Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    className="py-3.5 px-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-amber-400/30 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Search Reports</span>
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Recently Reported Pets Section with Warm Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Section Heading Banner (Inspired by reference banner) */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black">
              <PawPrint className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Recently Reported Pets
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Have you spotted any of these pets? Contact their owners or report sightings immediately.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-black/15 backdrop-blur-md border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveRecentTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeRecentTab === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveRecentTab('lost')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeRecentTab === 'lost'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Missing Pets
            </button>
            <button
              onClick={() => setActiveRecentTab('found')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeRecentTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Found Pets
            </button>
          </div>
        </div>

        {/* Pet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecentPets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onSelect={setSelectedPetForModal}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-10">
          <Link
            to="/user/pet-reports"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-amber-50 text-stone-900 font-black text-xs sm:text-sm border border-stone-200/90 shadow-md transition-all hover:scale-105"
          >
            <span>Explore All Pet Reports ({pets.length})</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-[36px] p-8 sm:p-12 lg:p-16 border border-stone-200/80 pet-card-shadow">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              How PetLove Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Our automated matching algorithms and volunteer network unite pet owners and compassionate rescuers swiftly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-[#FAF6EF] border border-amber-100 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-amber-500/25">
                  1
                </div>
                <h3 className="font-black text-lg text-stone-900 mb-2">
                  Create a Report
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Provide detailed pet photos, distinct color patterns, collar tags, and exact last-seen or found location in your township.
                </p>
              </div>
              <div className="pt-2 text-amber-700 text-xs font-black">
                Takes under 2 minutes →
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF6EF] border border-amber-100 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-orange-500/25">
                  2
                </div>
                <h3 className="font-black text-lg text-stone-900 mb-2">
                  Match & Sightings
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Our system compares breed, coat color, and geographic distance to generate high-accuracy Possible Matches and alert nearby citizens.
                </p>
              </div>
              <div className="pt-2 text-orange-700 text-xs font-black">
                Instant match alerts →
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF6EF] border border-amber-100 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-emerald-600/25">
                  3
                </div>
                <h3 className="font-black text-lg text-stone-900 mb-2">
                  Safe Reunification
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Directly chat with finder or owner through our built-in messenger, verify ownership, and safely bring your furry family member home.
                </p>
              </div>
              <div className="pt-2 text-emerald-700 text-xs font-black">
                Celebrated reunion 🎉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-[36px] p-8 sm:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border-4 border-amber-400">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-xs uppercase tracking-widest font-black text-amber-400">
              Join Our Compassionate Community
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Found a Stray Pet or Lost Your Own?
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Every report created triggers instant community notifications to local volunteers. Be a hero for a pet today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 flex-shrink-0">
            <Link
              to="/user/create-report"
              className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:scale-105"
            >
              Report Pet Now
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs sm:text-sm border border-stone-700 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  GitCompare,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const PossibleMatchesPage = () => {
  const { pets, setSelectedPetForModal } = useApp();
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);

  // Intelligently paired matching examples based on the dataset
  const matchPairs = [
    {
      id: 'match-1',
      matchScore: 94,
      reason: 'Identical breed (Golden Retriever), matching coat colour, and adjacent townships (Kamayut & Bahan, Yangon).',
      lostPet: pets.find(p => p.id === 'p1') || pets[0],
      foundPet: pets.find(p => p.id === 'p2') || pets[1]
    },
    {
      id: 'match-2',
      matchScore: 89,
      reason: 'Matching orange domestic short hair cat with white paws, reported within 5 blocks in Chanayethazan, Mandalay on the same day.',
      lostPet: pets.find(p => p.id === 'p4') || pets[3],
      foundPet: pets.find(p => p.id === 'p5') || pets[4]
    },
    {
      id: 'match-3',
      matchScore: 78,
      reason: 'Siberian Husky in Shan State, matching distinctive markings and blue eyes.',
      lostPet: {
        ...pets[0],
        id: 'p_demo_lost',
        petName: 'Shadow',
        breed: 'Siberian Husky',
        colour: 'Grey / Silver',
        township: 'Taunggyi Central',
        city: 'Taunggyi',
        region: 'Shan State',
        date: '2026-03-19',
        images: ['https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80']
      },
      foundPet: pets.find(p => p.id === 'p7') || pets[6]
    }
  ];

  const activePair = matchPairs[selectedPairIndex] || matchPairs[0];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Intelligent Matching Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Possible Pet Matches
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Our system automatically compares lost pet reports with newly discovered found pets based on breed, coat colour, and geographic proximity.
        </p>
      </div>

      {/* Match Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {matchPairs.map((pair, idx) => (
          <div
            key={pair.id}
            onClick={() => setSelectedPairIndex(idx)}
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${
              selectedPairIndex === idx
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                : 'bg-white/70 border-stone-200 hover:bg-white text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Pair #{idx + 1}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                pair.matchScore >= 90
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {pair.matchScore}% Match
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 overflow-hidden">
                <img
                  src={pair.lostPet?.images[0]}
                  alt="Lost pet"
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                />
                <img
                  src={pair.foundPet?.images[0]}
                  alt="Found pet"
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {pair.lostPet?.petName} ↔ {pair.foundPet?.petName}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {pair.lostPet?.breed}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-Side Detailed Comparison Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm pet-shadow space-y-6">
        
        {/* Match Highlight Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                Match Confidence: {activePair.matchScore}%
              </span>
              <span className="text-xs text-stone-400">• High Probability Match</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 font-medium mt-1.5">
              {activePair.reason}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPetForModal(activePair.foundPet)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition shadow-sm"
            >
              Contact Finder
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* Column 1: Lost Pet */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <Badge type="lost" text="Lost Pet Report" />
              <span className="text-xs font-bold text-stone-500">ID: #{activePair.lostPet?.id}</span>
            </div>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 shadow-sm">
              <img
                src={activePair.lostPet?.images[0]}
                alt={activePair.lostPet?.petName}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-stone-900">
                {activePair.lostPet?.petName}
              </h3>
              <p className="text-xs font-semibold text-stone-600">
                {activePair.lostPet?.breed} • {activePair.lostPet?.colour}
              </p>
            </div>

            <div className="space-y-2 text-xs text-stone-700 bg-white/80 p-3 rounded-xl border border-rose-100">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Last Seen Date:</span>
                <span className="font-bold">{activePair.lostPet?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Location:</span>
                <span className="font-bold">{activePair.lostPet?.township}, {activePair.lostPet?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Collar:</span>
                <span className="font-bold">{activePair.lostPet?.collar || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Owner:</span>
                <span className="font-bold">{activePair.lostPet?.userName} ({activePair.lostPet?.userPhone})</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 italic bg-white/60 p-2.5 rounded-lg border border-stone-100">
              "{activePair.lostPet?.description}"
            </p>

            <button
              onClick={() => setSelectedPetForModal(activePair.lostPet)}
              className="w-full py-2 px-3 rounded-xl bg-white text-rose-800 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Lost Report
            </button>
          </div>

          {/* Column 2: Found Pet */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <Badge type="found" text="Found Pet Report" />
              <span className="text-xs font-bold text-stone-500">ID: #{activePair.foundPet?.id}</span>
            </div>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 shadow-sm">
              <img
                src={activePair.foundPet?.images[0]}
                alt={activePair.foundPet?.petName}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-stone-900">
                {activePair.foundPet?.petName}
              </h3>
              <p className="text-xs font-semibold text-stone-600">
                {activePair.foundPet?.breed} • {activePair.foundPet?.colour}
              </p>
            </div>

            <div className="space-y-2 text-xs text-stone-700 bg-white/80 p-3 rounded-xl border border-emerald-100">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Found Date:</span>
                <span className="font-bold">{activePair.foundPet?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Location:</span>
                <span className="font-bold">{activePair.foundPet?.township}, {activePair.foundPet?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Collar:</span>
                <span className="font-bold">{activePair.foundPet?.collar || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Finder:</span>
                <span className="font-bold">{activePair.foundPet?.userName} ({activePair.foundPet?.userPhone})</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 italic bg-white/60 p-2.5 rounded-lg border border-stone-100">
              "{activePair.foundPet?.description}"
            </p>

            <button
              onClick={() => setSelectedPetForModal(activePair.foundPet)}
              className="w-full py-2 px-3 rounded-xl bg-white text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Found Report
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PossibleMatchesPage;

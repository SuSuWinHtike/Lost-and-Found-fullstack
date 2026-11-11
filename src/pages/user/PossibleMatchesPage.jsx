import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, formatPetForFrontend } from '../../context/AppContext';
import matchService from '../../services/matchService';
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
  PlusCircle,
  Clock,
  Search,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

const PossibleMatchesPage = () => {
  const { pets = [], setSelectedPetForModal, currentUser } = useApp();
  const navigate = useNavigate();

  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [apiMatches, setApiMatches] = useState(null);
  const [matchMeta, setMatchMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // User's own lost and found pets from AppContext state
  const myLostPets = useMemo(() => {
    if (!currentUser?.id || !Array.isArray(pets)) return [];
    return pets.filter(p => p && p.reportType === 'lost' && (p.userId === currentUser.id || p.owner?.id === currentUser.id));
  }, [pets, currentUser]);

  const myFoundPets = useMemo(() => {
    if (!currentUser?.id || !Array.isArray(pets)) return [];
    return pets.filter(p => p && p.reportType === 'found' && (p.userId === currentUser.id || p.owner?.id === currentUser.id));
  }, [pets, currentUser]);

  useEffect(() => {
    matchService.getPossibleMatches()
      .then(res => {
        setMatchMeta({
          has_user_lost_reports: res.has_user_lost_reports,
          has_user_found_reports: res.has_user_found_reports,
          total_lost_reports: res.total_lost_reports,
        });

        if (res.data && res.data.length > 0) {
          const formatted = res.data.map(m => ({
            id: m.id,
            matchScore: Math.round(m.confidence_score),
            reason: (m.matching_attributes || []).join(' • '),
            matchingAttributes: m.matching_attributes || [],
            differences: m.differences || [],
            lostPet: formatPetForFrontend(m.lost_pet),
            foundPet: formatPetForFrontend(m.found_pet),
          }));
          setApiMatches(formatted);
        } else {
          setApiMatches([]);
        }
      })
      .catch(() => {
        setApiMatches([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasLostReports = (myLostPets.length > 0) || (matchMeta?.has_user_lost_reports === true);
  const hasFoundReportsOnly = !hasLostReports && ((myFoundPets.length > 0) || (matchMeta?.has_user_found_reports === true));
  const hasNoReports = !hasLostReports && !hasFoundReportsOnly;

  const matchPairs = apiMatches || [];
  const activePair = matchPairs[selectedPairIndex] || matchPairs[0];

  const handleContactFinder = (pair) => {
    const finderId = pair.foundPet?.owner?.id || pair.foundPet?.userId;
    const petId = pair.foundPet?.id;
    if (finderId && finderId !== currentUser?.id) {
      navigate(`/user/messages?ownerId=${finderId}&petId=${petId}`);
    } else {
      navigate('/user/messages');
    }
  };

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
          Automated comparison linking your missing pet reports with recently discovered found animals in your vicinity.
        </p>
      </div>

      {/* CASE 1: User has Lost Listings AND matches were found */}
      {hasLostReports && matchPairs.length > 0 && activePair && (
        <>
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
                    Match Pair #{idx + 1}
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
                      src={pair.lostPet?.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                      alt="Lost pet"
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                    />
                    <img
                      src={pair.foundPet?.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
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
                  onClick={() => handleContactFinder(activePair)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Finder
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* Column 1: Lost Pet */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge type="lost" text="Your Lost Pet" />
                  <span className="text-xs font-bold text-stone-500">ID: #{activePair.lostPet?.id}</span>
                </div>

                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 shadow-sm">
                  <img
                    src={activePair.lostPet?.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                    alt={activePair.lostPet?.petName || 'Lost Pet'}
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
                    <span className="font-bold">{activePair.lostPet?.userName}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 italic bg-white/60 p-2.5 rounded-lg border border-stone-100">
                  "{activePair.lostPet?.description}"
                </p>

                <button
                  onClick={() => setSelectedPetForModal(activePair.lostPet)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-rose-800 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Lost Report
                </button>
              </div>

              {/* Column 2: Found Pet */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge type="found" text="Found Pet Candidate" />
                  <span className="text-xs font-bold text-stone-500">ID: #{activePair.foundPet?.id}</span>
                </div>

                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 shadow-sm">
                  <img
                    src={activePair.foundPet?.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                    alt={activePair.foundPet?.petName || 'Found Pet'}
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
                    <span className="text-stone-500 font-medium">Holding Location:</span>
                    <span className="font-bold text-emerald-800">{activePair.foundPet?.holdingLocation || 'Fostered safely'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Finder:</span>
                    <span className="font-bold">{activePair.foundPet?.userName} ({activePair.foundPet?.userPhone})</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 italic bg-white/60 p-2.5 rounded-lg border border-stone-100">
                  "{activePair.foundPet?.description}"
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPetForModal(activePair.foundPet)}
                    className="py-2.5 px-3 rounded-xl bg-white text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleContactFinder(activePair)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat Finder
                  </button>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* CASE 2: User has Lost Listings, but no matching Found Pets yet */}
      {hasLostReports && matchPairs.length === 0 && !loading && (
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-stone-200 text-center max-w-2xl mx-auto space-y-4 pet-shadow">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">
              No Matches Found Yet for Your Lost Pet
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto leading-relaxed">
              We continuously scan all community found pet reports across your township. Currently, none of the newly discovered pets match your lost pet’s breed, coat colour, or location.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> What to do next:
            </p>
            <p className="text-stone-600">
              • Check the Pet Reports directory for newly submitted found animals.
            </p>
            <p className="text-stone-600">
              • Share your lost report link with neighbors on Viber and Facebook.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/user/pet-reports"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Browse Pet Reports
            </Link>
            <Link
              to="/user/my-reports"
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
            >
              Manage My Reports
            </Link>
          </div>
        </div>
      )}

      {/* CASE 3: User ONLY posted Found Pet Report(s) */}
      {hasFoundReportsOnly && !loading && (
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-emerald-100 text-center max-w-2xl mx-auto space-y-4 pet-shadow">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">
              You Have Active Found Pet Listing(s)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Thank you for caring for a rescued animal! The Possible Matches engine compares <strong>Lost Pet Reports</strong> with found animals. When an owner who lost a matching pet checks this page, your listing will be recommended to them, and they can contact you via chat.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/user/my-reports"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> View My Found Reports
            </Link>
            <Link
              to="/user/pet-reports"
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
            >
              Browse Missing Pets Directory
            </Link>
          </div>
        </div>
      )}

      {/* CASE 4: User has NOT posted any reports yet ("nothing post") */}
      {hasNoReports && !loading && (
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-stone-200 text-center max-w-2xl mx-auto space-y-4 pet-shadow">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <GitCompare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">
              No Active Lost Pet Listings
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Possible matches are automatically calculated for pet owners who have reported a missing cat or dog. Once you post a Lost Pet Report, our AI algorithm will compare your animal against all found reports in Myanmar to alert you of potential matches.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/user/create-report"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Post a Lost Pet Report
            </Link>
            <Link
              to="/user/pet-reports"
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition"
            >
              Explore Public Directory
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default PossibleMatchesPage;

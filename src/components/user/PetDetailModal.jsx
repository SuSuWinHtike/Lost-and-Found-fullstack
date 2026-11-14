import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import messageService from '../../services/messageService';
import complaintService from '../../services/complaintService';
import Badge from '../common/Badge';
import {
  X, MapPin, Calendar, Clock, Phone, Mail, User, ShieldCheck,
  MessageCircle, Eye, Share2, Sparkles, AlertCircle, Heart, Tag,
  Camera, CheckCircle2, Flag, Send, RefreshCw
} from 'lucide-react';

const PetDetailModal = () => {
  const {
    selectedPetForModal,
    setSelectedPetForModal,
    setSelectedSightingPet,
    pets = [],
    sightings = [],
    currentUser,
    addToast
  } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const navigate = useNavigate();

  const pet = selectedPetForModal;

  const petSightings = useMemo(() => {
    if (!pet || !Array.isArray(sightings)) return [];
    const petId = String(pet.id || '');
    const rawId = String(pet.rawId || '');
    return sightings.filter(s =>
      s && (
        String(s.petId) === petId ||
        String(s.pet_report_id) === petId ||
        (rawId && (String(s.petId) === rawId || String(s.pet_report_id) === rawId))
      )
    );
  }, [pet, sightings]);

  const matches = useMemo(() => {
    if (!pet || !Array.isArray(pets)) return [];
    return pets.filter(p =>
      p &&
      p.id !== pet.id &&
      (p.petType || '').toLowerCase() === (pet.petType || '').toLowerCase() &&
      p.reportType !== pet.reportType
    ).slice(0, 2);
  }, [pet, pets]);

  // Conditional early return ONLY after all top-level hooks have executed
  if (!selectedPetForModal) return null;

  const isLost = pet.reportType === 'lost';
  const images = (Array.isArray(pet.images) && pet.images.length > 0)
    ? pet.images
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'];

  const isOwner = currentUser && (
    currentUser.id === pet.owner?.id ||
    currentUser.id === pet.userId ||
    (pet.owner && String(pet.owner.id) === String(currentUser.id)) ||
    petSightings.some(s => s && s.petOwnerId === currentUser.id)
  );

  const handleClose = () => {
    setSelectedPetForModal(null);
    setActiveImageIndex(0);
  };

  const handleOpenChat = async () => {
    handleClose();
    const ownerId = pet.owner?.id || pet.userId;
    const petReportId = pet.rawId || pet.id;
    if (ownerId && ownerId !== currentUser?.id) {
      try {
        const res = await messageService.startConversation(Number(ownerId), Number(petReportId));
        if (res && res.conversation_id) {
          navigate(`/user/messages?convId=${res.conversation_id}`);
          return;
        }
      } catch {
        // Fallback to query param
      }
      navigate(`/user/messages?ownerId=${ownerId}&petId=${petReportId}`);
    } else {
      navigate('/user/messages');
    }
  };

  const handleOpenSighting = () => {
    setSelectedSightingPet(pet);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + `/user/pet-reports?id=${pet.id}`);
    addToast('Report link copied to clipboard! Share it with the community.', 'info');
  };

  const handleOpenComplaintForm = () => {
    if (!currentUser) {
      addToast('Please sign in to report a pet post.', 'info');
      handleClose();
      navigate('/login');
      return;
    }

    setShowComplaintForm(true);
  };

  const handleSubmitComplaint = async (event) => {
    event.preventDefault();
    if (isSubmittingComplaint) return;

    const reportId = Number(pet.rawId || pet.id);
    if (!Number.isInteger(reportId) || reportId < 1) {
      addToast('This post cannot be reported right now. Please refresh and try again.', 'error');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const response = await complaintService.submitComplaint({
        pet_report_id: reportId,
        subject: complaintSubject,
        description: complaintDescription.trim(),
      });
      setShowComplaintForm(false);
      setComplaintSubject('');
      setComplaintDescription('');
      addToast(response.message || 'Your complaint has been sent to the moderation team.', 'success');
    } catch (error) {
      const message = error.response?.data?.errors?.description?.[0]
        || error.response?.data?.errors?.subject?.[0]
        || error.response?.data?.message
        || 'Could not submit your complaint. Please try again.';
      addToast(message, 'error');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-stone-600 hover:text-stone-950 hover:bg-white shadow-md flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Left Column: Multi-Image Showcase */}
          <div className="p-6 bg-stone-50 border-r border-amber-100/80 flex flex-col justify-between">
            <div>
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-200 shadow-inner mb-3">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={pet.petName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge type={pet.status === 'Reunited' ? 'Reunited' : pet.reportType} />
                </div>
                {isLost && pet.reward && (
                  <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Reward: {pet.reward}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Share & Print Actions */}
            <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-600 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share Report
              </button>
              <span className="text-[11px] text-stone-400">
                Report #{pet.id} • Myanmar Pet Network
              </span>
            </div>
          </div>

          {/* Right Column: Detailed Pet Attributes */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Pet Title & Header */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {pet.petType}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {pet.breed}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                  {pet.petName || (isLost ? 'Missing Pet' : 'Found Pet')}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Reported on {pet.reportedDate || pet.date} in {pet.township}, {pet.region}
                </p>
              </div>

              {/* Status & Attributes Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Gender & Age</span>
                  <span className="font-bold text-stone-800">{pet.gender || 'Unknown'} • {pet.age || 'Unknown'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Primary Colour</span>
                  <span className="font-bold text-stone-800">{pet.colour || pet.color || 'Unknown'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Collar Tag</span>
                  <span className="font-bold text-stone-800">{pet.collar || 'None'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Microchip</span>
                  <span className="font-bold text-stone-800">{pet.microchip || (pet.microchipped ? 'Yes' : 'No')}</span>
                </div>
              </div>

              {/* Location & Time Info */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold">{isLost ? 'Last Seen Date:' : 'Found Date:'}</span>
                  <span>{pet.date} at {pet.time || '12:00 PM'}</span>
                </div>
                <div className="flex items-start gap-2 text-stone-700">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{pet.township}, {pet.city || pet.township}, {pet.region}</span>
                    <span className="text-stone-500">{pet.exactLocation}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Detailed Description
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {pet.description || 'No additional notes provided.'}
                </p>
              </div>

              {/* Appearance / Unique Marks */}
              {pet.appearance && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Physical Appearance & Marks
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pet.appearance}
                  </p>
                </div>
              )}

              {/* Contact Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {isLost ? 'Pet Owner Contact' : 'Finder Contact'}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-stone-800">{pet.userName || 'Community Member'}</div>
                  <div className="text-stone-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{pet.userPhone || '+95 9 798 123 456'}</span>
                  </div>
                  {pet.userEmail && (
                    <div className="text-stone-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>{pet.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Action Buttons */}
            <div className={`pt-6 mt-6 border-t border-amber-100 grid gap-3 ${isOwner ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
              <button
                onClick={handleOpenChat}
                className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Contact / Send Message
              </button>
              <button
                onClick={handleOpenSighting}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Submit Sighting
              </button>
              {!isOwner && (
                <button
                  type="button"
                  onClick={handleOpenComplaintForm}
                  className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  Report this post
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Real Community Sightings for this Pet */}
        <div className="p-6 md:p-8 bg-stone-50 border-t border-amber-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-sm md:text-base">
                  Community Street Sightings ({petSightings.length})
                </h3>
                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white">
                    Owner Clues
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time reports and photos submitted by local citizens who spotted this pet
              </p>
            </div>

            <button
              onClick={handleOpenSighting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <AlertCircle className="w-4 h-4" />
              I Spotted This Pet
            </button>
          </div>

          {isOwner && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Owner Notice:</strong> You are the owner of this pet report. Use the verified clues and phone numbers below to contact witnesses and narrow your search.
              </span>
            </div>
          )}

          {petSightings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {petSightings.map(s => (
                <div
                  key={s.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-stone-800">
                        {s.township ? `${s.township}, ` : ''}{s.location}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {s.sightingDate} {s.sightingTime}
                    </span>
                  </div>

                  {s.photo && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                      <img
                        src={s.photo}
                        alt="Sighting evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs text-stone-600 italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                    "{s.notes}"
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">
                      Witness: <strong className="text-stone-800">{s.submitterName}</strong>
                    </span>
                    <a
                      href={`tel:${s.submitterPhone}`}
                      className="font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {s.submitterPhone}
                    </a>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
              No street sightings reported yet for this pet. Neighbors can submit sighting photos above.
            </div>
          )}
        </div>

        {/* Possible Matches Section within Modal (Always displays appropriate feedback!) */}
        <div className="p-6 md:p-8 bg-amber-50/50 border-t border-amber-100 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-stone-900 text-sm md:text-base">
                Possible Matching Pets {matches.length > 0 ? `(${matches.length})` : ''}
              </h3>
            </div>
            <button
              onClick={() => { handleClose(); navigate('/user/matches'); }}
              className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
            >
              View Full Comparison Engine →
            </button>
          </div>

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.map(match => (
                <div
                  key={match.id}
                  onClick={() => setSelectedPetForModal(match)}
                  className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center gap-3 cursor-pointer hover:shadow-md transition"
                >
                  <img
                    src={match.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                    alt={match.petName || 'Matched Pet'}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge type={match.reportType} size="sm" />
                      <span className="text-[11px] font-semibold text-stone-500 truncate">{match.breed}</span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-900 truncate">{match.petName}</h4>
                    <p className="text-[11px] text-stone-500 truncate">{match.township}, {match.city || match.township}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center bg-white/80 rounded-2xl border border-amber-200/80 text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">
                {isLost
                  ? 'No matching found pets detected yet in this vicinity.'
                  : 'No active lost pet reports currently match this found pet.'}
              </p>
              <p className="text-stone-500 text-[11px]">
                {isLost
                  ? 'Our AI engine compares new incoming found reports 24/7 and will alert you in notifications.'
                  : 'When the owner posts their lost listing, our system will connect their report here.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {showComplaintForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitComplaint}
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Safety &amp; Compliance</span>
                <h3 className="text-lg font-extrabold text-stone-900 mt-1">Report this pet post</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Tell our moderation team what seems wrong. Your report is private.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComplaintForm(false)}
                disabled={isSubmittingComplaint}
                aria-label="Close complaint form"
                className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label htmlFor="complaint-subject" className="block text-xs font-bold text-stone-700 mb-1.5">
                Reason for reporting
              </label>
              <select
                id="complaint-subject"
                value={complaintSubject}
                onChange={(event) => setComplaintSubject(event.target.value)}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
              >
                <option value="">Select a reason</option>
                <option value="Fraud or scam">Fraud or scam</option>
                <option value="Harassment or inappropriate contact">Harassment or inappropriate contact</option>
                <option value="Spam or misleading information">Spam or misleading information</option>
                <option value="Inaccurate pet information">Inaccurate pet information</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="complaint-description" className="block text-xs font-bold text-stone-700 mb-1.5">
                Details
              </label>
              <textarea
                id="complaint-description"
                value={complaintDescription}
                onChange={(event) => setComplaintDescription(event.target.value)}
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                placeholder="Describe the issue so our team can review it (at least 10 characters)."
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none resize-y"
              />
              <p className="text-[11px] text-stone-400 text-right mt-1">
                {complaintDescription.length}/5000
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowComplaintForm(false)}
                disabled={isSubmittingComplaint}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingComplaint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-60"
              >
                {isSubmittingComplaint ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmittingComplaint ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PetDetailModal;

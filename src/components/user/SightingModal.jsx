import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Calendar, Clock, Camera, Send, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

const SightingModal = () => {
  const { selectedSightingPet, setSelectedSightingPet, addSighting, locations, currentUser } = useApp();
  const navigate = useNavigate();

  const [region, setRegion] = useState('Yangon Region');
  const [township, setTownship] = useState('Kamayut Township');
  const [location, setLocation] = useState('');
  const [sightingDate, setSightingDate] = useState(new Date().toISOString().split('T')[0]);
  const [sightingTime, setSightingTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [submitterName, setSubmitterName] = useState(currentUser?.name || '');
  const [submitterPhone, setSubmitterPhone] = useState(currentUser?.phone || '');
  const [imagePreview, setImagePreview] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.name) setSubmitterName(currentUser.name);
    if (currentUser?.phone) setSubmitterPhone(currentUser.phone);
  }, [currentUser]);

  // Derived townships
  const availableTownships = useMemo(() => {
    if (!Array.isArray(locations)) return ['Kamayut Township', 'Hlaing Township', 'Bahan Township'];
    const r = locations.find(l => l && (l.region === region || l.name === region));
    return r?.cities?.[0]?.townships || ['Kamayut Township', 'Hlaing Township', 'Bahan Township'];
  }, [region, locations]);

  if (!selectedSightingPet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim() || !notes.trim()) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();
      const petId = selectedSightingPet.rawId || (typeof selectedSightingPet.id === 'number' ? selectedSightingPet.id : parseInt(String(selectedSightingPet.id).replace(/\D/g, ''), 10)) || 1;
      form.append('pet_report_id', petId);

      const foundRegion = Array.isArray(locations) ? locations.find(l => l && (l.region === region || l.name === region)) : null;
      if (foundRegion?.id) form.append('state_region_id', foundRegion.id);
      form.append('state_region', region);
      form.append('region', region);
      form.append('township', township);
      form.append('sighting_date', sightingDate);
      form.append('sighting_time', sightingTime);
      form.append('location_details', location.trim());
      form.append('witness_notes', notes.trim());
      if (rawFile) {
        form.append('images[]', rawFile);
      }

      const res = await addSighting(form);
      const ownerId = selectedSightingPet.owner?.id || selectedSightingPet.userId;
      setSelectedSightingPet(null);

      // Immediately connect to Chat Box with the pet owner!
      if (res?.conversation_id) {
        navigate(`/user/messages?convId=${res.conversation_id}`);
      } else if (ownerId) {
        navigate(`/user/messages?ownerId=${ownerId}&petId=${petId}`);
      } else {
        navigate('/user/messages');
      }
    } catch (err) {
      console.error('Failed to submit sighting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRawFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200/80 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedSightingPet(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Badge & Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Report Sighting
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Did you spot {selectedSightingPet.petName || 'this pet'}?
          </h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Provide details of where and when you saw them to help their owner reunite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Region and Township */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                State / Region *
              </label>
              <select
                value={region}
                onChange={(e) => {
                  const nextReg = e.target.value;
                  setRegion(nextReg);
                  if (Array.isArray(locations)) {
                    const r = locations.find(l => l && (l.region === nextReg || l.name === nextReg));
                    const firstT = r?.cities?.[0]?.townships?.[0] || '';
                    if (firstT) setTownship(firstT);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-stone-800 shadow-sm transition"
              >
                {Array.isArray(locations) && locations.map(l => (
                  <option key={l.id || l.region} value={l.region || l.name}>{l.region || l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                Township *
              </label>
              <select
                value={township}
                onChange={(e) => setTownship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-stone-800 shadow-sm transition"
              >
                {availableTownships.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exact Location */}
          <div>
            <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
              Exact Landmark / Street Details *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Inya Lake jogging trail, near green bench"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                Sighting Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={sightingDate}
                  onChange={(e) => setSightingDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                Approximate Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="time"
                  value={sightingTime}
                  onChange={(e) => setSightingTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Sighting Photo Upload with preview */}
          <div>
            <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
              Photo of Sighting (Recommended)
            </label>
            {imagePreview ? (
              <div className="relative p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Sighting preview"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-300 shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-amber-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Photo attached
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Will be uploaded to MySQL and shared with the owner.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl transition text-xs font-bold text-amber-800">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Upload Sighting Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Observations & Notes */}
          <div>
            <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
              Observations & Notes *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. He looked in good spirits, drinking water near the tea shop, heading west."
              className="w-full p-3.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
            />
          </div>

          {/* Submitter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="e.g. Daw Aye Aye"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Contact Phone
              </label>
              <input
                type="text"
                value={submitterPhone}
                onChange={(e) => setSubmitterPhone(e.target.value)}
                placeholder="09..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Recording Sighting & Connecting Chat...' : 'Submit Sighting & Alert Owner'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SightingModal;

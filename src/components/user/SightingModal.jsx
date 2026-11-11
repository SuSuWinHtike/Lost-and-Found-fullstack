import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Calendar, Clock, Camera, Send, AlertTriangle } from 'lucide-react';

const SightingModal = () => {
  const { selectedSightingPet, setSelectedSightingPet, addSighting } = useApp();

  const [location, setLocation] = useState('');
  const [sightingDate, setSightingDate] = useState(new Date().toISOString().split('T')[0]);
  const [sightingTime, setSightingTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [submitterName, setSubmitterName] = useState('Community Helper');
  const [submitterPhone, setSubmitterPhone] = useState('+95 9 798 123 456');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80');

  if (!selectedSightingPet) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim() || !notes.trim()) return;

    addSighting({
      petId: selectedSightingPet.id,
      petName: selectedSightingPet.petName || 'Pet',
      submitterName,
      submitterPhone,
      sightingDate,
      sightingTime,
      location,
      notes,
      image: imagePreview
    });

    setSelectedSightingPet(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedSightingPet(null)}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Report Sighting
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            Did you spot {selectedSightingPet.petName || 'this pet'}?
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Provide details of where and when you saw them to help their owner reunite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Exact Sighting Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Inya Lake jogging trail, near green bench"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Sighting Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={sightingDate}
                  onChange={(e) => setSightingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Approximate Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="time"
                  value={sightingTime}
                  onChange={(e) => setSightingTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sighting Photo Upload with preview */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Photo of Sighting (Optional)
            </label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Sighting preview"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-200 shadow-sm"
                />
              )}
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-amber-300 rounded-xl hover:bg-amber-50 transition text-xs font-medium text-amber-800">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Upload Sighting Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Observations & Notes *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. He looked in good spirits, drinking water near the tea shop, heading west."
              className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Submitter info */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Your Contact Phone
              </label>
              <input
                type="text"
                value={submitterPhone}
                onChange={(e) => setSubmitterPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition"
            >
              <Send className="w-4 h-4" />
              Submit Sighting to Platform
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SightingModal;

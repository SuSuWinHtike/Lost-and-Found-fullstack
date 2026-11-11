import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Plus,
  Trash2,
  Building,
  ChevronRight,
  Globe,
  Layers,
  CheckCircle2
} from 'lucide-react';

const LocationManagementPage = () => {
  const { locations, addLocation, deleteLocation } = useApp();

  const [regionInput, setRegionInput] = useState('Yangon Region');
  const [cityNameInput, setCityNameInput] = useState('');
  const [townshipsInput, setTownshipsInput] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!regionInput.trim() || !cityNameInput.trim() || !townshipsInput.trim()) return;

    const townshipsArray = townshipsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addLocation(regionInput.trim(), cityNameInput.trim(), townshipsArray);
    setCityNameInput('');
    setTownshipsInput('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Geographic Coverage
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Myanmar Location Management ({locations.length} Regions)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Configure States, Divisions, Cities, and Townships for hyper-local pet sighting alerts.
        </p>
      </div>

      {/* Add New Township / City Box */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" />
          Add City & Townships to Myanmar Region
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">State / Region</label>
            <input
              type="text"
              required
              value={regionInput}
              onChange={(e) => setRegionInput(e.target.value)}
              placeholder="e.g. Yangon Region, Shan State"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">City Name</label>
            <input
              type="text"
              required
              value={cityNameInput}
              onChange={(e) => setCityNameInput(e.target.value)}
              placeholder="e.g. Mawlamyine, Pyay"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Townships (Comma Separated)</label>
            <input
              type="text"
              required
              value={townshipsInput}
              onChange={(e) => setTownshipsInput(e.target.value)}
              placeholder="e.g. Central, North Quarter, Station Road"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Save Location Structure
            </button>
          </div>
        </form>
      </div>

      {/* Existing Locations Tree */}
      <div className="space-y-6">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">{loc.region}</h3>
              </div>

              <button
                onClick={() => deleteLocation(loc.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Remove Region"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loc.cities.map((city, cIdx) => (
                <div key={cIdx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-600" />
                    City: {city.cityName}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {city.townships.map((township, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-semibold text-stone-700 shadow-2xs"
                      >
                        {township}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LocationManagementPage;

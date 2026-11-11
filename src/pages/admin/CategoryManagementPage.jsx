import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  Trash2,
  Tag,
  Palette,
  PawPrint,
  CheckCircle2,
  X
} from 'lucide-react';

const CategoryManagementPage = () => {
  const {
    petTypes,
    breeds,
    addBreed,
    deleteBreed,
    colours,
    addColour,
    deleteColour
  } = useApp();

  // Active Category Tab: 'breeds' | 'colours' | 'types'
  const [activeTab, setActiveTab] = useState('breeds');

  // New Breed State
  const [newBreedType, setNewBreedType] = useState('Dog');
  const [newBreedName, setNewBreedName] = useState('');

  // New Colour State
  const [newColourName, setNewColourName] = useState('');
  const [newColourHex, setNewColourHex] = useState('#E5A93C');

  const handleAddBreed = (e) => {
    e.preventDefault();
    if (!newBreedName.trim()) return;
    addBreed(newBreedType, newBreedName.trim());
    setNewBreedName('');
  };

  const handleAddColour = (e) => {
    e.preventDefault();
    if (!newColourName.trim()) return;
    addColour(newColourName.trim(), newColourHex);
    setNewColourName('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Platform Taxonomies
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Category & Trait Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Maintain species types, recognized cat and dog breeds, and coat colours for streamlined matching.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('breeds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'breeds'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <PawPrint className="w-4 h-4" />
          <span>Pet Breeds ({breeds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('colours')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'colours'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Pet Colours ({colours.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'types'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Species / Types ({petTypes.length})</span>
        </button>
      </div>

      {/* TAB 1: Breeds Management */}
      {activeTab === 'breeds' && (
        <div className="space-y-6">
          {/* Add Breed Box */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
            <h3 className="font-extrabold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              Add New Breed
            </h3>

            <form onSubmit={handleAddBreed} className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={newBreedType}
                onChange={(e) => setNewBreedType(e.target.value)}
                className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white"
              >
                <option value="Dog">Dog Breed</option>
                <option value="Cat">Cat Breed</option>
              </select>

              <input
                type="text"
                required
                value={newBreedName}
                onChange={(e) => setNewBreedName(e.target.value)}
                placeholder="Enter breed name (e.g. Labrador Retriever, Ragdoll)..."
                className="w-full flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Breed
              </button>
            </form>
          </div>

          {/* Breeds List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {breeds.map(breed => (
              <div
                key={breed.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    breed.petType === 'Dog' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {breed.petType}
                  </span>
                  <span className="font-bold text-xs text-stone-900">{breed.name}</span>
                </div>

                <button
                  onClick={() => deleteBreed(breed.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove breed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Colours Management */}
      {activeTab === 'colours' && (
        <div className="space-y-6">
          {/* Add Colour Box */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
            <h3 className="font-extrabold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              Add New Pet Colour Pattern
            </h3>

            <form onSubmit={handleAddColour} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="color"
                value={newColourHex}
                onChange={(e) => setNewColourHex(e.target.value)}
                className="w-12 h-10 rounded-xl cursor-pointer border border-stone-200 p-1"
                title="Choose sample swatch"
              />

              <input
                type="text"
                required
                value={newColourName}
                onChange={(e) => setNewColourName(e.target.value)}
                placeholder="Colour label (e.g. Cinnamon, Lavender Grey)..."
                className="w-full flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Colour
              </button>
            </form>
          </div>

          {/* Colours List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colours.map(c => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full border border-stone-300 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-bold text-xs text-stone-900">{c.name}</span>
                </div>

                <button
                  onClick={() => deleteColour(c.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove colour"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Species Types */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {petTypes.map(type => (
            <div key={type.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <PawPrint className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900">{type.name}</h4>
                  <p className="text-xs text-stone-500">Active category with full breed taxonomy</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Core System Type
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CategoryManagementPage;

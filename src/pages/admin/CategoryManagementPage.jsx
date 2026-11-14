import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  Trash2,
  Palette,
  PawPrint,
} from 'lucide-react';

const CategoryManagementPage = () => {
  const {
    petTypes,
    breeds,
    addPetType,
    addBreed,
    deleteBreed,
    colours,
    addColour,
    deleteColour,
    refreshTaxonomies,
  } = useApp();

  const [activeTab, setActiveTab] = useState('breeds');
  const [newBreedType, setNewBreedType] = useState('');
  const [newBreedName, setNewBreedName] = useState('');
  const [newColourName, setNewColourName] = useState('');
  const [newColourHex, setNewColourHex] = useState('#E5A93C');
  const [newPetType, setNewPetType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    refreshTaxonomies()
      .then(data => {
        if (active) setNewBreedType(data.petTypes[0]?.name || '');
      })
      .catch(err => {
        if (active) setError(err.response?.data?.message || 'Could not load category data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshTaxonomies]);

  const runAction = async (action) => {
    setError('');
    setSaving(true);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'The category change failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddBreed = (event) => {
    event.preventDefault();
    if (!newBreedName.trim() || !newBreedType) return;
    runAction(() => addBreed(newBreedType, newBreedName.trim()))
      .then(succeeded => {
        if (succeeded) setNewBreedName('');
      });
  };

  const handleAddColour = (event) => {
    event.preventDefault();
    if (!newColourName.trim()) return;
    runAction(() => addColour(newColourName.trim(), newColourHex))
      .then(succeeded => {
        if (succeeded) setNewColourName('');
      });
  };

  const handleAddPetType = (event) => {
    event.preventDefault();
    if (!newPetType.trim()) return;
    runAction(() => addPetType(newPetType.trim()))
      .then(succeeded => {
        if (succeeded) setNewPetType('');
      });
  };

  const removeBreed = (breed) => {
    if (window.confirm(`Remove ${breed.name}? Existing reports will be preserved.`)) {
      runAction(() => deleteBreed(breed.id));
    }
  };

  const removeColour = (colour) => {
    if (window.confirm(`Remove ${colour.name}? Existing reports will be preserved.`)) {
      runAction(() => deleteColour(colour.id));
    }
  };

  const tabClass = (tab) => `px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
    activeTab === tab ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
  }`;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Platform Taxonomies
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Category &amp; Trait Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage pet types, breeds, and coat colours used by reports and matching.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button onClick={() => setActiveTab('breeds')} className={tabClass('breeds')}>
          <PawPrint className="w-4 h-4" />
          <span>Pet Breeds ({breeds.length})</span>
        </button>
        <button onClick={() => setActiveTab('colours')} className={tabClass('colours')}>
          <Palette className="w-4 h-4" />
          <span>Pet Colours ({colours.length})</span>
        </button>
        <button onClick={() => setActiveTab('types')} className={tabClass('types')}>
          <Layers className="w-4 h-4" />
          <span>Species / Types ({petTypes.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          Loading category data...
        </div>
      ) : (
        <>
          {activeTab === 'breeds' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
                <h3 className="font-extrabold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  Add New Breed
                </h3>
                <form onSubmit={handleAddBreed} className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={newBreedType}
                    onChange={event => setNewBreedType(event.target.value)}
                    required
                    disabled={petTypes.length === 0 || saving}
                    className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white"
                  >
                    {petTypes.map(type => <option key={type.id} value={type.name}>{type.name} Breed</option>)}
                  </select>
                  <input
                    type="text"
                    required
                    value={newBreedName}
                    onChange={event => setNewBreedName(event.target.value)}
                    placeholder="Enter breed name..."
                    className="w-full flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={saving || petTypes.length === 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Breed
                  </button>
                </form>
                {petTypes.length === 0 && (
                  <p className="mt-3 text-xs text-stone-500">Add a pet type before creating breeds.</p>
                )}
              </div>

              {breeds.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">No breeds have been added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {breeds.map(breed => (
                    <div key={breed.id} className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                          {breed.petType}
                        </span>
                        <span className="font-bold text-xs text-stone-900">{breed.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBreed(breed)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                        title="Remove breed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'colours' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
                <h3 className="font-extrabold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  Add New Pet Colour
                </h3>
                <form onSubmit={handleAddColour} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="color"
                    value={newColourHex}
                    onChange={event => setNewColourHex(event.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-stone-200 p-1"
                    title="Choose colour swatch"
                  />
                  <input
                    type="text"
                    required
                    value={newColourName}
                    onChange={event => setNewColourName(event.target.value)}
                    placeholder="Colour name..."
                    className="w-full flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Colour
                  </button>
                </form>
              </div>

              {colours.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">No pet colours have been added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {colours.map(colour => (
                    <div key={colour.id} className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-stone-300 shadow-inner flex-shrink-0" style={{ backgroundColor: colour.hex }} />
                        <span className="font-bold text-xs text-stone-900">{colour.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColour(colour)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                        title="Remove colour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
                <h3 className="font-extrabold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  Add Pet Type
                </h3>
                <form onSubmit={handleAddPetType} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    value={newPetType}
                    onChange={event => setNewPetType(event.target.value)}
                    placeholder="Enter pet type..."
                    className="w-full flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Type
                  </button>
                </form>
                <p className="mt-3 text-xs text-stone-500">Pet types cannot be removed here because existing reports depend on them.</p>
              </div>

              {petTypes.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">No pet types have been added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {petTypes.map(type => (
                    <div key={type.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <PawPrint className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-stone-900">{type.name}</h4>
                          <p className="text-xs text-stone-500">Active pet type</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryManagementPage;

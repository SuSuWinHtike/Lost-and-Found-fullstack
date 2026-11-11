import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  Camera,
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  PawPrint
} from 'lucide-react';

const CreateReportPage = () => {
  const { addPet, petTypes, breeds, colours, locations, currentUser } = useApp();
  const navigate = useNavigate();

  // Segmented control: 'lost' or 'found'
  const [reportType, setReportType] = useState('lost');

  // Common and type-specific form fields
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [colour, setColour] = useState('Golden / Cream');
  const [secondaryColour, setSecondaryColour] = useState('');
  const [age, setAge] = useState('2.5 Years');
  const [gender, setGender] = useState('Male');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  
  // Location
  const [region, setRegion] = useState('Yangon Region');
  const [city, setCity] = useState('Yangon');
  const [township, setTownship] = useState('Hlaing Township');
  const [exactLocation, setExactLocation] = useState('');

  // Description & Details
  const [description, setDescription] = useState('');
  const [appearance, setAppearance] = useState('');
  const [holdingLocation, setHoldingLocation] = useState('');
  const [collar, setCollar] = useState('');
  const [microchipped, setMicrochipped] = useState(false);
  const [microchipId, setMicrochipId] = useState('');
  const [reward, setReward] = useState('');

  // Contact Info
  const [userName, setUserName] = useState(currentUser?.name || 'Kyaw Zin Htet');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '09-450-123-789');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'kyawzin@gmail.com');

  // Multiple Image Upload state
  const [images, setImages] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived location dropdowns
  const availableCities = useMemo(() => {
    const r = locations.find(l => l.region === region);
    return r ? r.cities : [];
  }, [region, locations]);

  const availableTownships = useMemo(() => {
    const c = availableCities.find(c => c.cityName === city);
    return c ? c.townships : (availableCities[0]?.townships || []);
  }, [city, availableCities]);

  // Breeds filtered by selected pet type
  const availableBreeds = useMemo(() => {
    return breeds.filter(b => b.petType.toLowerCase() === petType.toLowerCase());
  }, [petType, breeds]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setRawFiles(prev => [...prev, ...files].slice(0, 4));
      const newUrls = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newUrls].slice(0, 4));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setRawFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim() || !exactLocation.trim()) {
      alert('Please fill out the description and exact location details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', reportType);
      formData.append('pet_name', petName.trim() || (reportType === 'found' ? `Found ${petType}` : 'Missing Pet'));
      formData.append('pet_type', petType);
      formData.append('category_id', petType.toLowerCase() === 'cat' ? 2 : 1);

      const foundBreed = breeds.find(b => b.name === breed);
      if (foundBreed?.id) formData.append('breed_id', foundBreed.id);
      formData.append('breed', breed);

      const foundColor = colours.find(c => c.name === colour);
      if (foundColor?.id) formData.append('color_id', foundColor.id);
      formData.append('colour', colour);
      formData.append('color', colour);
      if (secondaryColour.trim()) formData.append('secondary_color', secondaryColour.trim());

      formData.append('gender', gender.toLowerCase());
      formData.append('age', age.trim() || 'Unknown');
      formData.append('event_date', date);
      formData.append('event_time', time);

      const foundRegion = locations.find(l => l.region === region || l.name === region);
      if (foundRegion?.id) formData.append('state_region_id', foundRegion.id);
      formData.append('state_region', region);
      formData.append('region', region);
      formData.append('township', township);
      formData.append('last_seen_or_found_location', exactLocation.trim());
      formData.append('description', description.trim());

      if (appearance.trim()) formData.append('physical_condition', appearance.trim());
      if (holdingLocation.trim() && reportType === 'found') formData.append('safe_holding_location', holdingLocation.trim());
      if (collar.trim()) formData.append('collar_description', collar.trim());
      if (microchipped && microchipId.trim()) formData.append('microchip_id', microchipId.trim());
      if (reward.trim() && reportType === 'lost') formData.append('reward_amount', `${reward.trim()} MMK`);

      formData.append('contact_name', userName.trim());
      formData.append('contact_phone', userPhone.trim());

      rawFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      await addPet(formData);
      navigate('/user/pet-reports');
    } catch (err) {
      console.error('Failed to submit pet report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Report Submission
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Create Pet Report
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Publish a detailed report to alert community members and find matching pets.
        </p>
      </div>

      {/* Segmented Control / Tab Switcher (Lost vs Found) */}
      <div className="bg-stone-200/80 p-1.5 rounded-2xl flex max-w-md shadow-inner border border-stone-200">
        <button
          type="button"
          onClick={() => setReportType('lost')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            reportType === 'lost'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Lost Pet Report
        </button>

        <button
          type="button"
          onClick={() => setReportType('found')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            reportType === 'found'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Found Pet Report
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-amber-200/90 pet-shadow space-y-8">
        
        {/* Section 1: Basic Pet Identity */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-amber-600" />
            1. Pet Identity & Characteristics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Pet Name (only mandatory for Lost, optional/suggested for Found) */}
            {reportType === 'lost' ? (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Milo, Luna, Buddy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Pet Name / Temporary Name
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Friendly Found Dog"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Pet Type (Cat / Dog) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Pet Type *
              </label>
              <select
                value={petType}
                onChange={(e) => {
                  setPetType(e.target.value);
                  const firstBreed = breeds.find(b => b.petType.toLowerCase() === e.target.value.toLowerCase());
                  if (firstBreed) setBreed(firstBreed.name);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Breed *
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {availableBreeds.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Colour */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Primary Colour / Pattern *
              </label>
              <select
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {colours.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Secondary Colour */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Secondary Colour / Markings
              </label>
              <input
                type="text"
                value={secondaryColour}
                onChange={(e) => setSecondaryColour(e.target.value)}
                placeholder="e.g. White chest, Brown paws"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Age / Estimated Age */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {reportType === 'lost' ? 'Pet Age' : 'Estimated Age'}
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2.5 Years or 6 Months"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown / Not Checked</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Photos (Multiple Upload Previews) */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-2 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600" />
            2. Pet Photos (Multiple Uploads)
          </h2>
          <p className="text-xs text-stone-500 mb-4">
            Clear, well-lit photos increase identification rate by over 80%. You can upload up to 4 images.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm group">
                <img src={img} alt="Pet preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition shadow"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-amber-300 hover:bg-amber-50 transition cursor-pointer flex flex-col items-center justify-center text-center p-2 text-stone-500 hover:text-amber-700">
                <Upload className="w-6 h-6 text-amber-600 mb-1" />
                <span className="text-[11px] font-bold">Upload Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 3: Date, Time & Myanmar Location */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            3. {reportType === 'lost' ? 'Last-Seen Date & Location' : 'Found Date & Location'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {reportType === 'lost' ? 'Last-Seen Date *' : 'Date Found *'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* State / Region */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                State / Region *
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  const newCities = locations.find(l => l.region === e.target.value)?.cities || [];
                  setCity(newCities[0]?.cityName || '');
                  setTownship(newCities[0]?.townships[0] || '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.region}>{l.region}</option>
                ))}
              </select>
            </div>

            {/* Township */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Township *
              </label>
              <select
                value={township}
                onChange={(e) => setTownship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {availableTownships.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exact Location Landmark */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Exact Landmark / Street Address *
            </label>
            <input
              type="text"
              required
              value={exactLocation}
              onChange={(e) => setExactLocation(e.target.value)}
              placeholder="e.g. Near Inya Lake walkway entrance, University Avenue bus stop"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Physical Description & Condition */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            4. Detailed Description & Appearance
          </h2>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Detailed Incident Story / Context *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  reportType === 'lost'
                    ? 'Explain how the pet went missing, their personality traits, behavior around strangers...'
                    : 'Explain where the animal was discovered, whether they were frightened, healthy, hungry...'
                }
                className="w-full p-3.5 rounded-2xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Physical Appearance & Condition */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Physical Appearance, Distinguishing Marks & Condition
              </label>
              <input
                type="text"
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="e.g. White patch on chest, left ear slightly floppy, healthy and active"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Safe Holding / Foster Location (Found Pet) */}
            {reportType === 'found' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Safe Holding / Foster Location *
                </label>
                <input
                  type="text"
                  required
                  value={holdingLocation}
                  onChange={(e) => setHoldingLocation(e.target.value)}
                  placeholder="e.g. Fostered safely at home in Kamayut or Local Vet Clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Collar & Microchip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Collar / Tag Details
                </label>
                <input
                  type="text"
                  value={collar}
                  onChange={(e) => setCollar(e.target.value)}
                  placeholder="e.g. Red leather collar with brass bell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {reportType === 'lost' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Reward (Optional)
                  </label>
                  <input
                    type="text"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="e.g. 200,000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 pt-2 mb-1.5">
                  <input
                    type="checkbox"
                    id="microchip"
                    checked={microchipped}
                    onChange={(e) => setMicrochipped(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="microchip" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Pet is microchipped
                  </label>
                </div>
                {microchipped && (
                  <input
                    type="text"
                    value={microchipId}
                    onChange={(e) => setMicrochipId(e.target.value)}
                    placeholder="Microchip ID (e.g. MC-984210)"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Contact Information */}
        <div>
          <h2 className="text-base font-extrabold text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            5. Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/user/pet-reports')}
            className="px-6 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish {reportType === 'lost' ? 'Lost Pet' : 'Found Pet'} Report
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateReportPage;

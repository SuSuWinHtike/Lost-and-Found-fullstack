import React from 'react';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { MapPin, Calendar, Eye, Sparkles, ChevronRight, Heart } from 'lucide-react';

const PetCard = ({ pet, onSelect }) => {
  const { favorites, toggleFavorite } = useApp();

  if (!pet) return null;

  const isLost = pet.reportType === 'lost';
  const isFavorite = favorites?.includes(pet.id);

  const defaultFallback = pet.petType === 'Cat'
    ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

  const mainImage = pet.images && pet.images.length > 0
    ? pet.images[0]
    : defaultFallback;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(pet.id);
  };

  return (
    <div className="bg-white rounded-[28px] border border-stone-200/80 overflow-hidden pet-card-shadow pet-card-hover flex flex-col justify-between group">
      
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={mainImage}
          alt={pet.petName || 'Pet'}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultFallback;
          }}
        />

        {/* Soft bottom vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

        {/* Status Badge */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
          <Badge type={pet.status === 'Reunited' ? 'Reunited' : pet.reportType} />
        </div>

        {/* Heart Bookmark Button & Species Tag */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-stone-800 shadow-sm border border-white/60">
            {pet.petType === 'Dog' ? '🐶 Dog' : '🐱 Cat'}
          </span>
          <button
            onClick={handleFavoriteClick}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-500 hover:bg-white shadow-sm border border-white/60 transition cursor-pointer"
            title={isFavorite ? "Remove from saved bookmarks" : "Save to bookmarks"}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-600'}`} />
          </button>
        </div>

        {/* Reward pill if available */}
        {isLost && pet.reward && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Reward: {pet.reward}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Name & Breed Pill */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-black text-xl text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 tracking-tight">
              {pet.petName || (isLost ? 'Missing Pet' : 'Found Pet')}
            </h3>
            <span className="text-[11px] font-bold text-stone-600 bg-stone-100/80 px-2.5 py-1 rounded-lg flex-shrink-0">
              {pet.breed}
            </span>
          </div>

          {/* Color Pattern */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-stone-700">{pet.colour}</span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
            {pet.description}
          </p>
        </div>

        {/* Footer Area */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="truncate">{pet.township}, {pet.city}</span>
            </span>
            <span className="flex items-center gap-1 flex-shrink-0 text-stone-400 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{pet.date}</span>
            </span>
          </div>

          {/* View Details Action Button */}
          <button
            onClick={() => onSelect(pet)}
            className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white border border-amber-200/80 hover:border-amber-500 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Details</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PetCard;

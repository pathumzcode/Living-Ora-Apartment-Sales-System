import React from 'react';
import type { Apartment } from '../types';
import { MapPin, Layers, Waves, Dumbbell, ArrowRight } from 'lucide-react';

interface ApartmentCardProps {
  apartment: Apartment;
  onViewDetails: (apt: Apartment) => void;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({ apartment, onViewDetails }) => {
  return (
    <div className="glass-card-interactive flex flex-col h-full animate-fade-in">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={apartment.images}
          alt={apartment.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[0.78rem] font-bold text-gold-300 border border-gold-500/30">
          {apartment.numOfUnitsAvilable} Units Available
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-950/90 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <h3 className="text-xl font-heading font-bold text-slate-100 mb-1.5 leading-snug">{apartment.name}</h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-[0.85rem]">
            <MapPin size={15} className="text-gold-500 shrink-0" />
            <span className="truncate">{apartment.location}</span>
          </div>
        </div>

        <p className="text-[0.88rem] text-slate-400 mb-5 line-clamp-2 leading-relaxed flex-1">
          {apartment.about}
        </p>

        {/* Amenities */}
        <div className="flex gap-4 mb-5 bg-white/[0.03] px-4 py-2.5 rounded-lg border border-white/[0.08] text-[0.82rem] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-cyan-400" /> {apartment.numOfFloors} Floors
          </span>
          <span className="flex items-center gap-1.5">
            <Waves size={14} className="text-cyan-400" /> {apartment.numOfSwimmingPool} Pool
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell size={14} className="text-cyan-400" /> {apartment.numOfGYM} Gym
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] mt-auto">
          <div>
            <span className="block text-[0.72rem] text-slate-500 uppercase tracking-wider">Starting From</span>
            <span className="text-lg font-bold text-gold-400">{apartment.priceRange}</span>
          </div>
          <button onClick={() => onViewDetails(apartment)} className="btn btn-gold btn-sm">
            Explore Units <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { Unit } from '../types';
import { BedDouble, Bath, Sofa, Wind, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UnitCardProps {
  unit: Unit;
  apartmentName: string;
  onBook: (unit: Unit) => void;
}

const AvailabilityBadge: React.FC<{ status: Unit['avilability'] }> = ({ status }) => {
  const map: Record<Unit['avilability'], { cls: string; Icon: React.ElementType; label: string }> = {
    Available: { cls: 'badge-available', Icon: CheckCircle, label: 'Available' },
    Reserved: { cls: 'badge-reserved', Icon: Clock, label: 'Reserved' },
    Sold: { cls: 'badge-sold', Icon: XCircle, label: 'Sold' },
  };
  const { cls, Icon, label } = map[status];
  return <span className={`badge ${cls}`}><Icon size={13} />{label}</span>;
};

export const UnitCard: React.FC<UnitCardProps> = ({ unit, apartmentName, onBook }) => {
  const { role } = useAuth();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="glass-card-interactive flex flex-col animate-fade-in">
      <div className="relative h-48 overflow-hidden">
        {!imgError ? (
          <img
            src={unit.images}
            alt={`Unit ${unit.unitId}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-700 text-slate-500 text-sm">No Image</div>
        )}
        <div className="absolute top-3 left-3">
          <AvailabilityBadge status={unit.avilability} />
        </div>
        <div className="absolute top-3 right-3 bg-dark-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[0.78rem] font-semibold text-slate-300">
          {unit.acOrNonAC}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-dark-950/90 to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.78rem] text-slate-500 font-mono">#{unit.unitId}</span>
            <span className="text-[0.78rem] text-slate-400">Floor {unit.floor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[0.82rem] text-slate-400">
            <MapPin size={13} className="text-gold-500" />
            <span className="truncate">{unit.location}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-[0.82rem] text-slate-400">
          {[
            { Icon: BedDouble, text: `${unit.numOfBeds} Bed${unit.numOfBeds !== 1 ? 's' : ''}` },
            { Icon: Bath, text: `${unit.numOfBathRooms} Bath${unit.numOfBathRooms !== 1 ? 's' : ''}` },
            { Icon: Sofa, text: unit.fernitures },
            { Icon: Wind, text: unit.reccomendedPerson },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.06]">
              <Icon size={13} className="text-gold-500 shrink-0" />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-[0.83rem] text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-1">{unit.about}</p>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] mt-auto">
          <div>
            <span className="block text-[0.7rem] text-slate-500 uppercase tracking-wider">Unit Price</span>
            <span className="text-xl font-bold gold-gradient-text">
              ${unit.unitPrice.toLocaleString()}
            </span>
          </div>
          {role !== 'INTERNAL_STAFF' && unit.avilability === 'Available' && (
            <button onClick={() => onBook(unit)} className="btn btn-gold btn-sm">
              Reserve Unit
            </button>
          )}
          {unit.avilability !== 'Available' && (
            <span className="text-[0.82rem] text-slate-500 italic">Not Available</span>
          )}
          {role === 'INTERNAL_STAFF' && unit.avilability === 'Available' && (
            <span className="badge badge-available">Open</span>
          )}
        </div>
      </div>
    </div>
  );
};

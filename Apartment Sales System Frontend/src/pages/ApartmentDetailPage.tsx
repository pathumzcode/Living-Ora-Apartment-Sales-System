import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Apartment, Unit, PageId } from '../types';
import { UnitCard } from '../components/UnitCard';
import { BookingModal } from '../components/BookingModal';
import {
  ArrowLeft, Building2, MapPin, Layers, Waves, Dumbbell,
  LayoutGrid, BedDouble
} from 'lucide-react';

interface ApartmentDetailPageProps {
  apartment: Apartment;
  setActivePage: (page: PageId) => void;
}

export const ApartmentDetailPage: React.FC<ApartmentDetailPageProps> = ({ apartment, setActivePage }) => {
  const { units, promotions } = useStore();
  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'all'>('available');

  const aptUnits = units.filter(u => u.apartment_id === apartment.apartmentId);
  const displayUnits = activeTab === 'available' ? aptUnits.filter(u => u.avilability === 'Available') : aptUnits;
  const promotion = apartment.promotion_id ? promotions.find(p => p.promotionId === apartment.promotion_id) : null;

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <button onClick={() => setActivePage('apartments')} className="btn btn-glass mb-6">
          <ArrowLeft size={17} /> Back to Apartments
        </button>

        {/* Hero Image */}
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-white/[0.08]">
          <img src={apartment.images} alt={apartment.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{apartment.name}</h1>
              <div className="flex items-center gap-2 text-slate-300 text-[0.9rem] mt-1">
                <MapPin size={16} className="text-gold-400" /> {apartment.location}
              </div>
            </div>
            <div className="badge badge-available text-base px-4 py-2">
              {apartment.numOfUnitsAvilable} Available
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* Amenities */}
            <div className="glass-panel p-5">
              <h2 className="font-heading text-lg font-bold mb-4 text-slate-100">Complex Overview</h2>
              <div className="grid grid-cols-2 gap-3 text-[0.88rem]">
                {[
                  { Icon: Layers, label: `${apartment.numOfFloors} Floors` },
                  { Icon: Building2, label: `${apartment.numOfRoom} Total Units` },
                  { Icon: Waves, label: `${apartment.numOfSwimmingPool} Swimming Pool` },
                  { Icon: Dumbbell, label: `${apartment.numOfGYM} Gymnasium` },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-dark-950/50 border border-white/[0.08] p-3 rounded-lg text-slate-300">
                    <Icon size={16} className="text-gold-500 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="glass-panel p-5">
              <h2 className="font-heading text-lg font-bold mb-3 text-slate-100">About this Complex</h2>
              <p className="text-[0.88rem] text-slate-400 leading-relaxed">{apartment.about}</p>
            </div>

            {/* Price Range */}
            <div className="glass-panel p-5" style={{ borderColor: 'rgba(217,119,6,0.3)' }}>
              <h2 className="font-heading text-lg font-bold mb-2 text-slate-100">Price Range</h2>
              <div className="text-2xl font-black gold-gradient-text">{apartment.priceRange}</div>
              <div className="text-[0.82rem] text-slate-400 mt-1">Starting from 10% down payment</div>
            </div>

            {/* Promotion */}
            {promotion && (
              <div className="rounded-xl p-5 border border-gold-500/30" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.14), rgba(217,119,6,0.04))' }}>
                <div className="badge badge-gold mb-3">🏷️ Active Promotion</div>
                <h3 className="font-heading text-base font-bold text-slate-100 mb-1">{promotion.promotionTitle}</h3>
                <p className="text-[0.82rem] text-slate-400 mb-2">{promotion.about}</p>
                <div className="font-mono text-gold-300 text-[0.82rem] font-semibold">Code: {promotion.promotionCode}</div>
              </div>
            )}

            {/* Floor Plan */}
            {apartment.floorPlan && (
              <div className="glass-panel p-5">
                <h2 className="font-heading text-lg font-bold mb-3 text-slate-100 flex items-center gap-2">
                  <LayoutGrid size={18} className="text-gold-500" /> Floor Plan
                </h2>
                <img src={apartment.floorPlan} alt="Floor Plan" className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Right - Units */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-heading text-2xl font-bold text-slate-100 flex items-center gap-2">
                <BedDouble size={22} className="text-gold-500" /> Available Units
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('available')} className={`btn btn-sm ${activeTab === 'available' ? 'btn-gold' : 'btn-glass'}`}>
                  Available ({aptUnits.filter(u => u.avilability === 'Available').length})
                </button>
                <button onClick={() => setActiveTab('all')} className={`btn btn-sm ${activeTab === 'all' ? 'btn-gold' : 'btn-glass'}`}>
                  All Units ({aptUnits.length})
                </button>
              </div>
            </div>

            {displayUnits.length === 0 ? (
              <div className="glass-panel flex flex-col items-center py-16 text-slate-400">
                <BedDouble size={48} className="text-slate-600 mb-4" />
                <p>No units matching current filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {displayUnits.map(unit => (
                  <UnitCard
                    key={unit.unitId}
                    unit={unit}
                    apartmentName={apartment.name}
                    onBook={setBookingUnit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {bookingUnit && (
        <BookingModal
          unit={bookingUnit}
          apartmentName={apartment.name}
          onClose={() => setBookingUnit(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { UnitCard } from '../components/UnitCard';
import { BookingModal } from '../components/BookingModal';
import { MapPin, Layers, Waves, Dumbbell, ArrowLeft, Image, FileText, CheckCircle2 } from 'lucide-react';

export const ApartmentDetailPage = ({ apartment, onBack, setActivePage }) => {
  const { units, updateUnitStatus } = useStore();
  const { user, role } = useAuth();
  const isStaff = role === 'INTERNAL_STAFF';

  const [selectedUnitForBooking, setSelectedUnitForBooking] = useState(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  if (!apartment) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Apartment not found</h2>
        <button onClick={onBack} className="btn btn-gold" style={{ marginTop: '1rem' }}>
          Back to Apartments
        </button>
      </div>
    );
  }

  // Filter units for this apartment
  const apartmentUnits = units.filter((u) => u.apartment_id === apartment.apartmentId);

  const handleBookUnit = (unit) => {
    if (!user) {
      setActivePage('auth');
      return;
    }
    setSelectedUnitForBooking(unit);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Back Link */}
      <button onClick={onBack} className="btn btn-glass btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Portfolio
      </button>

      {/* Hero Showcase Header */}
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '3rem', border: '1px solid var(--border-glass-gold)' }}>
        <div style={{ position: 'relative', height: '360px' }}>
          <img 
            src={apartment.images} 
            alt={apartment.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10, 14, 23, 0.95) 15%, transparent 70%)' }} />

          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              {apartment.apartmentId} &bull; {apartment.unitStatus}
            </span>
            <h1 style={{ fontSize: '2.4rem', color: '#ffffff', marginBottom: '0.4rem' }}>
              {apartment.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={18} color="var(--primary-gold)" />
              <span>{apartment.location}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>About Development</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {apartment.about}
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowFloorPlan(true)} className="btn btn-outline-gold">
                <FileText size={18} /> View Architectural Floor Plan
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(10, 14, 23, 0.6)' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Complex Specifications
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Stories:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{apartment.numOfFloors} Floors</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Swimming Pools:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{apartment.numOfSwimmingPool} Infinity Pools</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fitness Center:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{apartment.numOfGYM} Luxury Gym</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Available Units:</span>
                <strong style={{ color: 'var(--text-gold)' }}>{apartment.numOfUnitsAvilable} Units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price Range:</span>
                <strong style={{ color: '#34d399' }}>{apartment.priceRange}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Units Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Available Units in {apartment.name}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Select a suite unit below to calculate down payment and reserve online.
        </p>
      </div>

      <div className="grid-3">
        {apartmentUnits.map((unit) => (
          <UnitCard 
            key={unit.unitId} 
            unit={unit} 
            onBookUnit={handleBookUnit} 
            isStaff={isStaff}
            onUpdateStatus={updateUnitStatus}
          />
        ))}
      </div>

      {apartmentUnits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p>No units currently listed for this building complex.</p>
        </div>
      )}

      {/* Floor Plan Modal */}
      {showFloorPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowFloorPlan(false)} className="btn btn-sm btn-glass" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              Close
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Architectural Floor Plan Blueprint</h3>
            <img src={apartment.floorPlan} alt="Floor Plan" style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedUnitForBooking && (
        <BookingModal 
          unit={selectedUnitForBooking} 
          onClose={() => setSelectedUnitForBooking(null)} 
          onSuccess={() => setActivePage('customer-dashboard')}
        />
      )}
    </div>
  );
};

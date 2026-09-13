import React from 'react';
import { MapPin, Layers, Waves, Dumbbell, ArrowRight, ShieldCheck } from 'lucide-react';

export const ApartmentCard = ({ apartment, onViewDetails }) => {
  return (
    <div className="glass-card-interactive animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image Banner */}
      <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
        <img
          src={apartment.images || '/images/luxury-villa-hero.jpg'}
          alt={apartment.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(10, 14, 23, 0.75)', backdropFilter: 'blur(10px)',
          padding: '0.35rem 0.85rem', borderRadius: '999px',
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-gold)',
          border: '1px solid var(--glass-border-gold)'
        }}>
          {apartment.numOfUnitsAvilable} Units Available
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px',
          background: 'linear-gradient(to top, rgba(10, 14, 23, 0.9), transparent)'
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            {apartment.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <MapPin size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {apartment.location}
            </span>
          </div>
        </div>

        <p style={{
          fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.4rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6'
        }}>
          {apartment.about}
        </p>

        {/* Amenities */}
        <div style={{
          display: 'flex', gap: '1.25rem', marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.03)', padding: '0.7rem 1rem',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
          fontSize: '0.82rem', color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={14} color="var(--accent-cyan)" />
            <span>{apartment.numOfFloors} Floors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Waves size={14} color="var(--accent-cyan)" />
            <span>{apartment.numOfSwimmingPool} Pool{apartment.numOfSwimmingPool !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Dumbbell size={14} color="var(--accent-cyan)" />
            <span>{apartment.numOfGYM} Gym{apartment.numOfGYM !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1.1rem'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Starting From</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              {apartment.priceRange}
            </span>
          </div>
          <button onClick={() => onViewDetails(apartment)} className="btn btn-gold btn-sm">
            Explore Units <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

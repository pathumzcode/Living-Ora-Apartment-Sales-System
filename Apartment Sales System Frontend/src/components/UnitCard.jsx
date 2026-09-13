import React from 'react';
import { Bed, Bath, Wind, ArrowUpRight, MapPin } from 'lucide-react';

export const UnitCard = ({ unit, onBookUnit, isStaff, onUpdateStatus }) => {
  const statusColor = {
    Available: { bg: 'rgba(74,173,124,0.13)', color: '#4aad7c', border: 'rgba(74,173,124,0.3)' },
    Reserved:  { bg: 'rgba(91,184,196,0.13)', color: '#5bb8c4', border: 'rgba(91,184,196,0.3)' },
    Sold:      { bg: 'rgba(224,90,90,0.13)',  color: '#e05a5a', border: 'rgba(224,90,90,0.3)' },
  }[unit.avilability] || { bg: 'rgba(201,169,110,0.13)', color: '#c9a96e', border: 'rgba(201,169,110,0.3)' };

  return (
    <div className="glass-card-interactive animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
        <img
          src={unit.images || '/images/luxury-interior-lounge.jpg'}
          alt={unit.unitId}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
            background: statusColor.bg, color: statusColor.color, border: `1px solid ${statusColor.border}`
          }}>
            {unit.avilability}
          </span>
        </div>
        <div style={{
          position: 'absolute', bottom: '10px', right: '12px',
          background: 'rgba(10,14,23,0.85)', padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-xs)', fontSize: '0.78rem', color: 'var(--text-secondary)',
          border: '1px solid var(--glass-border)'
        }}>
          Floor {unit.floor}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Unit {unit.unitId}</h4>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <MapPin size={12} color="var(--accent-gold)" />{unit.location}
            </span>
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
            ${unit.unitPrice?.toLocaleString()}
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.55' }}>
          {unit.about}
        </p>

        {/* Specs */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem',
          background: 'rgba(255,255,255,0.03)', padding: '0.7rem 0.5rem',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textAlign: 'center'
        }}>
          {[
            { icon: <Bed size={13} color="var(--accent-gold)" />, label: 'Beds', value: unit.numOfBeds },
            { icon: <Bath size={13} color="var(--accent-gold)" />, label: 'Baths', value: unit.numOfBathRooms },
            { icon: <Wind size={13} color="var(--accent-cyan)" />, label: 'Climate', value: unit.acOrNonAC },
          ].map(({ icon, label, value }) => (
            <div key={label}>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>{label}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem' }}>
                {icon} {value}
              </span>
            </div>
          ))}
        </div>

        {/* Action */}
        <div style={{ marginTop: 'auto' }}>
          {unit.avilability === 'Available' ? (
            <button onClick={() => onBookUnit(unit)} className="btn btn-gold" style={{ width: '100%' }}>
              Book This Unit <ArrowUpRight size={16} />
            </button>
          ) : (
            <button disabled className="btn btn-glass" style={{ width: '100%', opacity: 0.55, cursor: 'not-allowed' }}>
              Unit {unit.avilability}
            </button>
          )}
          {isStaff && onUpdateStatus && unit.avilability !== 'Sold' && (
            <button
              onClick={() => onUpdateStatus(unit.unitId, unit.avilability === 'Available' ? 'Reserved' : 'Available')}
              className="btn btn-glass btn-sm"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Mark as {unit.avilability === 'Available' ? 'Reserved' : 'Available'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

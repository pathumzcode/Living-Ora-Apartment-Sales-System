import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ApartmentCard } from '../components/ApartmentCard';
import { UnitCard } from '../components/UnitCard';
import { BookingModal } from '../components/BookingModal';
import { Filter, SlidersHorizontal, Search, RefreshCw, Building2 } from 'lucide-react';

export const ApartmentsPage = ({ setSelectedApartment, setActivePage, initialTab = 'complexes' }) => {
  const { apartments, units, updateUnitStatus } = useStore();
  const { role } = useAuth();
  const isStaff = role === 'INTERNAL_STAFF';

  const [activeTab, setActiveTab] = useState(initialTab); // 'complexes' | 'units'
  const [searchFilter, setSearchFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [climateFilter, setClimateFilter] = useState('All');
  const [roomsFilter, setRoomsFilter] = useState('All');
  const [bookingTargetUnit, setBookingTargetUnit] = useState(null);

  // Filter logic for units
  const filteredUnits = units.filter((u) => {
    const matchesSearch = u.unitId.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          u.location.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesAvailability = availabilityFilter === 'All' || u.avilability === availabilityFilter;
    const matchesClimate = climateFilter === 'All' || u.acOrNonAC === climateFilter;
    const matchesRooms = roomsFilter === 'All' || u.numOfRooms === Number(roomsFilter);

    return matchesSearch && matchesAvailability && matchesClimate && matchesRooms;
  });

  const handleSelectApartment = (apt) => {
    setSelectedApartment(apt);
    setActivePage('apartment-detail');
  };

  const handleBookUnit = (unit) => {
    if (role !== 'CUSTOMER') {
      setActivePage('auth');
      return;
    }
    setBookingTargetUnit(unit);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Residences & Units</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Living-Ora Property Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Explore luxury apartment developments and individual suite units currently open for investment and immediate reservation.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('complexes')}
            className={`btn btn-sm ${activeTab === 'complexes' ? 'btn-gold' : 'btn-glass'}`}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            <Building2 size={16} /> Apartment Complexes ({apartments.length})
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`btn btn-sm ${activeTab === 'units' ? 'btn-gold' : 'btn-glass'}`}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            <SlidersHorizontal size={16} /> Individual Units ({units.length})
          </button>
        </div>
      </div>

      {activeTab === 'complexes' ? (
        /* Complexes Grid */
        <div className="grid-3">
          {apartments.map((apt) => (
            <ApartmentCard 
              key={apt.apartmentId} 
              apartment={apt} 
              onViewDetails={handleSelectApartment} 
            />
          ))}
        </div>
      ) : (
        /* Units Catalog with Filter Drawer */
        <div>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--border-glass-gold)' }}>
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(10, 14, 23, 0.6)', padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <Search size={16} color="var(--primary-gold)" />
              <input 
                type="text" 
                placeholder="Filter by unit code or floor..." 
                value={searchFilter} 
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select 
                value={availabilityFilter} 
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
              >
                <option value="All" style={{ background: '#0f172a' }}>All Statuses</option>
                <option value="Available" style={{ background: '#0f172a' }}>Available Only</option>
                <option value="Reserved" style={{ background: '#0f172a' }}>Reserved</option>
                <option value="Sold" style={{ background: '#0f172a' }}>Sold</option>
              </select>

              <select 
                value={climateFilter} 
                onChange={(e) => setClimateFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
              >
                <option value="All" style={{ background: '#0f172a' }}>All Climate Control</option>
                <option value="AC" style={{ background: '#0f172a' }}>Full Air Conditioned</option>
                <option value="Non-AC" style={{ background: '#0f172a' }}>Non-AC</option>
              </select>

              <select 
                value={roomsFilter} 
                onChange={(e) => setRoomsFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
              >
                <option value="All" style={{ background: '#0f172a' }}>All Bedrooms</option>
                <option value="1" style={{ background: '#0f172a' }}>1 Bedroom Studio</option>
                <option value="2" style={{ background: '#0f172a' }}>2 Bedrooms</option>
                <option value="3" style={{ background: '#0f172a' }}>3 Bedrooms</option>
                <option value="4" style={{ background: '#0f172a' }}>4 Bedrooms Penthouse</option>
              </select>

              <button 
                onClick={() => { setSearchFilter(''); setAvailabilityFilter('All'); setClimateFilter('All'); setRoomsFilter('All'); }} 
                className="btn btn-glass btn-sm"
                title="Reset Filters"
              >
                <RefreshCw size={15} /> Reset
              </button>
            </div>
          </div>

          {/* Units Grid */}
          <div className="grid-3">
            {filteredUnits.map((unit) => (
              <UnitCard 
                key={unit.unitId} 
                unit={unit} 
                onBookUnit={handleBookUnit} 
                isStaff={isStaff}
                onUpdateStatus={updateUnitStatus}
              />
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem' }}>No units match your selected filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingTargetUnit && (
        <BookingModal 
          unit={bookingTargetUnit} 
          onClose={() => setBookingTargetUnit(null)} 
          onSuccess={() => setActivePage('customer-dashboard')}
        />
      )}
    </div>
  );
};

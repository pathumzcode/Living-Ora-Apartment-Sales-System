import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import type { Apartment, PageId } from '../types';
import { ApartmentCard } from '../components/ApartmentCard';
import { Building2, Search, Filter } from 'lucide-react';

interface ApartmentsPageProps {
  setActivePage: (page: PageId) => void;
  setSelectedApartment: (apt: Apartment) => void;
}

type StatusFilter = 'All' | 'Available' | 'Reserved' | 'Sold';

export const ApartmentsPage: React.FC<ApartmentsPageProps> = ({ setActivePage, setSelectedApartment }) => {
  const { apartments } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return apartments.filter(apt => {
      const matchSearch = !q || apt.name.toLowerCase().includes(q) || apt.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || apt.unitStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [apartments, query, statusFilter]);

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-gold-500 text-[0.82rem] font-semibold uppercase tracking-[0.2em] mb-2 block">Portfolio</span>
            <h1 className="font-heading text-4xl font-black text-slate-100 flex items-center gap-3">
              <Building2 size={36} className="text-gold-500" />
              Apartment Complexes
            </h1>
            <p className="text-slate-400 mt-2">{apartments.length} developments · {apartments.reduce((s, a) => s + a.numOfUnitsAvilable, 0)} units available</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search by name or location..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={17} className="text-slate-400" />
            {(['All', 'Available', 'Reserved', 'Sold'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-gold' : 'btn-glass'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 size={50} className="text-slate-600 mb-4" />
            <p className="text-lg font-semibold">No developments match your search</p>
            <button className="btn btn-glass mt-4" onClick={() => { setQuery(''); setStatusFilter('All'); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(apt => (
              <ApartmentCard
                key={apt.apartmentId}
                apartment={apt}
                onViewDetails={apt => { setSelectedApartment(apt); setActivePage('apartment-detail'); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

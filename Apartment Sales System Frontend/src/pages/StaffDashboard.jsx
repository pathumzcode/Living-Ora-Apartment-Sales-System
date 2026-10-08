import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  FileText, 
  TrendingUp, 
  Layers, 
  AlertCircle,
  Clock
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const { apartments, units, bookings, updateBookingStatus, updateUnitStatus, addApartment, addUnit } = useStore();

  const roleDetails = {
    SALES_MANAGER: { title: 'Sales Manager Dashboard', focus: 'Sales pipeline, reservations and available inventory' },
    MARKETING_MANAGER: { title: 'Marketing Manager Dashboard', focus: 'Property availability and campaign-ready inventory' },
    CUSTOMER_RELATIONS_OFFICER: { title: 'Customer Relations Dashboard', focus: 'Customer reservations and service follow-up' },
    FINANCE_PAYMENTS_OFFICER: { title: 'Finance & Payments Dashboard', focus: 'Reservation and payment verification work' },
    PROPERTY_DEVELOPMENT_MANAGER: { title: 'Property Development Dashboard', focus: 'Apartment developments and unit inventory' },
    OPERATIONS_DIRECTOR: { title: 'Operations Director Dashboard', focus: 'Operational reservations and inventory overview' }
  };
  const currentRole = roleDetails[user?.role] || { title: 'Internal Staff Dashboard', focus: 'Living-Ora operational workspace' };

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'units' | 'add-apt'
  const [showAddAptModal, setShowAddAptModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // New Apt Form
  const [aptForm, setAptForm] = useState({
    name: '',
    location: '',
    numOfRoom: 50,
    numOfFloors: 15,
    numOfSwimmingPool: 1,
    numOfGYM: 1,
    images: '/images/living-ora-hero.svg',
    about: '',
    floorPlan: '/images/living-ora-interior.svg',
    numOfUnitsAvailable: 10,
    priceRange: '$200,000 - $600,000',
    unitStatus: 'Available'
  });

  // New Unit Form
  const [unitForm, setUnitForm] = useState({
    apartmentId: apartments[0]?.apartmentId || 'APT-ORA-01',
    unitPrice: 320000,
    floor: 8,
    location: '8th Floor',
    availability: 'Available',
    furnitures: 'Fully Furnished',
    numOfBathRooms: 2,
    numOfRooms: 2,
    numOfBeds: 2,
    acOrNonAC: 'AC',
    recommendedPerson: 'Executives',
    about: 'Luxury modern suite.',
    images: '/images/living-ora-marina.svg'
  });

  // Metrics
  const totalRevenue = bookings
    .filter(b => b.status === 'Approved')
    .reduce((sum, b) => sum + (b.paymentAmount || 0), 0);

  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending Approval').length;
  const availableUnitsCount = units.filter(u => u.avilability === 'Available').length;

  const handleCreateApartment = (e) => {
    e.preventDefault();
    addApartment(aptForm);
    setShowAddAptModal(false);
  };

  const handleCreateUnit = (e) => {
    e.preventDefault();
    addUnit({ ...unitForm, unitPrice: Number(unitForm.unitPrice) });
    setShowAddUnitModal(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Staff Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img 
            src={user?.profilePicture} 
            alt={user?.firstName} 
            style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-gold)' }} 
          />
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>{currentRole.title}</span>
            <h1 style={{ fontSize: '1.8rem' }}>Welcome, {user?.firstName} {user?.lastName}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Employee ID: {user?.empId} &bull; {currentRole.focus}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-glass btn-sm">Sign out</button>
          <button onClick={() => setShowAddAptModal(true)} className="btn btn-gold btn-sm">
            <PlusCircle size={15} /> Add Complex
          </button>
          <button onClick={() => setShowAddUnitModal(true)} className="btn btn-outline-gold btn-sm">
            <PlusCircle size={15} /> Add Suite Unit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Confirmed Sales Revenue
          </span>
          <strong style={{ fontSize: '1.8rem', color: '#34d399' }}>
            ${totalRevenue.toLocaleString()}
          </strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Pending Verification Queue
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--text-gold)' }}>
            {pendingBookingsCount} Requests
          </strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Available Units Stock
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>
            {availableUnitsCount} / {units.length} Units
          </strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Active Developments
          </span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            {apartments.length} Buildings
          </strong>
        </div>
      </div>

      {/* Main Command Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('bookings')} 
          className={`btn ${activeTab === 'bookings' ? 'btn-gold' : 'btn-glass'}`}
        >
          <Clock size={16} /> Booking Verifications ({bookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('units')} 
          className={`btn ${activeTab === 'units' ? 'btn-gold' : 'btn-glass'}`}
        >
          <Layers size={16} /> Unit Stock Inventory ({units.length})
        </button>
      </div>

      {activeTab === 'bookings' ? (
        /* Booking Approval List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((b) => (
            <div key={b.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-gold">{b.bookingId}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.bookingDate}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{b.unitLocation || `Unit ${b.unitId}`}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Client: <strong>{b.userName}</strong> ({b.userEmail}) &bull; Payment Method: <strong>{b.paymentMethod}</strong>
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileText size={14} /> Wire Receipt: {b.paymentProof}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Down Payment Received</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                    ${b.downPayment?.toLocaleString()}
                  </span>
                </div>

                {b.status === 'Pending Approval' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => updateBookingStatus(b.bookingId, 'Approved')} 
                      className="btn btn-sm" 
                      style={{ background: '#10b981', color: '#ffffff' }}
                    >
                      <CheckCircle2 size={15} /> Approve & Reserve
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(b.bookingId, 'Rejected')} 
                      className="btn btn-sm" 
                      style={{ background: '#ef4444', color: '#ffffff' }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                ) : (
                  <span className="badge badge-available">{b.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Inventory Table */
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Unit ID</th>
                <th style={{ padding: '0.75rem' }}>Apartment</th>
                <th style={{ padding: '0.75rem' }}>Price</th>
                <th style={{ padding: '0.75rem' }}>Floor</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.unitId} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-gold)' }}>{u.unitId}</td>
                  <td style={{ padding: '0.75rem' }}>{u.location}</td>
                  <td style={{ padding: '0.75rem' }}>${u.unitPrice.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem' }}>Floor {u.floor}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-gold">{u.avilability}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select 
                      value={u.avilability} 
                      onChange={(e) => updateUnitStatus(u.unitId, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="Available" style={{ background: '#0f172a' }}>Available</option>
                      <option value="Reserved" style={{ background: '#0f172a' }}>Reserved</option>
                      <option value="Sold" style={{ background: '#0f172a' }}>Sold</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Apartment Modal */}
      {showAddAptModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleCreateApartment} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Create New Apartment Complex</h3>
            <div className="form-group">
              <label className="form-label">Complex Name</label>
              <input type="text" required value={aptForm.name} onChange={(e) => setAptForm({ ...aptForm, name: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Location Address</label>
              <input type="text" required value={aptForm.location} onChange={(e) => setAptForm({ ...aptForm, location: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Price Range Description</label>
              <input type="text" value={aptForm.priceRange} onChange={(e) => setAptForm({ ...aptForm, priceRange: e.target.value })} className="form-input" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowAddAptModal(false)} className="btn btn-glass">Cancel</button>
              <button type="submit" className="btn btn-gold">Save Apartment</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleCreateUnit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Add Suite Unit Stock</h3>
            <div className="form-group">
              <label className="form-label">Unit Price ($ USD)</label>
              <input type="number" required value={unitForm.unitPrice} onChange={(e) => setUnitForm({ ...unitForm, unitPrice: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Floor Number</label>
              <input type="number" required value={unitForm.floor} onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })} className="form-input" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowAddUnitModal(false)} className="btn btn-glass">Cancel</button>
              <button type="submit" className="btn btn-gold">Create Unit Stock</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

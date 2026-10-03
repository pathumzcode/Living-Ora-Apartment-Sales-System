import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { schedulesApi } from '../services/api';
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
  Clock,
  Tag,
  Pencil,
  Trash2,
  Power,
  Calendar,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const { 
    apartments, 
    units, 
    bookings, 
    promotions,
    updateBookingStatus, 
    updateUnitStatus, 
    addApartment, 
    deleteApartment,
    addUnit,
    deleteUnit,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus
  } = useStore();

  const roleDetails = {
    SALES_MANAGER: { title: 'Sales Manager Control Center', focus: 'Manage promotions, sales pipeline, inventory & payment schedules' },
    MARKETING_MANAGER: { title: 'Marketing Manager Dashboard', focus: 'Property availability and promotional campaign management' },
    CUSTOMER_RELATIONS_OFFICER: { title: 'Customer Relations Dashboard', focus: 'Customer reservations, verification and service follow-up' },
    FINANCE_PAYMENTS_OFFICER: { title: 'Finance & Payments Dashboard', focus: 'Reservation payment verification & schedule generation' },
    PROPERTY_DEVELOPMENT_MANAGER: { title: 'Property Development Dashboard', focus: 'Apartment development projects and unit inventory' },
    OPERATIONS_DIRECTOR: { title: 'Operations Director Command Center', focus: 'Full operational control across apartments, units, promotions & schedules' }
  };
  const currentRole = roleDetails[user?.role] || { title: 'Internal Staff Dashboard', focus: 'Living-Ora operational workspace' };
  const isManager = ['SALES_MANAGER', 'OPERATIONS_DIRECTOR', 'ADMIN'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('promotions'); // 'promotions' | 'bookings' | 'units' | 'apartments' | 'schedules'

  // Modals & Editing states
  const [showAptModal, setShowAptModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null);

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  // Schedules state
  const [schedulesList, setSchedulesList] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const res = await schedulesApi.getAll();
      if (Array.isArray(res)) {
        setSchedulesList(res);
      }
    } catch (e) {
      console.warn('Could not fetch schedules:', e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleGenerateSchedule = async (bookingId) => {
    try {
      await schedulesApi.generate(bookingId);
      alert('Payment Schedule generated successfully!');
      fetchSchedules();
    } catch (err) {
      alert('Failed to generate schedule: ' + err.message);
    }
  };

  const handleConfirmSchedule = async (scheduleId) => {
    try {
      await schedulesApi.confirm(scheduleId);
      alert('Payment Schedule confirmed!');
      fetchSchedules();
    } catch (err) {
      alert('Failed to confirm schedule: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this payment schedule?')) return;
    try {
      await schedulesApi.delete(scheduleId);
      alert('Schedule deleted!');
      fetchSchedules();
    } catch (err) {
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  // Apartment Form State
  const initialAptForm = {
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
  };
  const [aptForm, setAptForm] = useState(initialAptForm);

  // Unit Form State
  const initialUnitForm = {
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
  };
  const [unitForm, setUnitForm] = useState(initialUnitForm);

  // Promotion Form State (Full DB columns)
      const initialPromoForm = {
      promotionType: 'Discount Code',
      promotionTitle: '',
      about: '',
      eligibilityCriteria: '',
      assinedApartment: '',
      campaignPerformance: 'N/A',
      promotionCode: '',
      discountPrecentage: 0,
      startDate: '',
      endDate: '',
      buttonText: '',
      validityPeriod: '',
      bannerImage: '',
      status: 'ACTIVE'
    };
  const [promoForm, setPromoForm] = useState(initialPromoForm);

  // Submit Apartment
  const handleSaveApartment = (e) => {
    e.preventDefault();
    addApartment(aptForm);
    setShowAptModal(false);
    setAptForm(initialAptForm);
  };

  // Submit Unit
  const handleSaveUnit = (e) => {
    e.preventDefault();
    addUnit({ ...unitForm, unitPrice: Number(unitForm.unitPrice) });
    setShowUnitModal(false);
    setUnitForm(initialUnitForm);
  };    // Submit Promotion
    const handleSavePromotion = async (e) => {
      e.preventDefault();
      
      if (!editingPromo) {
        const existing = promotions.find(p => p.promotionCode === promoForm.promotionCode);
        if (existing) {
          alert('Promotion code already exists.');
          return;
        }
      }

      const payload = { ...promoForm, discountPrecentage: Number(promoForm.discountPrecentage) };
    if (editingPromo) {
      await updatePromotion(editingPromo.promotionId, payload);
    } else {
      await addPromotion(payload);
    }
    setShowPromoModal(false);
    setEditingPromo(null);
    setPromoForm(initialPromoForm);
  };

  const handleEditPromoClick = (promo) => {
    setEditingPromo(promo);
    setPromoForm(promo);
    setShowPromoModal(true);
  };

  const handleDeletePromoClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion from database?')) {
      await deletePromotion(id);
    }
  };

  const handleTogglePromoClick = async (id) => {
    await togglePromotionStatus(id);
  };

  // Helper for computing Promo Status
  const getPromoStatus = (promo) => {
    if (promo.status === 'INACTIVE') return 'INACTIVE';
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (today < start) return 'SCHEDULED';
    if (today > end) return 'EXPIRED';
    return 'ACTIVE';
  };

  // KPIs
  const totalRevenue = bookings
    .filter(b => b.status === 'Approved')
    .reduce((sum, b) => sum + (b.paymentAmount || 0), 0);
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending Approval').length;
  const availableUnitsCount = units.filter(u => u.avilability === 'Available').length;

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img 
            src={user?.profilePicture || '/images/living-ora-hero.svg'} 
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
          
          <button onClick={() => { setEditingPromo(null); setPromoForm(initialPromoForm); setShowPromoModal(true); }} className="btn btn-gold btn-sm">
            <PlusCircle size={15} /> Create Promotion
          </button>
          <button onClick={() => setShowAptModal(true)} className="btn btn-outline-gold btn-sm">
            <PlusCircle size={15} /> Create Complex
          </button>
          <button onClick={() => setShowUnitModal(true)} className="btn btn-outline-gold btn-sm">
            <PlusCircle size={15} /> Create Unit Stock
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Confirmed Sales
          </span>
          <strong style={{ fontSize: '1.6rem', color: '#34d399' }}>${totalRevenue.toLocaleString()}</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Pending Verification
          </span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text-gold)' }}>{pendingBookingsCount} Requests</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Available Units
          </span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--accent-cyan)' }}>{availableUnitsCount} / {units.length}</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Promotions Count
          </span>
          <strong style={{ fontSize: '1.6rem', color: '#f59e0b' }}>{promotions.length} Campaigns</strong>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Active Complex Buildings
          </span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{apartments.length} Buildings</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('promotions')} 
          className={`btn ${activeTab === 'promotions' ? 'btn-gold' : 'btn-glass'}`}
        >
          <Tag size={16} /> Promotions Control ({promotions.length})
        </button>

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
          <Layers size={16} /> Unit Stock ({units.length})
        </button>

        <button 
          onClick={() => setActiveTab('apartments')} 
          className={`btn ${activeTab === 'apartments' ? 'btn-gold' : 'btn-glass'}`}
        >
          <Building2 size={16} /> Apartment Complexes ({apartments.length})
        </button>

        <button 
          onClick={() => { setActiveTab('schedules'); fetchSchedules(); }} 
          className={`btn ${activeTab === 'schedules' ? 'btn-gold' : 'btn-glass'}`}
        >
          <Calendar size={16} /> Payment Schedules
        </button>
      </div>

      {/* TAB 1: PROMOTIONS CONTROL CENTER */}
      {activeTab === 'promotions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Promotional Campaigns & Discounts</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Create, edit, activate, deactivate and schedule promotional codes.
              </p>
            </div>
            <button onClick={() => { setEditingPromo(null); setPromoForm(initialPromoForm); setShowPromoModal(true); }} className="btn btn-gold">
              <PlusCircle size={16} /> Add New Promotion
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {promotions.map((promo) => {
              const status = getPromoStatus(promo);
              let statusBadgeColor = 'var(--text-muted)';
              if (status === 'ACTIVE') statusBadgeColor = '#10b981';
              if (status === 'INACTIVE') statusBadgeColor = '#ef4444';
              if (status === 'SCHEDULED') statusBadgeColor = '#f59e0b';
              if (status === 'EXPIRED') statusBadgeColor = '#6b7280';

              return (
                <div key={promo.promotionId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-glass-gold)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-gold"><Sparkles size={12} /> {promo.promotionType}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: statusBadgeColor, border: `1px solid ${statusBadgeColor}`, padding: '2px 8px', borderRadius: '12px' }}>
                        {status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{promo.promotionTitle}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                      {promo.about}
                    </p>

                    <div style={{ background: 'rgba(10,14,23,0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px dashed var(--primary-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROMO CODE:</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-gold)', letterSpacing: '0.05em' }}>{promo.promotionCode}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Discount:</span>
                        <strong style={{ color: '#34d399' }}>{promo.discountPrecentage}% OFF</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span>Start Date: <strong style={{ color: 'var(--text-secondary)' }}>{promo.startDate}</strong></span>
                      <span>End Date: <strong style={{ color: 'var(--text-secondary)' }}>{promo.endDate}</strong></span>
                      <span>Eligibility: <strong style={{ color: 'var(--text-secondary)' }}>{promo.eligibilityCriteria}</strong></span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                    <button 
                      onClick={() => handleTogglePromoClick(promo.promotionId)} 
                      className="btn btn-sm btn-glass"
                      style={{ flex: 1 }}
                    >
                      <Power size={14} /> {promo.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                    </button>
                    
                    <button 
                      onClick={() => handleEditPromoClick(promo)} 
                      className="btn btn-sm btn-glass"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button 
                      onClick={() => handleDeletePromoClick(promo.promotionId)} 
                      className="btn btn-sm"
                      style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS */}
      {activeTab === 'bookings' && (
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
                  Client: <strong>{b.userName}</strong> ({b.userEmail}) &bull; Method: <strong>{b.paymentMethod}</strong>
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
                  Wire Receipt: {b.paymentProof}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Down Payment</span>
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
      )}

      {/* TAB 3: UNITS */}
      {activeTab === 'units' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Unit Stock Inventory</h3>
            <button onClick={() => setShowUnitModal(true)} className="btn btn-gold btn-sm"><PlusCircle size={15} /> Add Unit</button>
          </div>
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
                  <td style={{ padding: '0.75rem' }}>${u.unitPrice?.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem' }}>Floor {u.floor}</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-gold">{u.avilability}</span></td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
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
                    <button onClick={() => deleteUnit(u.unitId)} className="btn btn-sm btn-glass" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: APARTMENTS */}
      {activeTab === 'apartments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Apartment Complex Buildings</h3>
            <button onClick={() => setShowAptModal(true)} className="btn btn-gold btn-sm"><PlusCircle size={15} /> Add Complex</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {apartments.map((apt) => (
              <div key={apt.apartmentId || apt.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-gold)', marginBottom: '0.4rem' }}>{apt.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>{apt.location}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <span>Price Range: <strong>{apt.priceRange}</strong></span><br />
                  <span>Floors: <strong>{apt.numOfFloors}</strong> | Available Units: <strong>{apt.numOfUnitsAvilable}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => deleteApartment(apt.apartmentId || apt.id)} className="btn btn-sm btn-glass" style={{ color: 'var(--error)' }}><Trash2 size={14} /> Delete Complex</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>Payment Schedules</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generated installment schedules for approved reservations.</p>
            </div>
            <button onClick={fetchSchedules} className="btn btn-glass btn-sm"><RefreshCw size={14} /> Refresh</button>
          </div>

          {loadingSchedules ? (
            <p>Loading schedules...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Schedule ID</th>
                    <th style={{ padding: '0.75rem' }}>Booking ID</th>
                    <th style={{ padding: '0.75rem' }}>Total Amount</th>
                    <th style={{ padding: '0.75rem' }}>Monthly Installment</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedulesList.length ? schedulesList.map((sch) => (
                    <tr key={sch.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-gold)' }}>SCH-{sch.id}</td>
                      <td style={{ padding: '0.75rem' }}>{sch.bookingId}</td>
                      <td style={{ padding: '0.75rem' }}>${sch.totalAmount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>${sch.monthlyAmount?.toLocaleString()}/mo</td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-gold">{sch.status}</span></td>
                      <td style={{ padding: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleConfirmSchedule(sch.id)} className="btn btn-sm btn-gold">Confirm</button>
                        <button onClick={() => handleDeleteSchedule(sch.id)} className="btn btn-sm btn-glass" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No payment schedules created yet. You can generate a schedule directly from approved bookings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PROMOTION CREATE/EDIT MODAL */}
      {showPromoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleSavePromotion} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', border: '1px solid var(--border-glass-gold)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              {editingPromo ? 'Edit Promotional Campaign' : 'Create New Promotional Campaign'}
            </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Promotion Title</label>
                  <input type="text" required value={promoForm.promotionTitle || ''} onChange={(e) => setPromoForm({ ...promoForm, promotionTitle: e.target.value })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Type</label>
                  <select value={promoForm.promotionType || 'Discount Code'} onChange={(e) => setPromoForm({ ...promoForm, promotionType: e.target.value })} className="form-select">
                    <option value="Discount Code">Discount Code</option>
                    <option value="Furnishing Package">Furnishing Package</option>
                    <option value="Cashback">Cashback Special</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Promotion Code</label>
                  <input type="text" required disabled={!!editingPromo} value={promoForm.promotionCode || ''} onChange={(e) => setPromoForm({ ...promoForm, promotionCode: e.target.value.toUpperCase() })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Discount %</label>
                  <input type="number" step="0.01" min="0" max="100" required value={promoForm.discountPrecentage || ''} onChange={(e) => setPromoForm({ ...promoForm, discountPrecentage: e.target.value })} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input type="date" required value={promoForm.startDate || ''} onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Date</label>
                  <input type="date" required value={promoForm.endDate || ''} onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })} className="form-input" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea rows={3} required value={promoForm.about || ''} onChange={(e) => setPromoForm({ ...promoForm, about: e.target.value })} className="form-textarea" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Eligibility Criteria</label>
                <input type="text" required value={promoForm.eligibilityCriteria || ''} onChange={(e) => setPromoForm({ ...promoForm, eligibilityCriteria: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Button Text</label>
                  <input type="text" value={promoForm.buttonText || ''} onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Validity Period</label>
                  <input type="text" value={promoForm.validityPeriod || ''} onChange={(e) => setPromoForm({ ...promoForm, validityPeriod: e.target.value })} className="form-input" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Banner Image URL</label>
                <input type="text" value={promoForm.bannerImage || ''} onChange={(e) => setPromoForm({ ...promoForm, bannerImage: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assigned Apartment</label>
                  <input type="text" value={promoForm.assinedApartment || ''} onChange={(e) => setPromoForm({ ...promoForm, assinedApartment: e.target.value })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select value={promoForm.status || 'ACTIVE'} onChange={(e) => setPromoForm({ ...promoForm, status: e.target.value })} className="form-select">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive (Draft)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowPromoModal(false)} className="btn btn-glass">Cancel</button>
              <button type="submit" className="btn btn-gold">{editingPromo ? 'Save Changes' : 'Publish Promotion'}</button>
            </div>
          </form>
        </div>
      )}

      {/* APARTMENT MODAL */}
      {showAptModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleSaveApartment} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
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
              <button type="button" onClick={() => setShowAptModal(false)} className="btn btn-glass">Cancel</button>
              <button type="submit" className="btn btn-gold">Save Apartment</button>
            </div>
          </form>
        </div>
      )}

      {/* UNIT MODAL */}
      {showUnitModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleSaveUnit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
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
              <button type="button" onClick={() => setShowUnitModal(false)} className="btn btn-glass">Cancel</button>
              <button type="submit" className="btn btn-gold">Create Unit Stock</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};



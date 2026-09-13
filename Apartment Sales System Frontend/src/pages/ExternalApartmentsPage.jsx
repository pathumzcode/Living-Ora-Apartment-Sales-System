import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, PlusCircle, MapPin, DollarSign, Bed, Wind, CheckCircle2 } from 'lucide-react';

export const ExternalApartmentsPage = () => {
  const { externalApartments, addExternalApartment } = useStore();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    location: '',
    about: '',
    numOfRooms: 2,
    price: 180000,
    downPayment: 18000,
    images: '/images/living-ora-hero.svg',
    acOrNonAC: 'AC',
    additionalInfo: 'Direct owner contact.'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    addExternalApartment({
      ...form,
      price: Number(form.price),
      downPayment: Number(form.downPayment),
      numOfRooms: Number(form.numOfRooms),
      registeredByUid: user.uid
    }).then(() => {
      setShowAddForm(false);
      setSuccess('Apartment listing saved successfully.');
    }).catch((err) => setError(err.message || 'Could not save the listing.'));
  };

  const canRegister = user?.role === 'SALES_AGENT';

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            <ExternalLink size={13} /> Marketplace Portal
          </span>
          <h1 style={{ fontSize: '2.5rem' }}>External Property Listings</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px' }}>
            Browse third-party partner listings and external condominium resales vetted by Living-Ora.
          </p>
        </div>

        {canRegister && <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-gold"><PlusCircle size={18} /> Post Property Listing</button>}
      </div>

      {!user && <div className="auth-error">Please sign in as a Sales Agent to register an apartment.</div>}
      {user && !canRegister && <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>You are browsing external apartment listings as a Customer. Only Sales Agents can post a listing.</div>}
      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="auth-success" style={{ marginBottom: '1rem' }}><CheckCircle2 size={18} /> {success}</div>}

      {/* Add Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Post External Apartment Listing</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Address</label>
              <input 
                type="text" 
                required 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                placeholder="e.g. 15 Temple Road, Colombo" 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Asking Price ($ USD)</label>
              <input 
                type="number" 
                required 
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: e.target.value })} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Down Payment Required ($ USD)</label>
              <input 
                type="number" 
                required 
                value={form.downPayment} 
                onChange={(e) => setForm({ ...form, downPayment: e.target.value })} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input 
                type="number" 
                value={form.numOfRooms} 
                onChange={(e) => setForm({ ...form, numOfRooms: e.target.value })} 
                className="form-input" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Features</label>
            <textarea 
              rows={3} 
              value={form.about} 
              onChange={(e) => setForm({ ...form, about: e.target.value })} 
              className="form-textarea" 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-glass">Cancel</button>
            <button type="submit" className="btn btn-gold">Publish Listing</button>
          </div>
        </form>
      )}

      {/* Grid of Listings */}
      <div className="grid-3">
        {externalApartments.map((ex) => (
          <div key={ex.exApartmentId} className="glass-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '200px' }}>
              <img src={ex.images} alt={ex.location} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <span className="badge badge-gold">{ex.exApartmentId}</span>
              </div>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <MapPin size={15} color="var(--primary-gold)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ex.location}</span>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                {ex.about}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-glass)', paddingTop: '0.9rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Asking Price</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                    ${ex.price?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Down Pay</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                    ${ex.downPayment?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

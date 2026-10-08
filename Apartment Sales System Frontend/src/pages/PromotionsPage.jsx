import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PromotionBanner } from '../components/PromotionBanner';
import { Tag, PlusCircle, Sparkles, Calendar, Percent } from 'lucide-react';

export const PromotionsPage = () => {
  const { promotions, addPromotion } = useStore();
  const { role } = useAuth();
  const isStaff = role === 'INTERNAL_STAFF';

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    promotionType: 'Discount Code',
    promotionTitle: '',
    about: '',
    eligibilityCriteria: 'Minimum 20% Down Payment',
    startDate: '2026-09-10',
    endDate: '2026-11-30',
    buttonText: 'Claim Offer',
    bannerImage: '/images/living-ora-marina.svg',
    validityPeriod: 'Limited Offer',
    discountPrecentage: 15.0,
    promotionCode: 'SAVE15NOW'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPromotion({
      ...form,
      discountPrecentage: Number(form.discountPrecentage)
    });
    setShowAddModal(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            <Tag size={13} /> Exclusive Offers
          </span>
          <h1 style={{ fontSize: '2.5rem' }}>Promotional Discounts & Campaigns</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px' }}>
            Claim active promo codes and special furnishing packages on Living-Ora suite reservations.
          </p>
        </div>

        {isStaff && (
          <button onClick={() => setShowAddModal(!showAddModal)} className="btn btn-gold">
            <PlusCircle size={18} /> Create New Promotion
          </button>
        )}
      </div>

      {/* Staff Promotion Creator */}
      {showAddModal && (
        <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Create Marketing Campaign</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Campaign Title</label>
              <input 
                type="text" 
                required 
                value={form.promotionTitle} 
                onChange={(e) => setForm({ ...form, promotionTitle: e.target.value })} 
                placeholder="e.g. Autumn Living Special" 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Promo Code</label>
              <input 
                type="text" 
                required 
                value={form.promotionCode} 
                onChange={(e) => setForm({ ...form, promotionCode: e.target.value.toUpperCase() })} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input 
                type="number" 
                value={form.discountPrecentage} 
                onChange={(e) => setForm({ ...form, discountPrecentage: e.target.value })} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Promotion Type</label>
              <select 
                value={form.promotionType} 
                onChange={(e) => setForm({ ...form, promotionType: e.target.value })}
                className="form-select"
              >
                <option value="Discount Code">Discount Code</option>
                <option value="Furnishing Package">Furnishing Package</option>
                <option value="Cashback">Cashback Special</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Campaign Description</label>
            <textarea 
              rows={3} 
              value={form.about} 
              onChange={(e) => setForm({ ...form, about: e.target.value })} 
              className="form-textarea" 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-glass">Cancel</button>
            <button type="submit" className="btn btn-gold">Publish Campaign</button>
          </div>
        </form>
      )}

      {/* List of Active Promotions */}
      <div>
        {promotions.map((promo) => (
          <PromotionBanner key={promo.promotionId} promotion={promo} />
        ))}
      </div>
    </div>
  );
};

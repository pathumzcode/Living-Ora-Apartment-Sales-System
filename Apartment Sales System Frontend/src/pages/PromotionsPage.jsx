import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PromotionBanner } from '../components/PromotionBanner';
import { Tag, PlusCircle, Sparkles, Calendar, Percent } from 'lucide-react';

export const PromotionsPage = () => {
  const { promotions, addPromotion, updatePromotion, deletePromotion, togglePromotionStatus } = useStore();
  const { role } = useAuth();
  
  const isManager = ['SALES_MANAGER', 'OPERATIONAL_MANAGER', 'OPERATIONS_DIRECTOR'].includes(role);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    promotionType: 'Discount Code',
    promotionTitle: '',
    about: '',
    eligibilityCriteria: 'Minimum 20% Down Payment',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    buttonText: 'Claim Offer',
    bannerImage: '/images/living-ora-marina.svg',
    validityPeriod: 'Limited Offer',
    discountPrecentage: 15.0,
    assinedApartment: 'All',
    campaignPerformance: 'N/A',
    promotionCode: 'SAVE15NOW'
  };

  const [form, setForm] = useState(initialForm);

  const handleEdit = (promo) => {
    setForm(promo);
    setEditingId(promo.promotionId);
    setShowAddModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this promotion?')) {
      await deletePromotion(id);
    }
  };

  const handleToggle = async (id) => {
    await togglePromotionStatus(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, discountPrecentage: Number(form.discountPrecentage) };
    if (editingId) {
      await updatePromotion(editingId, payload);
    } else {
      await addPromotion(payload);
    }
    setShowAddModal(false);
    setEditingId(null);
    setForm(initialForm);
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

        {isManager && (
          <button onClick={() => { setShowAddModal(!showAddModal); setEditingId(null); setForm(initialForm); }} className="btn btn-gold">
            <PlusCircle size={18} /> {showAddModal ? 'Cancel' : 'Create New Promotion'}
          </button>
        )}
      </div>

      {/* Staff Promotion Creator */}
      {showAddModal && isManager && (
        <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>{editingId ? 'Update Marketing Campaign' : 'Create Marketing Campaign'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Campaign Title</label>
              <input type="text" required value={form.promotionTitle} onChange={(e) => setForm({ ...form, promotionTitle: e.target.value })} placeholder="e.g. Autumn Living Special" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Promo Code</label>
              <input type="text" required value={form.promotionCode} onChange={(e) => setForm({ ...form, promotionCode: e.target.value.toUpperCase() })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input type="number" step="0.01" min="0" max="100" required value={form.discountPrecentage} onChange={(e) => setForm({ ...form, discountPrecentage: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Promotion Type</label>
              <select value={form.promotionType} onChange={(e) => setForm({ ...form, promotionType: e.target.value })} className="form-select">
                <option value="Discount Code">Discount Code</option>
                <option value="Furnishing Package">Furnishing Package</option>
                <option value="Cashback">Cashback Special</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Eligibility Criteria</label>
              <input type="text" required value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input type="text" value={form.bannerImage} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Validity Period Text</label>
              <input type="text" value={form.validityPeriod} onChange={(e) => setForm({ ...form, validityPeriod: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Apartment</label>
              <input type="text" value={form.assinedApartment} onChange={(e) => setForm({ ...form, assinedApartment: e.target.value })} className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Campaign Description</label>
            <textarea rows={3} required value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="form-textarea" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setShowAddModal(false); setEditingId(null); setForm(initialForm); }} className="btn btn-glass">Cancel</button>
            <button type="submit" className="btn btn-gold">{editingId ? 'Update Campaign' : 'Publish Campaign'}</button>
          </div>
        </form>
      )}

      {/* List of Active Promotions */}
      <div>
        {promotions.map((promo) => (
          <PromotionBanner 
            key={promo.promotionId} 
            promotion={promo} 
            isManager={isManager}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { X, Calculator, ShieldCheck, Upload, CheckCircle2, DollarSign } from 'lucide-react';

export const BookingModal = ({ unit, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createBooking } = useStore();

  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20%
  const [months, setMonths] = useState(36); // 36 months
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [additions, setAdditions] = useState('Standard Executive Finish');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const unitPrice = unit ? unit.unitPrice : 0;
  const downPaymentAmount = (unitPrice * downPaymentPercent) / 100;
  const remainingAmount = unitPrice - downPaymentAmount;
  const monthlyInstallment = remainingAmount / months;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBooking({
        uid: user?.uid || 'USR-EXT-5001',
        userName: `${user?.firstName || 'Client'} ${user?.lastName || ''}`,
        userEmail: user?.email || 'client@livingora.com',
        unitId: unit.unitId,
        unitLocation: unit.location,
        paymentAmount: unitPrice,
        downPayment: downPaymentAmount,
        paymentMethod,
        paymentProof: receiptFile ? receiptFile.name : `receipt_${unit.unitId}_downpayment.pdf`,
        additions,
        months,
        unitPrice
      });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setIsSubmitting(false);
      window.alert(err.message || 'Unable to submit this reservation.');
    }
  };

  if (!unit) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', border: '1px solid var(--border-glass-gold)' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {submittedSuccess ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Booking Reservation Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Your unit reservation for <strong>Unit {unit.unitId}</strong> has been logged in the Living-Ora Sales Engine. A sales officer will review your payment proof.
            </p>
            <span className="badge badge-gold">Status: Pending Verification</span>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Reserve Unit</span>
              <h2 style={{ fontSize: '1.6rem' }}>Unit Reservation & Payment Schedule</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Unit {unit.unitId} &bull; Floor {unit.floor} &bull; Total Price: <strong style={{ color: 'var(--text-gold)' }}>${unitPrice.toLocaleString()}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitBooking}>
              {/* Down Payment Calculator */}
              <div style={{ background: 'rgba(217, 119, 6, 0.06)', border: '1px solid var(--border-glass-gold)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                  <Calculator size={18} />
                  <span>Down Payment & Payment Plan Calculator</span>
                </div>

                {/* Percentage Selectors */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Select Down Payment Ratio:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[10, 20, 30, 50].map((pct) => (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => setDownPaymentPercent(pct)}
                        className={`btn btn-sm ${downPaymentPercent === pct ? 'btn-gold' : 'btn-glass'}`}
                        style={{ flex: 1 }}
                      >
                        {pct}% Down
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Box */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'rgba(10, 14, 23, 0.6)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Initial Down Payment</span>
                    <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>${downPaymentAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Installment Months</span>
                    <select 
                      value={months} 
                      onChange={(e) => setMonths(Number(e.target.value))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      <option value={12} style={{ background: '#0f172a' }}>12 Months</option>
                      <option value={24} style={{ background: '#0f172a' }}>24 Months</option>
                      <option value={36} style={{ background: '#0f172a' }}>36 Months</option>
                      <option value={48} style={{ background: '#0f172a' }}>48 Months</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Est. Monthly Pay</span>
                    <strong style={{ color: 'var(--text-gold)', fontSize: '1.1rem' }}>${Math.round(monthlyInstallment).toLocaleString()}/mo</strong>
                  </div>
                </div>
              </div>

              {/* Form Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>

                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${user?.firstName || 'Client'} ${user?.lastName || ''}`} 
                    className="form-input" 
                    style={{ opacity: 0.8 }} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    readOnly 
                    value={user?.email || 'client@livingora.com'} 
                    className="form-input" 
                    style={{ opacity: 0.8 }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="form-select"
                >
                  <option value="Bank Transfer">Direct Bank Wire / Swift Transfer</option>
                  <option value="Online Credit Card">Visa / Mastercard Online Payment</option>
                  <option value="Paypal / Stripe">Stripe Secure Portal</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Finishing & Custom Additions</label>
                <input 
                  type="text" 
                  value={additions} 
                  onChange={(e) => setAdditions(e.target.value)} 
                  placeholder="e.g. Smart Lighting Upgrade, Italian Kitchen Island" 
                  className="form-input" 
                />
              </div>

              {/* Upload Proof */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Upload Initial Transfer Receipt / Proof</label>
                <div style={{ border: '2px dashed var(--border-glass)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                  <Upload size={24} color="var(--primary-gold)" style={{ marginBottom: '0.4rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {receiptFile ? receiptFile.name : 'Click or drop payment wire receipt (PDF / PNG)'}
                  </p>
                  <input 
                    type="file" 
                    onChange={(e) => setReceiptFile(e.target.files[0])} 
                    style={{ display: 'none' }} 
                    id="receipt-upload" 
                  />
                  <label htmlFor="receipt-upload" className="btn btn-sm btn-glass" style={{ marginTop: '0.5rem' }}>
                    Browse File
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold" style={{ minWidth: '160px' }}>
                  {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

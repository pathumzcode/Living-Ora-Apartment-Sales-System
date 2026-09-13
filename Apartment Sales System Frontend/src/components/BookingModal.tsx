import React, { useState } from 'react';
import type { Unit, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, AlertTriangle, CreditCard, Building, Wallet } from 'lucide-react';

interface BookingModalProps {
  unit: Unit;
  apartmentName: string;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export const BookingModal: React.FC<BookingModalProps> = ({ unit, apartmentName, onClose }) => {
  const { createBooking } = useStore();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [additions, setAdditions] = useState('');
  const [months, setMonths] = useState(24);
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [proofNote, setProofNote] = useState('');
  const [error, setError] = useState('');

  const downPayment = Math.round(unit.unitPrice * 0.1);
  const remaining = unit.unitPrice - downPayment;

  const userName = user
    ? `${'firstName' in user ? user.firstName : ''} ${'lastName' in user ? user.lastName : ''}`
    : 'Guest Customer';
  const userEmail = user && 'email' in user ? user.email : 'guest@email.com';
  const uid = user && 'uid' in user ? user.uid : undefined;

  const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
    'Bank Transfer': Building,
    'Online Credit Card': CreditCard,
    'Paypal / Stripe': Wallet,
  };

  const handleConfirm = () => {
    if (step === 2 && !proofNote.trim()) {
      setError('Please enter a payment reference or proof of payment.');
      return;
    }
    setError('');

    createBooking({
      uid,
      userName: userName.trim(),
      userEmail,
      unitId: unit.unitId,
      unitLocation: `${apartmentName} – ${unit.location}`,
      paymentAmount: unit.unitPrice,
      downPayment,
      paymentMethod: method,
      paymentProof: proofNote,
      additions,
      months,
      unitPrice: unit.unitPrice,
    });

    setStep(3);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-panel w-full max-w-xl animate-fade-in relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.18) 0%, transparent 100%)' }}>
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-100">
              {step < 3 ? 'Reserve Your Unit' : 'Booking Submitted!'}
            </h2>
            <p className="text-[0.82rem] text-slate-400 mt-0.5">
              {step < 3 ? `Step ${step} of 2 · ${unit.unitId}` : 'Awaiting Staff Approval'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-glass btn-sm">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* Unit Summary */}
              <div className="bg-dark-950/60 rounded-lg border border-white/[0.08] p-4 text-[0.9rem]">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Apartment</span>
                  <span className="font-semibold text-slate-100">{apartmentName}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Unit</span>
                  <span className="font-semibold text-slate-100">{unit.unitId} · Floor {unit.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Price</span>
                  <span className="text-xl font-bold gold-gradient-text">${unit.unitPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="p-4 rounded-xl border border-gold-500/30" style={{ background: 'rgba(217,119,6,0.08)' }}>
                <div className="flex justify-between text-[0.88rem] text-slate-300">
                  <span>Down Payment (10%)</span>
                  <span className="font-bold text-gold-400">${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[0.88rem] text-slate-400 mt-1">
                  <span>Remaining Balance</span>
                  <span>${remaining.toLocaleString()}</span>
                </div>
              </div>

              {/* Months */}
              <div className="form-group mb-0">
                <label className="form-label">Payment Period (months)</label>
                <select className="form-select" value={months} onChange={e => setMonths(Number(e.target.value))}>
                  {[12, 24, 36, 48, 60].map(m => (
                    <option key={m} value={m}>{m} months — ${Math.round(remaining / m).toLocaleString()}/mo</option>
                  ))}
                </select>
              </div>

              {/* Additions */}
              <div className="form-group mb-0">
                <label className="form-label">Special Requests (optional)</label>
                <textarea
                  className="form-textarea resize-none h-20"
                  placeholder="e.g. Custom kitchen cabinets, specific paint colors..."
                  value={additions}
                  onChange={e => setAdditions(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setStep(2)} className="btn btn-gold">
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-100">Payment Information</h3>

              {/* Method Selection */}
              <div className="grid grid-cols-3 gap-2">
                {(['Bank Transfer', 'Online Credit Card', 'Paypal / Stripe'] as PaymentMethod[]).map(m => {
                  const Icon = paymentMethodIcons[m];
                  return (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`btn flex-col py-4 text-[0.78rem] h-auto gap-1 ${method === m ? 'btn-gold' : 'btn-glass'}`}
                    >
                      <Icon size={20} />
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* Down Payment Summary */}
              <div className="p-4 bg-dark-950/60 border border-white/[0.08] rounded-xl text-[0.88rem]">
                <div className="flex justify-between mb-2 text-slate-300">
                  <span>Amount Due Now (10%)</span>
                  <span className="text-gold-400 font-bold">${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Installments ({months}×)</span>
                  <span>${Math.round(remaining / months).toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Proof */}
              <div className="form-group mb-0">
                <label className="form-label">Payment Reference / Proof *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Transaction #892, Receipt ID..."
                  value={proofNote}
                  onChange={e => setProofNote(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[0.85rem] bg-red-500/10 border border-red-500/25 p-3 rounded-lg">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="btn btn-glass flex-1">← Back</button>
                <button onClick={handleConfirm} className="btn btn-gold flex-1">Confirm Booking</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-100 mb-2">Booking Submitted!</h3>
              <p className="text-slate-400 text-[0.9rem] max-w-sm leading-relaxed mb-6">
                Your reservation for <strong className="text-slate-200">{unit.unitId}</strong> has been submitted.
                Our team will review and approve within 2 business days.
              </p>
              <div className="p-4 bg-dark-950/70 rounded-xl border border-white/[0.08] text-[0.85rem] text-slate-400 w-full text-left mb-6">
                <div className="flex justify-between mb-1.5">
                  <span>Payment Method</span>
                  <span className="text-slate-200">{method}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span>Down Payment</span>
                  <span className="text-gold-400">${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Installment Plan</span>
                  <span className="text-slate-200">{months} months</span>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-gold btn-lg">
                View My Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

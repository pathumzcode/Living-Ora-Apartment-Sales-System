import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { User, Calendar, CreditCard, Clock, FileText, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export const CustomerDashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const { bookings, payments } = useStore();

  const userBookings = bookings.filter((b) => b.userEmail === user?.email || b.uid === user?.uid);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'badge-available';
      case 'Pending Approval': return 'badge-pending';
      case 'Rejected': return 'badge-sold';
      default: return 'badge-gold';
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* User Greeting Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border-glass-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img 
            src={user?.profilePicture || '/images/living-ora-interior.svg'} 
            alt={user?.firstName || user?.name || 'User'} 
            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-gold)' }} 
          />
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>Verified Client Portal</span>
            <h1 style={{ fontSize: '1.8rem' }}>Welcome back, {user?.firstName || user?.name || 'Valued Client'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Account: {user?.uid || 'USR-EXT-5001'} &bull; Email: {user?.email || 'john@livingora.lk'} &bull; Status: {user?.status || 'Verified'}
            </p>
          </div>

        </div>

        <button onClick={() => setActivePage('apartments')} className="btn btn-gold">
          Browse More Suites <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Bookings Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>My Suite Reservations ({userBookings.length})</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track reservation verification, down payment receipts, and installment schedules.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {userBookings.map((b) => (
          <div key={b.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div>
                <span className={`badge ${getStatusBadge(b.status)}`} style={{ marginBottom: '0.4rem' }}>
                  {b.status}
                </span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{b.unitLocation || `Unit ${b.unitId}`}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Booking Code: <strong style={{ color: 'var(--text-secondary)' }}>{b.bookingId}</strong> &bull; Reserved On: {b.bookingDate}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Down Payment Transfer</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                  ${b.downPayment?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sub-Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(10, 14, 23, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Payment Method</span>
                <strong style={{ color: 'var(--text-primary)' }}>{b.paymentMethod}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Receipt Proof</span>
                <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileText size={14} /> {b.paymentProof}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Custom Finishes</span>
                <strong style={{ color: 'var(--text-secondary)' }}>{b.additions || 'Standard Finish'}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Reservation Expire Date</span>
                <strong style={{ color: '#f87171' }}>{b.expireDate}</strong>
              </div>
            </div>
          </div>
        ))}

        {userBookings.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>You have no active unit reservations yet.</p>
            <button onClick={() => setActivePage('apartments')} className="btn btn-gold">
              Explore Apartment Suites
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

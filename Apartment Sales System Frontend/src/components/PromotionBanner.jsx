import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check } from 'lucide-react';

export const PromotionBanner = ({ promotion, onClaimPromo }) => {
  const [copied, setCopied] = useState(false);

  if (!promotion) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promotion.promotionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="glass-panel animate-fade-in" 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-glass-gold)',
        marginBottom: '2.5rem'
      }}
    >
      {/* Background image overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${promotion.bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
        filter: 'blur(2px)'
      }} />

      <div style={{ position: 'relative', zIndex: 2, padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <span className="badge badge-gold">
              <Sparkles size={13} /> {promotion.promotionType}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600 }}>
              Save Up To {promotion.discountPrecentage}% Off
            </span>
          </div>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {promotion.promotionTitle}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            {promotion.about}
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>Valid Period: <strong style={{ color: 'var(--text-secondary)' }}>{promotion.validityPeriod}</strong></span>
            &bull;
            <span>Criteria: <strong style={{ color: 'var(--text-secondary)' }}>{promotion.eligibilityCriteria}</strong></span>
          </div>
        </div>

        {/* Promo Code Box */}
        <div style={{ background: 'rgba(10, 14, 23, 0.85)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-gold)', textAlign: 'center', minWidth: '220px' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Exclusive Promo Code
          </span>
          <strong style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-gold)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
            {promotion.promotionCode}
          </strong>

          <button 
            onClick={handleCopyCode} 
            className="btn btn-gold btn-sm" 
            style={{ width: '100%' }}
          >
            {copied ? <><Check size={14} /> Code Copied!</> : <><Copy size={14} /> Copy Promo Code</>}
          </button>
        </div>
      </div>
    </div>
  );
};

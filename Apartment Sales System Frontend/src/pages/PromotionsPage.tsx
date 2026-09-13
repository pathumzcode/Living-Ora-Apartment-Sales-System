import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Promotion } from '../types';
import {
  Tag, Calendar, Percent, ChevronDown, ChevronUp, Sparkles, Copy, CheckCheck
} from 'lucide-react';

const PromotionCard: React.FC<{ promotion: Promotion }> = ({ promotion }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = new Date(promotion.endDate) >= new Date();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promotion.promotionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-card overflow-hidden border ${isActive ? 'border-gold-500/20' : 'border-white/[0.06]'} animate-fade-in`}>
      {/* Banner */}
      {promotion.bannerImage && (
        <div className="relative h-48 overflow-hidden">
          <img src={promotion.bannerImage} alt={promotion.promotionTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/30 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {isActive
              ? <span className="badge badge-available">✓ Active</span>
              : <span className="badge badge-sold">Expired</span>
            }
            <span className="badge badge-gold">
              <Percent size={11} /> {promotion.discountPrecentage}% Off
            </span>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-heading text-xl font-bold text-white drop-shadow">{promotion.promotionTitle}</h2>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Type + Validity */}
        <div className="flex items-center justify-between mb-3 text-[0.8rem]">
          <span className="badge badge-gold"><Tag size={11} /> {promotion.promotionType}</span>
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar size={13} /> {promotion.validityPeriod}
          </span>
        </div>

        <p className="text-[0.88rem] text-slate-400 leading-relaxed mb-4">{promotion.about}</p>

        {/* Promo Code */}
        <div className="flex items-center gap-3 bg-dark-950/70 border border-gold-500/25 px-4 py-3 rounded-xl mb-4">
          <div className="flex-1">
            <span className="text-[0.72rem] text-slate-500 uppercase tracking-wider block mb-0.5">Promo Code</span>
            <span className="font-mono text-gold-300 font-bold text-lg tracking-widest">{promotion.promotionCode}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`btn btn-sm ${copied ? 'btn-outline-gold text-emerald-400' : 'btn-glass'} gap-1`}
          >
            {copied ? <><CheckCheck size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
          </button>
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-[0.8rem] text-slate-500 mb-4">
          <span>Start: <strong className="text-slate-300">{promotion.startDate}</strong></span>
          <span>Ends: <strong className={isActive ? 'text-gold-300' : 'text-red-400'}>{promotion.endDate}</strong></span>
        </div>

        {/* Expandable */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn btn-glass w-full text-[0.85rem] justify-between"
        >
          <span>Eligibility & Details</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="mt-3 p-4 bg-dark-950/50 border border-white/[0.06] rounded-xl text-[0.85rem] text-slate-400 space-y-2 animate-fade-in">
            <div><span className="text-slate-300 font-semibold">Eligibility:</span> {promotion.eligibilityCriteria}</div>
            {promotion.campaignPerformance && (
              <div><span className="text-slate-300 font-semibold">Performance:</span> {promotion.campaignPerformance}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PromotionsPage: React.FC = () => {
  const { promotions } = useStore();
  const active = promotions.filter(p => new Date(p.endDate) >= new Date());
  const expired = promotions.filter(p => new Date(p.endDate) < new Date());

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge badge-gold mb-4">
            <Sparkles size={14} /> Exclusive Deals
          </div>
          <h1 className="font-heading text-5xl font-black text-slate-100 mb-3">
            Living-Ora <span className="gold-gradient-text">Promotions</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Discover time-limited offers, early bird discounts, and exclusive bundles for your dream unit.
          </p>
        </div>

        {/* Active Promotions */}
        {active.length > 0 && (
          <section className="mb-14">
            <h2 className="font-heading text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              Active Promotions ({active.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {active.map(p => <PromotionCard key={p.promotionId} promotion={p} />)}
            </div>
          </section>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-slate-400 mb-5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              Past Promotions ({expired.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {expired.map(p => <PromotionCard key={p.promotionId} promotion={p} />)}
            </div>
          </section>
        )}

        {promotions.length === 0 && (
          <div className="glass-panel flex flex-col items-center py-20 text-slate-400">
            <Tag size={48} className="text-slate-600 mb-4" />
            <p className="text-lg">No promotions available at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};

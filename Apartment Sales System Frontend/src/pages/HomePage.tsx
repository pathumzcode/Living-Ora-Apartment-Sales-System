import React from 'react';
import { useStore } from '../context/StoreContext';
import type { PageId } from '../types';
import { ApartmentCard } from '../components/ApartmentCard';
import type { Apartment } from '../types';
import {
  ArrowRight, Star, Building2, ShieldCheck, TrendingUp,
  Award, Users, MapPin, Sparkles, ChevronDown
} from 'lucide-react';

interface HomePageProps {
  setActivePage: (page: PageId) => void;
  setSelectedApartment: (apt: Apartment) => void;
}

const StatCard: React.FC<{ value: string; label: string; icon: React.ElementType }> = ({ value, label, icon: Icon }) => (
  <div className="glass-panel px-6 py-5 text-center hover:-translate-y-0.5 transition-transform duration-200">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.25), rgba(217,119,6,0.08))' }}>
      <Icon size={20} className="text-gold-400" />
    </div>
    <div className="text-3xl font-heading font-black gold-gradient-text mb-1">{value}</div>
    <div className="text-[0.82rem] text-slate-400">{label}</div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; desc: string }> = ({ icon: Icon, title, desc }) => (
  <div className="glass-panel-hover p-6 group">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.25), rgba(217,119,6,0.06))' }}>
      <Icon size={22} className="text-gold-400" />
    </div>
    <h3 className="font-heading text-lg font-bold text-slate-100 mb-2">{title}</h3>
    <p className="text-[0.88rem] text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({ setActivePage, setSelectedApartment }) => {
  const { apartments, promotions } = useStore();
  const featured = apartments.slice(0, 3);
  const activePromo = promotions[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Radial glow decorations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gold-500/[0.12] border border-gold-500/30 px-4 py-1.5 rounded-full text-gold-300 text-[0.82rem] font-semibold mb-7 animate-fade-in">
          <Sparkles size={14} /> Luxury Apartment Sales & Management Platform
        </div>

        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Discover Your
          <span className="block gold-gradient-text mt-1">Living-Ora Dream Home</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Explore breathtaking luxury apartments designed for the extraordinary.
          Find the perfect unit, reserve it instantly, and manage your investment with confidence.
        </p>

        <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button onClick={() => setActivePage('apartments')} className="btn btn-gold btn-lg">
            Explore Apartments <ArrowRight size={20} />
          </button>
          <button onClick={() => setActivePage('promotions')} className="btn btn-outline-gold btn-lg">
            View Promotions <Star size={20} />
          </button>
        </div>

        {/* Scroll indicator */}
        <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-500 text-[0.78rem] hover:text-gold-400 transition-colors">
          <span>Discover More</span>
          <ChevronDown size={20} className="animate-bounce" />
        </a>
      </section>

      {/* Stats */}
      <section id="stats" className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value={`${apartments.length}+`} label="Apartment Complexes" icon={Building2} />
          <StatCard value="350+" label="Luxury Units" icon={Award} />
          <StatCard value="98%" label="Client Satisfaction" icon={Star} />
          <StatCard value="12+" label="Completed Developments" icon={TrendingUp} />
        </div>
      </section>

      {/* Active Promotion Banner */}
      {activePromo && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden border border-gold-500/30 cursor-pointer"
              onClick={() => setActivePage('promotions')}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)' }} />
              {activePromo.bannerImage && (
                <img src={activePromo.bannerImage} alt={activePromo.promotionTitle} className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="relative p-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="badge badge-gold mb-3">🏷️ Active Promotion</span>
                  <h2 className="font-heading text-2xl font-bold text-white mb-1">{activePromo.promotionTitle}</h2>
                  <p className="text-slate-300 text-[0.9rem] max-w-lg">{activePromo.about}</p>
                  <p className="text-gold-300 text-[0.82rem] mt-2 font-mono font-semibold">Code: {activePromo.promotionCode}</p>
                </div>
                <button className="btn btn-gold btn-lg shrink-0">{activePromo.buttonText} <ArrowRight size={18} /></button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Apartments */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-gold-500 text-[0.82rem] font-semibold uppercase tracking-[0.2em] mb-2 block">Featured Properties</span>
              <h2 className="font-heading text-4xl font-black text-slate-100">
                Signature Developments
              </h2>
            </div>
            <button onClick={() => setActivePage('apartments')} className="btn btn-outline-gold">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(apt => (
              <ApartmentCard
                key={apt.apartmentId}
                apartment={apt}
                onViewDetails={apt => { setSelectedApartment(apt); setActivePage('apartment-detail'); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Living-Ora */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold-500 text-[0.82rem] font-semibold uppercase tracking-[0.2em] mb-2 block">Why Choose Us</span>
            <h2 className="font-heading text-4xl font-black text-slate-100">The Living-Ora Standard</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={ShieldCheck} title="Transparent Process" desc="Full visibility into unit status, pricing, and booking workflows at every step." />
            <FeatureCard icon={MapPin} title="Prime Locations" desc="Strategically placed developments in Colombo's most coveted and high-growth areas." />
            <FeatureCard icon={Users} title="Dedicated Support" desc="Round-the-clock client relationship managers and after-sale support teams." />
            <FeatureCard icon={TrendingUp} title="High ROI Potential" desc="Our properties consistently outperform market indices in rental yield and appreciation." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-black mb-6 text-slate-100">
            Ready to Invest in <span className="gold-gradient-text">Your Future?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Our team of real estate specialists is ready to guide you through every unit selection and booking process.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => setActivePage('apartments')} className="btn btn-gold btn-lg">
              Start Exploring <ArrowRight size={20} />
            </button>
            <button onClick={() => setActivePage('auth')} className="btn btn-glass btn-lg">
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

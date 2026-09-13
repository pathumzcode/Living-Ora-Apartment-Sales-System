import React from 'react';
import type { PageId } from '../types';
import { Building2, Phone, Mail, MapPin, Shield, ArrowRight } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: PageId) => void;
}

const FooterLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-slate-400 hover:text-gold-400 transition-colors bg-transparent border-0 cursor-pointer text-[0.9rem] text-left"
    >
      <ArrowRight size={14} className="text-gold-500" />
      {label}
    </button>
  </li>
);

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="bg-[#070a10] border-t border-white/[0.08] pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)' }}>
                <Building2 size={22} className="text-white" />
              </div>
              <span className="font-heading text-xl font-black text-slate-100">
                LIVING<span className="gold-gradient-text">-ORA</span>
              </span>
            </div>
            <p className="text-slate-400 text-[0.9rem] mb-6 leading-relaxed">
              Redefining luxury living with state-of-the-art apartment complexes, transparent booking, and seamless real estate management.
            </p>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg text-[0.8rem] text-gold-400 border border-white/[0.08] w-fit">
              <Shield size={14} /> Verified Developer
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-slate-100 font-heading font-semibold text-[1.05rem] mb-5">Navigation</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink label="Home Showcase" onClick={() => setActivePage('home')} />
              <FooterLink label="Apartment Complexes" onClick={() => setActivePage('apartments')} />
              <FooterLink label="External Marketplace" onClick={() => setActivePage('external')} />
              <FooterLink label="Exclusive Promotions" onClick={() => setActivePage('promotions')} />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-100 font-heading font-semibold text-[1.05rem] mb-5">Sales Headquarters</h4>
            <div className="flex flex-col gap-4 text-[0.9rem] text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gold-500 mt-0.5 shrink-0" />
                <span>Living-Ora Towers, Level 30, Colombo 03, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500 shrink-0" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gold-500 shrink-0" />
                <span>sales@livingora.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-slate-100 font-heading font-semibold text-[1.05rem] mb-5">VIP Investor Insights</h4>
            <p className="text-slate-400 text-[0.85rem] mb-4 leading-relaxed">
              Get early access to upcoming developments & pre-launch unit sales.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="form-input text-[0.85rem] py-2 px-3"
              />
              <button className="btn btn-gold btn-sm shrink-0">Join</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[0.82rem] text-slate-500">
          <span>&copy; {new Date().getFullYear()} Living-Ora Apartment Sales System. All rights reserved.</span>
          <span>Crafted for <strong className="text-slate-300">Living-Ora Residences</strong></span>
        </div>
      </div>
    </footer>
  );
};

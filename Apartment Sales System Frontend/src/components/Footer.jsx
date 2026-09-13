import React from 'react';
import { ArrowUpRight, Instagram, Linkedin, Mail } from 'lucide-react';

export const Footer = ({ setActivePage }) => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <button className="footer-brand" onClick={() => setActivePage('home')}>LIVING ORA</button>
        <div className="footer-links">
          <button onClick={() => setActivePage('apartments')}>Property</button>
          <button onClick={() => setActivePage('external')}>Buy Property</button>
          <button onClick={() => setActivePage('promotions')}>Rent</button>
          <button onClick={() => setActivePage('home')}>About</button>
          <button onClick={() => setActivePage('promotions')}>Resources</button>
        </div>
        <div className="footer-socials" aria-label="Social links">
          <a href="mailto:sales@livingora.com" aria-label="Email Living-Ora"><Mail size={14} /></a>
          <a href="#instagram" aria-label="Instagram"><Instagram size={14} /></a>
          <a href="#linkedin" aria-label="LinkedIn"><Linkedin size={14} /></a>
          <button className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUpRight size={14} /></button>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} Living Ora</span>
        <span>Designed for considered living</span>
      </div>
    </footer>
  );
};

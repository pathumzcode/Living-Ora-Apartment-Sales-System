import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PageId } from '../types';
import {
  Building2, Home, Tag, LayoutDashboard, User, ShieldAlert,
  LogOut, Menu, X, ExternalLink, Sparkles
} from 'lucide-react';

interface NavbarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { user, role, switchRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isStaff = role === 'INTERNAL_STAFF';

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'apartments', label: 'Apartments & Units', icon: Building2 },
    { id: 'external', label: 'External Marketplace', icon: ExternalLink },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    {
      id: isStaff ? 'staff-dashboard' : 'customer-dashboard',
      label: isStaff ? 'Staff Portal' : 'My Dashboard',
      icon: LayoutDashboard,
    },
  ];

  const handleNav = (id: PageId) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const userFirstName = user && 'firstName' in user ? user.firstName : 'User';
  const userPic = user && 'profilePicture' in user ? user.profilePicture : '';

  return (
    <header className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-xl border-b border-white/[0.08] shadow-glass">
      {/* Demo Role Switcher */}
      <div className="bg-gold-500/[0.12] border-b border-gold-500/25 px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[0.82rem]">
          <div className="flex items-center gap-2 text-yellow-200 font-semibold">
            <Sparkles size={15} />
            <span><strong>Interactive Demo Mode:</strong> Test system roles in real time</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-slate-500 text-xs">Active Role:</span>
            <button
              onClick={() => switchRole('EXTERNAL_USER')}
              className={`btn btn-sm ${role === 'EXTERNAL_USER' ? 'btn-gold' : 'btn-glass'} text-xs py-1 px-2.5`}
            >
              <User size={13} /> Customer
            </button>
            <button
              onClick={() => switchRole('INTERNAL_STAFF')}
              className={`btn btn-sm ${role === 'INTERNAL_STAFF' ? 'btn-gold' : 'btn-glass'} text-xs py-1 px-2.5`}
            >
              <ShieldAlert size={13} /> Staff / Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNav('home')} className="flex items-center gap-3 cursor-pointer bg-transparent border-0 outline-none">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-gold-glow" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)' }}>
            <Building2 size={24} className="text-white" />
          </div>
          <div className="text-left">
            <span className="font-heading text-2xl font-black tracking-[-0.03em] text-slate-100">
              LIVING<span className="gold-gradient-text">-ORA</span>
            </span>
            <span className="block text-[0.68rem] text-slate-400 tracking-[0.15em] -mt-1">LUXURY RESIDENCES</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-1.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`btn btn-sm ${activePage === id ? 'btn-gold' : 'btn-glass'} text-[0.88rem]`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* User Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/[0.08] px-3 py-1.5 rounded-full">
                {userPic && (
                  <img src={userPic} alt={userFirstName} className="w-7 h-7 rounded-full object-cover" />
                )}
                <div className="text-[0.82rem] leading-tight">
                  <span className="font-semibold block text-slate-100">{userFirstName}</span>
                  <span className="text-[0.7rem] text-gold-400">{isStaff ? 'Staff Manager' : 'Verified Client'}</span>
                </div>
              </div>
              <button onClick={() => handleNav('auth')} className="btn btn-glass btn-sm" title="Switch User">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={() => handleNav('auth')} className="btn btn-gold btn-sm">
              <User size={16} /> Sign In
            </button>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-glass btn-sm lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-dark-950 border-t border-white/[0.08] px-4 py-3 flex flex-col gap-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`btn ${activePage === id ? 'btn-gold' : 'btn-glass'} justify-start w-full`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

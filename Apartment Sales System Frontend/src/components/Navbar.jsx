import React, { useState } from 'react';
import { Building2, Home, LogOut, Menu, Search, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'apartments', label: 'Apartments', icon: Building2 },
    { id: 'units', label: 'Units', icon: Search },
    { id: 'external', label: 'External Marketplace', icon: Building2 },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const displayName = user?.firstName || user?.name || user?.email?.split('@')[0] || 'Account';
  const dashboardPage = user?.role === 'CUSTOMER' ? 'customer-dashboard' : user?.role === 'SALES_AGENT' ? 'external' : 'home';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="brand-mark" onClick={() => handleNavClick('home')} aria-label="Go to Living-Ora home">
          <span className="brand-symbol"><Building2 size={18} /></span>
          <span className="brand-copy">
            <strong>LIVING-ORA</strong>
            <small>APARTMENT COLLECTION</small>
          </span>
        </button>

        <nav className="site-nav desktop-nav" aria-label="Primary navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={activePage === id ? 'active' : ''}
              onClick={() => handleNavClick(id)}
            >
              <Icon size={14} strokeWidth={2.2} />
              {label}
            </button>
          ))}
        </nav>

        <div className="site-header-actions">
          {user ? (
            <div className="user-chip">
              {user.profilePicture && <img src={user.profilePicture} alt="" />}
              <span>{displayName}</span>
              <button onClick={() => handleNavClick(dashboardPage)} aria-label="Dashboard" title="My Dashboard" style={{ marginRight: '2px' }}>
                <LayoutDashboard size={13} />
              </button>
              <button onClick={logout} aria-label="Sign out" title="Sign out">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button className="header-login" onClick={() => handleNavClick('auth')}>
              Sign In
            </button>
          )}

          <button
            className="header-menu mobile-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activePage === id ? 'active' : ''} onClick={() => handleNavClick(id)}>
              <Icon size={16} />
              {label}
            </button>
          ))}
          {!user && (
            <button className="mobile-sign-in" onClick={() => handleNavClick('auth')}>
              Sign In
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

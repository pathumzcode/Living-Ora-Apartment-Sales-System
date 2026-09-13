/**
 * Shared UI Helper Functions & Components
 * Injects consistent navigation bar and footer across pages
 * Styled to match the modern luxury architecture reference design
 */

import { getCurrentUser, logout, getDashboardUrlForRole } from './auth.js';

export function formatPrice(amount) {
  if (typeof amount === 'string' && amount.includes('$')) return amount;
  const num = Number(amount) || 0;
  return `$${num.toLocaleString()}`;
}

export function renderNavbar(activePage = '') {
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (!navPlaceholder) return;

  const user = getCurrentUser();
  const isInternal = user && ['ADMIN', 'SALES_MANAGER', 'MARKETING_MANAGER', 'CUSTOMER_RELATIONS_OFFICER', 'FINANCE_PAYMENTS_OFFICER', 'PROPERTY_DEVELOPMENT_MANAGER', 'OPERATIONS_DIRECTOR'].includes(user.role);

  let authLinksHtml = '';
  if (user) {
    const dashboardUrl = getDashboardUrlForRole(user.role);
    const roleTitle = user.role === 'ADMIN' ? 'Admin Control' : (isInternal ? 'Staff Workspace' : 'Client Portal');
    authLinksHtml = `
      <a href="${dashboardUrl}" class="btn btn-sm btn-outline">${roleTitle}</a>
      <button id="nav-logout-btn" class="btn btn-sm btn-primary">Logout</button>
    `;
  } else {
    authLinksHtml = `
      <a href="auth.html?mode=login" class="btn btn-sm btn-outline">Sign In</a>
      <a href="auth.html?mode=signup" class="btn btn-sm btn-primary">Sign Up</a>
    `;
  }

  navPlaceholder.innerHTML = `
    <header class="navbar">
      <div class="container nav-container">
        <a href="index.html" class="nav-logo">
          <span>Living</span>Ora
        </a>
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
          <li><a href="apartments.html" class="nav-link ${activePage === 'apartments' ? 'active' : ''}">Residences</a></li>
          <li><a href="apartments.html?tab=units" class="nav-link ${activePage === 'units' ? 'active' : ''}">Available Units</a></li>
          <li><a href="promotions.html" class="nav-link ${activePage === 'promotions' ? 'active' : ''}">Promotions</a></li>
          <li><a href="external-apartments.html" class="nav-link ${activePage === 'external' ? 'active' : ''}">Resale Listings</a></li>
        </ul>
        <div class="nav-actions">
          ${authLinksHtml}
        </div>
      </div>
    </header>
  `;

  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

export function renderFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;

  footerPlaceholder.innerHTML = `
    <footer class="footer-reference">
      <div class="container">
        <!-- Big Watermark Architecture Branding -->
        <div class="footer-top-brand">
          <div>
            <div class="footer-watermark-title">LIVING ORA</div>
            <p style="color: var(--text-muted); max-width: 480px; font-size: 0.95rem;">
              Premium architectural suites, waterfront penthouses, and condominium developments crafted for sophisticated urban lifestyles.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <a href="apartments.html" class="btn btn-primary">Explore Portfolio &rarr;</a>
            <a href="#inquiry-section" class="btn btn-secondary">Inquire Now</a>
          </div>
        </div>

        <!-- 4 Column Grid Links -->
        <div class="footer-columns-grid">
          <div class="footer-col">
            <h4>Living-Ora Group</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
              Transforming Sri Lanka's coastal skyline with prime oceanfront addresses, verified deed compliance, and comprehensive installment schedules.
            </p>
            <div style="display: flex; gap: 0.5rem;">
              <span class="badge badge-gold">Verified Condos</span>
              <span class="badge badge-dark">Luxury Tier</span>
            </div>
          </div>

          <div class="footer-col">
            <h4>Developments</h4>
            <ul>
              <li><a href="apartments.html">All Developments</a></li>
              <li><a href="apartments.html?tab=units">Available Suite Units</a></li>
              <li><a href="apartments.html">Colombo 03 Waterfront</a></li>
              <li><a href="apartments.html">Colombo 07 Marina Heights</a></li>
              <li><a href="external-apartments.html">Secondary & Resale Market</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Client Services</h4>
            <ul>
              <li><a href="customer-dashboard.html">Client Reservation Portal</a></li>
              <li><a href="promotions.html">Down Payment Schemes</a></li>
              <li><a href="auth.html?mode=login">Account Sign In</a></li>
              <li><a href="auth.html?mode=signup">Create Account</a></li>
              <li><a href="internal-login.html">Staff & Admin Access</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Concierge Desk</h4>
            <ul>
              <li><a href="tel:+94112345678">📞 +94 11 234 5678</a></li>
              <li><a href="mailto:concierge@livingora.lk">✉️ concierge@livingora.lk</a></li>
              <li><a href="#">📍 Marine Drive, Colombo 03, LK</a></li>
              <li><a href="#">⏰ Mon - Sat: 8:30 AM - 6:30 PM</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom-bar">
          <div>&copy; ${new Date().getFullYear()} Living-Ora Apartment Sales Management System. All rights reserved.</div>
          <div style="display: flex; gap: 1.5rem;">
            <a href="#">Privacy Policy</a>
            <a href="#">Deed Terms</a>
            <a href="#">Legal Verification</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

export function setupModalListeners() {
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

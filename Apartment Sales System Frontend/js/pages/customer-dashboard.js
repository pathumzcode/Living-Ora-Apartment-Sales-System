import { store } from '../store.js';
import { requireAuth, getCurrentUser, logout } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice } from '../ui.js';

const API_BASE = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  renderNavbar();
  renderFooter();

  const user = getCurrentUser();

  // Populate client greeting
  const clientNameEl   = document.getElementById('client-name');
  const clientEmailEl  = document.getElementById('client-email');
  const clientUidEl    = document.getElementById('client-uid');
  const clientStatusEl = document.getElementById('client-status');

  if (clientNameEl)   clientNameEl.textContent   = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Client';
  if (clientEmailEl)  clientEmailEl.textContent  = user.email || '';
  if (clientUidEl)    clientUidEl.textContent    = user.uid || user.empId || 'USR-EXT-5001';
  if (clientStatusEl) clientStatusEl.textContent = user.status || 'Verified Client';

  // ── Promotions ──────────────────────────────────────────────────────────────
  const promoContainer = document.getElementById('client-promotions-list');

  async function loadAndRenderPromotions() {
    if (!promoContainer) return;
    promoContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">Loading promotions...</p>`;

    try {
      const res = await fetch(`${API_BASE}/promotions`);
      if (!res.ok) throw new Error('Failed to fetch promotions');
      const allPromos = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activePromos = allPromos.filter(p => {
        if (p.status === 'INACTIVE') return false;
        const start = new Date(p.startDate);
        const end   = new Date(p.endDate);
        return today >= start && today <= end;
      });

      if (activePromos.length === 0) {
        promoContainer.innerHTML = `
          <div class="card" style="padding:1.5rem;text-align:center;color:var(--text-muted);">
            No active promotions available at the moment. Check back soon!
          </div>`;
        return;
      }

      promoContainer.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;">
          ${activePromos.map(p => `
            <div class="card" style="padding:1.5rem;display:flex;flex-direction:column;gap:0.75rem;border:1px solid var(--primary,#d4af37);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <span class="badge badge-gold">${p.promotionType || 'Offer'}</span>
                <strong style="color:var(--primary,#d4af37);font-size:1.1rem;">${p.discountPrecentage ? p.discountPrecentage + '% OFF' : ''}</strong>
              </div>
              <h3 style="font-size:1.15rem;font-weight:700;color:var(--text-main);">${p.promotionTitle}</h3>
              <p style="color:var(--text-muted);font-size:0.85rem;line-height:1.45;">${p.about || ''}</p>
              ${p.eligibilityCriteria ? `<p style="font-size:0.8rem;color:var(--text-dim);">&#128203; ${p.eligibilityCriteria}</p>` : ''}
              <div style="background:var(--bg-dark,#1a1a1a);border:1px dashed var(--primary,#d4af37);border-radius:8px;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <small style="display:block;color:var(--text-dim);font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;">Promo Code</small>
                  <strong style="font-size:1.2rem;color:var(--primary,#d4af37);letter-spacing:2px;font-family:monospace;">${p.promotionCode}</strong>
                </div>
                <button class="btn btn-sm btn-outline copy-promo-btn" data-code="${p.promotionCode}" style="white-space:nowrap;">
                  &#128203; Copy
                </button>
              </div>
              <p style="font-size:0.78rem;color:var(--text-dim);text-align:right;">
                Valid: ${new Date(p.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})} &ndash; ${new Date(p.endDate).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
              </p>
            </div>
          `).join('')}
        </div>`;

      // Copy button logic
      promoContainer.querySelectorAll('.copy-promo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-code');
          navigator.clipboard.writeText(code).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '&#10003; Copied!';
            btn.style.color = 'var(--success)';
            btn.style.borderColor = 'var(--success)';
            setTimeout(() => {
              btn.innerHTML = orig;
              btn.style.color = '';
              btn.style.borderColor = '';
            }, 2000);
          }).catch(() => { prompt('Copy this code:', code); });
        });
      });

    } catch (err) {
      console.error('[CustomerDashboard] Promotions error:', err);
      promoContainer.innerHTML = `<div class="card" style="padding:1.5rem;color:var(--text-muted);">Unable to load promotions right now.</div>`;
    }
  }

  // ── Reservations ─────────────────────────────────────────────────────────────
  const reservationsContainer = document.getElementById('reservations-list');

  function renderReservations() {
    if (!reservationsContainer) return;

    const allBookings  = store.getBookings();
    const userBookings = allBookings.filter(b => b.userEmail === user.email || b.uid === user.uid);

    if (userBookings.length === 0) {
      reservationsContainer.innerHTML = `
        <div class="card" style="padding:3rem;text-align:center;">
          <p style="color:var(--text-muted);font-size:1.1rem;margin-bottom:1.5rem;">You have no active unit reservations yet.</p>
          <a href="apartments.html" class="btn btn-primary">Browse Available Residences</a>
        </div>`;
      return;
    }

    reservationsContainer.innerHTML = userBookings.map(b => {
      let badgeClass = 'badge-warning';
      if (b.status === 'Approved')  badgeClass = 'badge-success';
      if (b.status === 'Rejected')  badgeClass = 'badge-danger';

      return `
        <div class="card" style="margin-bottom:1.5rem;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;margin-bottom:1rem;">
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom:0.5rem;">${b.status}</span>
              <h3 style="font-size:1.35rem;color:var(--text-main);">${b.unitLocation || `Unit ${b.unitId}`}</h3>
              <p style="color:var(--text-muted);font-size:0.88rem;">
                Booking Code: <strong style="color:var(--primary);">${b.bookingId}</strong> &bull; Reserved: ${b.bookingDate}
              </p>
            </div>
            <div style="text-align:right;">
              <span style="display:block;font-size:0.8rem;color:var(--text-dim);">Down Payment</span>
              <strong style="font-size:1.4rem;color:var(--primary);">${formatPrice(b.downPayment)}</strong>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;background-color:var(--bg-dark);padding:1rem;border-radius:var(--radius-md);font-size:0.88rem;">
            <div>
              <span style="display:block;color:var(--text-dim);">Payment Method</span>
              <strong>${b.paymentMethod || 'Bank Transfer'}</strong>
            </div>
            <div>
              <span style="display:block;color:var(--text-dim);">Payment Receipt</span>
              <span style="color:var(--info);">&#128196; ${b.paymentProof || 'receipt.pdf'}</span>
            </div>
            <div>
              <span style="display:block;color:var(--text-dim);">Customizations</span>
              <strong>${b.additions || 'Standard Luxury Finish'}</strong>
            </div>
            <div>
              <span style="display:block;color:var(--text-dim);">Reservation Expiry</span>
              <strong style="color:var(--danger);">${b.expireDate || 'N/A'}</strong>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // Load promotions from backend (async)
  loadAndRenderPromotions();

  // Wait for store to be ready then render reservations
  await store.ready;
  renderReservations();

  // Re-render if store updates
  store.subscribe(() => renderReservations());
});

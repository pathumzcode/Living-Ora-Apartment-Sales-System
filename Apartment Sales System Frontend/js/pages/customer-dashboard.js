import { store } from '../store.js';
import { requireAuth, getCurrentUser, logout } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  renderNavbar();
  renderFooter();

  const user = getCurrentUser();

  // Populate client greeting
  const clientNameEl = document.getElementById('client-name');
  const clientEmailEl = document.getElementById('client-email');
  const clientUidEl = document.getElementById('client-uid');
  const clientStatusEl = document.getElementById('client-status');

  if (clientNameEl) clientNameEl.textContent = user.name || `${user.firstName} ${user.lastName}`;
  if (clientEmailEl) clientEmailEl.textContent = user.email;
  if (clientUidEl) clientUidEl.textContent = user.uid || user.empId || 'USR-EXT-5001';
  if (clientStatusEl) clientStatusEl.textContent = user.status || 'Verified Client';

  const reservationsContainer = document.getElementById('reservations-list');
  const allBookings = store.getBookings();
  const userBookings = allBookings.filter(b => b.userEmail === user.email || b.uid === user.uid);

  function renderReservations() {
    if (!reservationsContainer) return;
    if (userBookings.length === 0) {
      reservationsContainer.innerHTML = `
        <div class="card" style="padding: 3rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">You have no active unit reservations yet.</p>
          <a href="apartments.html" class="btn btn-primary">Browse Available Residences</a>
        </div>
      `;
      return;
    }

    reservationsContainer.innerHTML = userBookings.map(b => {
      let badgeClass = 'badge-warning';
      if (b.status === 'Approved') badgeClass = 'badge-success';
      if (b.status === 'Rejected') badgeClass = 'badge-danger';

      return `
        <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom: 0.5rem;">${b.status}</span>
              <h3 style="font-size: 1.35rem; color: var(--text-main);">${b.unitLocation || `Unit ${b.unitId}`}</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem;">
                Booking Code: <strong style="color: var(--primary);">${b.bookingId}</strong> &bull; Reserved: ${b.bookingDate}
              </p>
            </div>
            <div style="text-align: right;">
              <span style="display: block; font-size: 0.8rem; color: var(--text-dim);">Down Payment</span>
              <strong style="font-size: 1.4rem; color: var(--primary);">${formatPrice(b.downPayment)}</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; background-color: var(--bg-dark); padding: 1rem; border-radius: var(--radius-md); font-size: 0.88rem;">
            <div>
              <span style="display: block; color: var(--text-dim);">Payment Method</span>
              <strong>${b.paymentMethod || 'Bank Transfer'}</strong>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Payment Receipt</span>
              <span style="color: var(--info);">📄 ${b.paymentProof || 'receipt.pdf'}</span>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Requested Customizations</span>
              <strong>${b.additions || 'Standard Luxury Finish'}</strong>
            </div>
            <div>
              <span style="display: block; color: var(--text-dim);">Reservation Expiry</span>
              <strong style="color: var(--danger);">${b.expireDate}</strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderReservations();
});

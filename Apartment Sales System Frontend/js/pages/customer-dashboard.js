import { store } from '../store.js';
import { bookingsApi } from '../api.js';
import { requireAuth, getCurrentUser } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice } from '../ui.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const money = value => value == null ? 'Not provided' : formatPrice(value);

// A missing identity must never match another missing identity.
export const belongsToCustomer = (booking, user) => Boolean(
  (user?.email && booking.userEmail && user.email.toLowerCase() === booking.userEmail.toLowerCase()) ||
  (user?.uid && booking.uid && String(user.uid) === String(booking.uid))
);

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavbar();
  renderFooter();
  const user = getCurrentUser();
  document.getElementById('client-name').textContent = user.name || `${user.firstName || ''} ${user.lastName || ''}`;
  document.getElementById('client-email').textContent = user.email || '';
  document.getElementById('client-uid').textContent = user.uid || user.empId || '';
  document.getElementById('client-status').textContent = user.status || 'Verified Client';

  const container = document.getElementById('reservations-list');
  const message = document.getElementById('booking-feedback');
  const dialog = document.getElementById('booking-dialog');
  const dialogBody = document.getElementById('booking-dialog-body');
  const dialogTitle = document.getElementById('booking-dialog-title');
  const closeButton = document.getElementById('booking-dialog-close');
  let selected = null;
  let busy = false;
  let opener = null;

  function feedback(text, error = false) {
    message.textContent = text;
    message.setAttribute('role', error ? 'alert' : 'status');
    message.style.color = error ? 'var(--danger)' : 'var(--text-main)';
  }

  function renderReservations() {
    if (store.bookingsError) {
      container.innerHTML = '<div class="card booking-empty"><p>Unable to load your bookings. Please try again.</p><button class="btn btn-primary" data-action="retry">Retry</button></div>';
      return;
    }
    const bookings = store.getBookings().filter(b => belongsToCustomer(b, user));
    if (!bookings.length) {
      container.innerHTML = '<div class="card booking-empty"><p>You have no reservations yet.</p><a href="apartments.html" class="btn btn-primary">Browse Available Residences</a></div>';
      return;
    }
    container.innerHTML = bookings.map(b => {
      const approved = b.status === 'Approved';
      const verified = b.paymentStatus === 'VERIFIED';
      const unit = store.getUnits().find(u => u.unitId === b.unitId);
      const badge = approved ? 'badge-success' : ['Rejected', 'Cancelled', 'Expired'].includes(b.status) ? 'badge-danger' : 'badge-warning';
      return `<article class="card booking-card">
        <div class="booking-card-header">
          <div><span class="badge ${badge}">${escapeHtml(b.status)}</span>
            <h3>${escapeHtml(b.unitLocation || unit?.location || `Unit ${b.unitId}`)}</h3>
            <p>Booking Code: <strong>${escapeHtml(b.bookingId)}</strong></p></div>
          <div><span class="booking-label">Down Payment</span><strong>${escapeHtml(money(b.downPayment))}</strong></div>
        </div>
        <dl class="booking-details">
          <div><dt>Reserved On</dt><dd>${escapeHtml(b.bookingDate)}</dd></div>
          <div><dt>Reservation Expiry</dt><dd>${escapeHtml(b.expireDate)}</dd></div>
          <div><dt>Requested Customizations</dt><dd>${escapeHtml(b.additions || 'Standard Finish')}</dd></div>
          <div><dt>Payment Status</dt><dd>${escapeHtml(b.paymentStatus || 'Not provided')}</dd></div>
        </dl>
        <div class="booking-actions">
          <button class="btn btn-primary" data-action="view" data-id="${escapeHtml(b.id)}">View Booking</button>
          <button class="btn btn-outline" data-action="edit" data-id="${escapeHtml(b.id)}" ${approved ? 'disabled' : ''}>Edit</button>
          <button class="btn btn-danger" data-action="delete" data-id="${escapeHtml(b.id)}" ${approved || verified ? 'disabled' : ''}>Delete</button>
        </div>
        ${approved ? '<p class="booking-note">Approved bookings cannot be edited or deleted.</p>' : verified ? '<p class="booking-note">Bookings with verified payments cannot be deleted.</p>' : ''}
      </article>`;
    }).join('');
  }

  function closeDialog() { if (!busy) dialog.close(); }
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { selected = null; opener?.focus(); });

  function setBusy(value) {
    busy = value;
    dialog.setAttribute('aria-busy', String(value));
    dialog.querySelectorAll('button, input, textarea').forEach(el => { el.disabled = value; });
  }

  function showDialogError(error) {
    const errorEl = document.getElementById('booking-dialog-error');
    errorEl.textContent = error.message || 'Unable to complete the request. Please try again.';
  }

  container.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    if (button.dataset.action === 'retry') {
      button.disabled = true;
      button.textContent = 'Loading...';
      await store.refresh();
      return;
    }
    const booking = store.getBookings().find(b => String(b.id) === button.dataset.id && belongsToCustomer(b, user));
    if (!booking) return;
    opener = button;
    feedback('');
    dialogTitle.textContent = 'Loading booking...';
    dialogBody.innerHTML = '<p role="status">Loading current booking details...</p><p id="booking-dialog-error" role="alert"></p>';
    dialog.showModal();
    setBusy(true);
    try {
      selected = await bookingsApi.getById(booking.id);
      if (!belongsToCustomer(selected, user)) throw new Error('This booking is not available for your account.');
      const mode = button.dataset.action;
      dialogTitle.textContent = `${mode === 'edit' ? 'Edit' : mode === 'delete' ? 'Delete' : 'View'} Booking ${selected.bookingId}`;
      if (mode === 'edit') {
        if (selected.status === 'Approved') throw new Error('Approved bookings cannot be edited.');
        dialogBody.innerHTML = `<form id="booking-edit-form">
          <div class="form-group"><label class="form-label" for="booking-date">Booking Date</label><input class="form-input" id="booking-date" name="bookingDate" type="date" required value="${escapeHtml(selected.bookingDate)}"></div>
          <div class="form-group"><label class="form-label" for="booking-expiry">Expiry Date</label><input class="form-input" id="booking-expiry" name="expireDate" type="date" required min="${escapeHtml(selected.bookingDate)}" value="${escapeHtml(selected.expireDate)}"></div>
          <div class="form-group"><label class="form-label" for="booking-additions">Additions / Customizations</label><textarea class="form-textarea" id="booking-additions" name="additions" maxlength="45" rows="3">${escapeHtml(selected.additions)}</textarea><small>Up to 45 characters.</small></div>
          <p id="booking-dialog-error" role="alert"></p>
          <div class="booking-actions"><button class="btn btn-primary" type="submit">Save Changes</button><button class="btn btn-outline" type="button" data-close>Cancel</button></div>
        </form>`;
        document.getElementById('booking-date').addEventListener('input', event => {
          document.getElementById('booking-expiry').min = event.target.value;
        });
        document.getElementById('booking-edit-form').addEventListener('submit', async event => {
          event.preventDefault();
          if (busy) return;
          const data = Object.fromEntries(new FormData(event.target));
          if (data.expireDate < data.bookingDate) {
            showDialogError(new Error('Expiry date must be on or after the booking date.'));
            return;
          }
          setBusy(true);
          try {
            await store.updateBooking(selected.id, data);
            setBusy(false);
            dialog.close();
            feedback('Booking updated successfully.');
          } catch (error) { showDialogError(error); }
          finally { setBusy(false); }
        });
      } else if (mode === 'delete') {
        if (selected.status === 'Approved' || selected.paymentStatus === 'VERIFIED') {
          throw new Error('Approved bookings and bookings with verified payments cannot be deleted.');
        }
        dialogBody.innerHTML = `<p>Delete reservation <strong>${escapeHtml(selected.bookingId)}</strong> for unit <strong>${escapeHtml(selected.unitId)}</strong>?</p>
          <p>This permanently removes the booking and its unverified payment records. This cannot be undone.</p>
          <p id="booking-dialog-error" role="alert"></p>
          <div class="booking-actions"><button class="btn btn-outline" data-close>Keep Booking</button><button class="btn btn-danger" id="confirm-booking-delete">Delete Booking</button></div>`;
        document.getElementById('confirm-booking-delete').addEventListener('click', async () => {
          if (busy) return;
          setBusy(true);
          try {
            await store.deleteBooking(selected.id);
            setBusy(false);
            dialog.close();
            feedback('Booking deleted successfully.');
          } catch (error) { showDialogError(error); }
          finally { setBusy(false); }
        });
      } else {
        const details = [['Booking Code', selected.bookingId], ['Unit', selected.unitId], ['Status', selected.status],
          ['Booking Date', selected.bookingDate], ['Expiry Date', selected.expireDate], ['Additions', selected.additions || 'Standard Finish'],
          ['Apartment Price', money(selected.paymentAmount)], ['Down Payment', money(selected.downPayment)],
          ['Payment Method', selected.paymentMethod || 'Not provided'], ['Payment Status', selected.paymentStatus || 'Not provided'],
          ['Payment Receipt', selected.paymentProof || 'Not provided']];
        dialogBody.innerHTML = `<dl class="booking-details">${details.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
          <p id="booking-dialog-error" role="alert"></p><div class="booking-actions"><button class="btn btn-primary" data-close>Close</button></div>`;
      }
      dialogBody.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeDialog));
    } catch (error) {
      dialogTitle.textContent = 'Booking unavailable';
      dialogBody.querySelector('[role="status"]')?.remove();
      showDialogError(error);
    }
    finally {
      setBusy(false);
      (dialogBody.querySelector('input, [data-close]') || closeButton).focus();
    }
  });

  container.innerHTML = '<p role="status">Loading your reservations...</p>';
  store.subscribe(renderReservations);
  await store.ready;
  renderReservations();

  // Re-render if store updates
  store.subscribe(() => renderReservations());
});

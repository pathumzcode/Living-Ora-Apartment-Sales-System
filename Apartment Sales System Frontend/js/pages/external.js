import { store } from '../store.js';
import { getCurrentUser } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('external');
  renderFooter();
  setupModalListeners();

  const externalGrid = document.getElementById('external-apartments-grid');
  const alertBox = document.getElementById('external-alert');

  // Purchase Modal Elements
  const purchaseModal = document.getElementById('resale-purchase-modal');
  const purchaseForm = document.getElementById('resale-purchase-form');
  const purchaseAptId = document.getElementById('purchase-apt-id');
  const propLocation = document.getElementById('purchase-prop-location');
  const propPrice = document.getElementById('purchase-prop-price');
  const propDownpayment = document.getElementById('purchase-prop-downpayment');
  const buyerName = document.getElementById('buyer-name');
  const buyerEmail = document.getElementById('buyer-email');
  const buyerPhone = document.getElementById('buyer-phone');
  const successBox = document.getElementById('purchase-success-box');
  const closePurchaseBtn = document.getElementById('close-purchase-modal-btn');
  const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');

  let selectedApartment = null;

  function showAlert(msg, isError = false) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
  }

  function renderExternal() {
    const list = store.getExternalApartments();
    if (!externalGrid) return;
    if (list.length === 0) {
      externalGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No resale apartments available right now. Certified sales agents add new listings regularly.</p>`;
      return;
    }

    externalGrid.innerHTML = list.map(item => `
      <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-img-wrap">
            <img src="${item.images || 'images/luxury-condo-exterior.jpg'}" alt="${item.location}" class="card-img" />
            <div class="card-badge-pos">
              <span class="badge badge-gold">Verified Resale</span>
            </div>
          </div>
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
              <span style="font-size: 0.75rem; color: var(--primary); font-family: monospace; font-weight: 700;">${item.exApartmentId || 'RESALE'}</span>
              <span class="badge badge-success" style="font-size: 0.7rem;">Available for Purchase</span>
            </div>
            <h3 class="card-title" style="margin-bottom: 0.4rem;">${item.location}</h3>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.75rem; line-height: 1.5;">${item.about || 'Exceptional luxury secondary condominium with premium amenities.'}</p>
            <div class="card-meta" style="margin-bottom: 1rem;">
              <span>🛏️ ${item.numOfRooms || 2} Rooms</span>
              <span>❄️ ${item.acOrNonAC || 'AC'}</span>
              <span>📝 ${item.additionalInfo ? (item.additionalInfo.length > 25 ? item.additionalInfo.substring(0, 25) + '...' : item.additionalInfo) : 'Agent Verified'}</span>
            </div>
          </div>
        </div>

        <div class="card-body" style="padding-top: 0; border-top: 1px solid var(--border-color); margin-top: 0.5rem;">
          <div class="card-footer" style="padding: 0.75rem 0; margin-bottom: 0.75rem;">
            <div>
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Full Purchase Price</small>
              <strong class="card-price" style="font-size: 1.25rem;">${formatPrice(item.price)}</strong>
            </div>
            <div style="text-align: right;">
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Minimum Down Payment</small>
              <strong style="color: var(--success); font-size: 1.05rem;">${formatPrice(item.downPayment || item.price * 0.1)}</strong>
            </div>
          </div>
          <button class="btn btn-primary btn-block buy-resale-btn" data-id="${item.exApartmentId || item.id}">
            🛒 Buy / Reserve This Resale Unit &rarr;
          </button>
        </div>
      </article>
    `).join('');

    // Attach Buy / Reserve click handlers
    externalGrid.querySelectorAll('.buy-resale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-id');
        openBuyModal(aptId);
      });
    });
  }

  function openBuyModal(aptId) {
    const list = store.getExternalApartments();
    selectedApartment = list.find(a => (a.exApartmentId === aptId || a.id === aptId));
    if (!selectedApartment) return;

    const user = getCurrentUser();
    if (user) {
      if (buyerName) buyerName.value = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (buyerEmail) buyerEmail.value = user.email || '';
      if (buyerPhone) buyerPhone.value = user.phoneNumber || '';
    }

    if (purchaseAptId) purchaseAptId.value = selectedApartment.exApartmentId || selectedApartment.id;
    if (propLocation) propLocation.textContent = selectedApartment.location;
    if (propPrice) propPrice.textContent = formatPrice(selectedApartment.price);
    if (propDownpayment) propDownpayment.textContent = formatPrice(selectedApartment.downPayment || selectedApartment.price * 0.1);

    if (successBox) successBox.style.display = 'none';
    if (purchaseForm) purchaseForm.style.display = 'block';

    openModal('resale-purchase-modal');
  }

  closePurchaseBtn?.addEventListener('click', () => closeModal('resale-purchase-modal'));
  cancelPurchaseBtn?.addEventListener('click', () => closeModal('resale-purchase-modal'));

  purchaseForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('confirm-purchase-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Recording reservation...';
    }

    try {
      // Simulate booking reservation confirmation for resale unit
      await new Promise(r => setTimeout(r, 600));

      if (successBox) successBox.style.display = 'block';
      if (purchaseForm) purchaseForm.reset();

      setTimeout(() => {
        closeModal('resale-purchase-modal');
        showAlert(`Congratulations! Your reservation for ${selectedApartment?.location || 'the apartment'} has been received.`, false);
      }, 1500);
    } catch (err) {
      showAlert(err.message || 'Failed to submit reservation.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Purchase Reservation';
      }
    }
  });

  // Re-render when store updates
  store.subscribe(renderExternal);
  renderExternal();
});

import { store } from '../store.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';
import { getCurrentUser } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('apartments');
  renderFooter();
  setupModalListeners();

  const urlParams = new URLSearchParams(window.location.search);
  let currentTab = urlParams.get('tab') === 'units' ? 'units' : 'complexes';

  const tabComplexesBtn = document.getElementById('tab-complexes-btn');
  const tabUnitsBtn = document.getElementById('tab-units-btn');
  const complexesSection = document.getElementById('complexes-section');
  const unitsSection = document.getElementById('units-section');

  const searchInput = document.getElementById('apartments-search-input');
  const bedsFilter = document.getElementById('beds-filter');
  const priceFilter = document.getElementById('price-filter');

  const complexesGrid = document.getElementById('complexes-grid');
  const unitsGrid = document.getElementById('units-grid');

  function switchTab(tab) {
    currentTab = tab;
    if (tab === 'units') {
      tabUnitsBtn?.classList.add('active');
      tabComplexesBtn?.classList.remove('active');
      unitsSection?.removeAttribute('hidden');
      complexesSection?.setAttribute('hidden', 'true');
    } else {
      tabComplexesBtn?.classList.add('active');
      tabUnitsBtn?.classList.remove('active');
      complexesSection?.removeAttribute('hidden');
      unitsSection?.setAttribute('hidden', 'true');
    }
  }

  tabComplexesBtn?.addEventListener('click', () => switchTab('complexes'));
  tabUnitsBtn?.addEventListener('click', () => switchTab('units'));
  switchTab(currentTab);

  let apartments = store.getApartments();
  let units = store.getUnits();

  function syncData() {
    apartments = store.getApartments();
    units = store.getUnits();
    applyFilters();
  }

  // Subscribe to store updates (fired once backend responds)
  store.subscribe(syncData);
  if (store.ready) {
    store.ready.then(syncData);
  }

  function renderComplexes(list) {
    if (!complexesGrid) return;
    if (list.length === 0) {
      complexesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No apartment complexes found.</p>`;
      return;
    }

    complexesGrid.innerHTML = list.map(apt => `
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${apt.images || 'images/luxury-complex-marina.jpg'}" alt="${apt.name}" class="property-card-img" />
          <span class="property-card-badge">${apt.unitStatus || 'Available'}</span>
          <a href="apartment-detail.html?id=${apt.id || apt.apartmentId}" class="property-card-action-btn" title="View Residences">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${apt.name}</h3>
          <p class="property-card-location">📍 ${apt.location}</p>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.75rem; line-height: 1.4;">${apt.about || ''}</p>
          <div class="property-card-specs">
            <span>🏢 ${apt.numOfFloors} Floors</span>
            <span>🏊 ${apt.numOfSwimmingPool} Pools</span>
            <span>🏋️ ${apt.numOfGYM} Gym</span>
            <span>🚪 ${apt.numOfUnitsAvilable || 10} Units Left</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Price Range</div>
              <div class="property-card-price">${apt.priceRange || '$200k+'}</div>
            </div>
            <a href="apartment-detail.html?id=${apt.id || apt.apartmentId}" class="btn btn-sm btn-primary">View Residences &rarr;</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderUnits(list) {
    if (!unitsGrid) return;
    if (list.length === 0) {
      unitsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No units match your selected filter.</p>`;
      return;
    }

    unitsGrid.innerHTML = list.map(u => {
      const isAvailable = (u.availability || u.avilability || 'Available') === 'Available';
      const badgeClass = isAvailable ? 'badge-available' : ((u.availability || u.avilability) === 'Reserved' ? 'badge-warning' : 'badge-danger');
      return `
        <article class="property-card">
          <div class="property-card-img-wrap">
            <img src="${u.images || 'images/luxury-interior-lounge.jpg'}" alt="${u.location}" class="property-card-img" />
            <span class="property-card-badge ${badgeClass}">${u.availability || u.avilability || 'Available'}</span>
            ${isAvailable ? `
              <button class="property-card-action-btn reserve-unit-btn" data-unit-id="${u.unitId}" title="Reserve Suite">
                &nearr;
              </button>
            ` : ''}
          </div>
          <div class="property-card-body">
            <h3 class="property-card-title">${u.location}</h3>
            <p class="property-card-location">Unit ID: <strong style="color: var(--primary);">${u.unitId}</strong> &bull; Floor ${u.floor}</p>
            <div class="property-card-specs">
              <span>🛏️ ${u.numOfBeds} Beds</span>
              <span>🚿 ${u.numOfBathRooms} Baths</span>
              <span>❄️ ${u.acOrNonAC || 'AC'}</span>
              <span>🛋️ ${u.furnitures || 'Furnished'}</span>
            </div>
            <div class="property-card-footer">
              <div>
                <div class="property-card-price-label">Full Purchase Price</div>
                <div class="property-card-price">${formatPrice(u.unitPrice)}</div>
              </div>
              ${isAvailable ? `
                <button class="btn btn-sm btn-gold reserve-unit-btn" data-unit-id="${u.unitId}">Reserve Suite</button>
              ` : `
                <button class="btn btn-sm btn-secondary" disabled>Unavailable</button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach reserve button handlers
    document.querySelectorAll('.reserve-unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.getAttribute('data-unit-id');
        openBookingModalForUnit(unitId);
      });
    });
  }

  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const minBeds = parseInt(bedsFilter?.value || '0', 10);
    const maxPrice = parseInt(priceFilter?.value || '0', 10);

    const filteredComplexes = apartments.filter(a => {
      const text = `${a.name} ${a.location}`.toLowerCase();
      return !q || text.includes(q);
    });

    const filteredUnits = units.filter(u => {
      const text = `${u.unitId} ${u.location} ${u.furnitures}`.toLowerCase();
      const matchText = !q || text.includes(q);
      const matchBeds = !minBeds || (u.numOfBeds >= minBeds);
      const matchPrice = !maxPrice || (u.unitPrice <= maxPrice);
      return matchText && matchBeds && matchPrice;
    });

    renderComplexes(filteredComplexes);
    renderUnits(filteredUnits);
  }

  searchInput?.addEventListener('input', applyFilters);
  bedsFilter?.addEventListener('change', applyFilters);
  priceFilter?.addEventListener('change', applyFilters);

  renderComplexes(apartments);
  renderUnits(units);

  // Booking Modal Logic
  let selectedUnit = null;
  const bookingModal = document.getElementById('booking-modal');
  const modalUnitTitle = document.getElementById('modal-unit-title');
  const modalUnitPrice = document.getElementById('modal-unit-price');
  const modalDownPaymentRatio = document.getElementById('modal-downpayment-ratio');
  const modalMonths = document.getElementById('modal-months');
  const modalDownPaymentAmount = document.getElementById('modal-downpayment-amount');
  const modalMonthlyAmount = document.getElementById('modal-monthly-amount');
  const bookingForm = document.getElementById('booking-reservation-form');
  const bookingSuccessBox = document.getElementById('booking-success-box');

  function openBookingModalForUnit(unitId) {
    selectedUnit = units.find(u => u.unitId === unitId);
    if (!selectedUnit) return;

    if (modalUnitTitle) modalUnitTitle.textContent = `${selectedUnit.location} (Unit ${selectedUnit.unitId})`;
    if (modalUnitPrice) modalUnitPrice.textContent = formatPrice(selectedUnit.unitPrice);

    calculateBookingSchedule();
    if (bookingSuccessBox) bookingSuccessBox.style.display = 'none';
    if (bookingForm) bookingForm.style.display = 'block';

    openModal('booking-modal');
  }

  function calculateBookingSchedule() {
    if (!selectedUnit) return;
    const ratio = parseInt(modalDownPaymentRatio?.value || '20', 10);
    const months = parseInt(modalMonths?.value || '36', 10);
    const unitPrice = selectedUnit.unitPrice;

    const downPayment = (unitPrice * ratio) / 100;
    const remaining = unitPrice - downPayment;
    const monthly = remaining / months;

    if (modalDownPaymentAmount) modalDownPaymentAmount.textContent = formatPrice(downPayment);
    if (modalMonthlyAmount) modalMonthlyAmount.textContent = formatPrice(Math.round(monthly));
  }

  modalDownPaymentRatio?.addEventListener('change', calculateBookingSchedule);
  modalMonths?.addEventListener('change', calculateBookingSchedule);

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const user = getCurrentUser();
    const ratio = parseInt(modalDownPaymentRatio?.value || '20', 10);
    const months = parseInt(modalMonths?.value || '36', 10);
    const downPaymentAmount = (selectedUnit.unitPrice * ratio) / 100;
    const paymentMethod = document.getElementById('modal-payment-method')?.value || 'Bank Transfer';
    const additions = document.getElementById('modal-additions')?.value || 'Standard Executive Finish';
    const proofFile = document.getElementById('modal-payment-proof')?.files[0]?.name || `proof_${selectedUnit.unitId}.pdf`;

    const submitBtn = document.getElementById('submit-booking-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing reservation...';
    }

    try {
      await store.createBooking({
        uid: user?.uid || 'USR-EXT-5001',
        userName: user ? `${user.firstName} ${user.lastName}` : 'Guest Buyer',
        userEmail: user?.email || 'buyer@livingora.lk',
        unitId: selectedUnit.unitId,
        unitLocation: selectedUnit.location,
        paymentAmount: selectedUnit.unitPrice,
        downPayment: downPaymentAmount,
        paymentMethod,
        paymentProof: proofFile,
        additions,
        months,
        unitPrice: selectedUnit.unitPrice
      });

      if (bookingForm) bookingForm.style.display = 'none';
      if (bookingSuccessBox) bookingSuccessBox.style.display = 'block';

      setTimeout(() => {
        closeModal('booking-modal');
        applyFilters();
      }, 2000);
    } catch (err) {
      alert(err.message || 'Unable to submit reservation.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Unit Reservation';
      }
    }
  });

  window.openBookingModalForUnit = openBookingModalForUnit;
});

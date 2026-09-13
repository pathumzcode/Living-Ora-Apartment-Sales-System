import { store } from '../store.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';
import { getCurrentUser } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('apartments');
  renderFooter();
  setupModalListeners();

  const urlParams = new URLSearchParams(window.location.search);
  const aptId = urlParams.get('id') || 'APT-LO-001';

  function populateDetails() {
    const allApts = store.getApartments();
    const apt = store.getApartmentById(aptId) || 
                allApts.find(a => String(a.apartmentId).toLowerCase() === String(aptId).toLowerCase() || String(a.id).toLowerCase() === String(aptId).toLowerCase()) || 
                allApts[0];

    if (!apt) {
      return;
    }

    // Populate Complex Overview
    const titleEl = document.getElementById('apt-name');
    const locEl = document.getElementById('apt-location');
    const priceEl = document.getElementById('apt-price');
    const aboutEl = document.getElementById('apt-about');
    const imgEl = document.getElementById('apt-image');
    const floorPlanImg = document.getElementById('apt-floorplan-img');
    const floorsEl = document.getElementById('apt-floors');
    const poolsEl = document.getElementById('apt-pools');
    const gymsEl = document.getElementById('apt-gyms');
    const unitsAvailEl = document.getElementById('apt-units-count');

    if (titleEl) titleEl.textContent = apt.name;
    if (locEl) locEl.textContent = `📍 ${apt.location}`;
    if (priceEl) priceEl.textContent = apt.priceRange || '$220,000 – $850,000';
    if (aboutEl) aboutEl.textContent = apt.about || 'A considered home for modern coastal living.';
    if (imgEl) imgEl.src = apt.images || 'images/luxury-complex-marina.jpg';
    if (floorPlanImg) floorPlanImg.src = apt.floorPlan || 'images/luxury-interior-lounge.jpg';
    if (floorsEl) floorsEl.textContent = `${apt.numOfFloors ?? 20} Floors`;
    if (poolsEl) poolsEl.textContent = `${apt.numOfSwimmingPool ?? 1} Swimming Pool`;
    if (gymsEl) gymsEl.textContent = `${apt.numOfGYM ?? 1} Fitness Center`;
    if (unitsAvailEl) unitsAvailEl.textContent = `${apt.numOfUnitsAvailable ?? apt.numOfUnitsAvilable ?? 10} Units Available`;

    renderComplexUnits(apt);
  }

  // Populate Units List
  const unitsContainer = document.getElementById('complex-units-grid');

  function renderComplexUnits(apt) {
    if (!unitsContainer) return;
    const allUnits = store.getUnits();
    const complexUnits = allUnits.filter(u => u.apartment_id === apt.id || u.apartment_id === apt.apartmentId || u.apartmentId === apt.id);
    const displayUnits = complexUnits.length > 0 ? complexUnits : allUnits.slice(0, 3);

    unitsContainer.innerHTML = displayUnits.map(u => {
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
            <p class="property-card-location">Unit: <strong>${u.unitId}</strong> &bull; Floor ${u.floor || 1}</p>
            <div class="property-card-specs">
              <span>🛏️ ${u.numOfBeds || 2} Beds</span>
              <span>🚿 ${u.numOfBathRooms || 2} Baths</span>
              <span>❄️ ${u.acOrNonAC || 'AC'}</span>
              <span>🛋️ ${u.furnitures || 'Furnished'}</span>
            </div>
            <div class="property-card-footer">
              <div>
                <div class="property-card-price-label">Price</div>
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

    document.querySelectorAll('.reserve-unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.getAttribute('data-unit-id');
        openBookingModalForUnit(unitId);
      });
    });
  }

  populateDetails();
  store.subscribe(populateDetails);
  if (store.ready) {
    store.ready.then(populateDetails);
  }

  // Booking Modal Logic
  let selectedUnit = null;
  const modalUnitTitle = document.getElementById('modal-unit-title');
  const modalUnitPrice = document.getElementById('modal-unit-price');
  const modalDownPaymentRatio = document.getElementById('modal-downpayment-ratio');
  const modalMonths = document.getElementById('modal-months');
  const modalDownPaymentAmount = document.getElementById('modal-downpayment-amount');
  const modalMonthlyAmount = document.getElementById('modal-monthly-amount');
  const bookingForm = document.getElementById('booking-reservation-form');
  const bookingSuccessBox = document.getElementById('booking-success-box');

  function openBookingModalForUnit(unitId) {
    selectedUnit = store.getUnits().find(u => u.unitId === unitId);
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
    const additions = document.getElementById('modal-additions')?.value || 'Standard Luxury Finish';
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
        renderComplexUnits();
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit reservation.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Unit Reservation';
      }
    }
  });
});

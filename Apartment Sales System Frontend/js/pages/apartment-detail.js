import { store } from '../store.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';
import { getCurrentUser } from '../auth.js';
import { promotionsApi } from '../api.js';

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

    if (!apt) return;

    const titleEl        = document.getElementById('apt-name');
    const locEl          = document.getElementById('apt-location');
    const priceEl        = document.getElementById('apt-price');
    const aboutEl        = document.getElementById('apt-about');
    const imgEl          = document.getElementById('apt-image');
    const floorPlanImg   = document.getElementById('apt-floorplan-img');
    const floorsEl       = document.getElementById('apt-floors');
    const poolsEl        = document.getElementById('apt-pools');
    const gymsEl         = document.getElementById('apt-gyms');
    const unitsAvailEl   = document.getElementById('apt-units-count');

    if (titleEl)      titleEl.textContent    = apt.name || apt.location || 'Living-Ora Residence';
    if (locEl)        locEl.textContent      = `📍 ${apt.location}`;
    if (priceEl)      priceEl.textContent    = apt.priceRange || '$220,000 – $850,000';
    if (aboutEl)      aboutEl.textContent    = apt.about || 'A considered home for modern coastal living.';
    if (imgEl)        imgEl.src              = apt.images || 'images/luxury-complex-marina.jpg';
    if (floorPlanImg) floorPlanImg.src       = apt.floorPlan || 'images/luxury-interior-lounge.jpg';
    if (floorsEl)     floorsEl.textContent   = `${apt.numOfFloors ?? 20} Floors`;
    if (poolsEl)      poolsEl.textContent    = `${apt.numOfSwimmingPool ?? 1} Swimming Pool`;
    if (gymsEl)       gymsEl.textContent     = `${apt.numOfGYM ?? 1} Fitness Center`;
    if (unitsAvailEl) unitsAvailEl.textContent = `${apt.numOfUnitsAvailable ?? apt.numOfUnitsAvilable ?? 10} Units Available`;

    renderComplexUnits(apt);

    // Load promotions for this apartment from the real API
    loadApartmentPromotions(apt.apartmentId || apt.id || aptId);
  }

  // ── Units Grid ────────────────────────────────────────────────────────────────

  const unitsContainer = document.getElementById('complex-units-grid');

  function renderComplexUnits(apt) {
    if (!unitsContainer) return;
    const allUnits   = store.getUnits();
    const complexUnits  = allUnits.filter(u => u.apartment_id === apt.id || u.apartment_id === apt.apartmentId || u.apartmentId === apt.id || u.apartmentId === apt.apartmentId);
    const displayUnits  = complexUnits.length > 0 ? complexUnits : allUnits.slice(0, 3);

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
  if (store.ready) store.ready.then(populateDetails);

  // ── Apartment Promotions Section ──────────────────────────────────────────────

  async function loadApartmentPromotions(apartmentId) {
    const section = document.getElementById('apt-promotions-section');
    const grid    = document.getElementById('apt-promotions-grid');
    if (!section || !grid) return;

    try {
      const promos = await promotionsApi.getForApartment(apartmentId);
      if (!promos || promos.length === 0) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';
      grid.innerHTML = promos.map(p => `
        <article class="card" style="overflow:hidden;">
          <div style="background:linear-gradient(135deg,var(--primary),#1e40af);padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <span class="badge badge-gold" style="margin-bottom:0.4rem;">${escapeHtml(p.promotionType || 'Special Offer')}</span>
              <h3 style="color:#fff;font-size:1.1rem;font-weight:700;margin:0;">${escapeHtml(p.promotionTitle)}</h3>
            </div>
            <div style="text-align:right;">
              <div style="font-size:2rem;font-weight:800;color:#fff;">${p.discountPrecentage != null ? p.discountPrecentage + '%' : ''}</div>
              <div style="color:rgba(255,255,255,0.75);font-size:0.78rem;">OFF</div>
            </div>
          </div>
          <div style="padding:1rem 1.5rem;">
            <p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:0.75rem;line-height:1.5;">${escapeHtml(p.about || '')}</p>
            ${p.eligibilityCriteria ? `<p style="font-size:0.82rem;color:var(--text-dim);">🎯 ${escapeHtml(p.eligibilityCriteria)}</p>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border-color);">
              <div>
                <small style="color:var(--text-dim);font-size:0.75rem;">Promo Code</small>
                <div style="font-weight:800;color:var(--primary);letter-spacing:2px;font-size:1rem;">${escapeHtml(p.promotionCode)}</div>
              </div>
              <div style="text-align:right;">
                <small style="color:var(--text-dim);font-size:0.75rem;">Valid Until</small>
                <div style="font-size:0.85rem;font-weight:600;">${formatDate(p.endDate)}</div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline use-promo-btn" data-code="${escapeHtml(p.promotionCode)}" style="width:100%;margin-top:0.75rem;">
              Use This Code at Booking
            </button>
          </div>
        </article>
      `).join('');

      // Wire "Use This Code" buttons — scroll to booking and pre-fill code
      grid.querySelectorAll('.use-promo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-code');
          const promoInput = document.getElementById('modal-promo-code');
          if (promoInput) promoInput.value = code;
          // Scroll to units and click first available reserve button
          unitsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

    } catch (err) {
      console.warn('[ApartmentDetail] Could not load promotions:', err.message);
      section.style.display = 'none';
    }
  }

  // ── Booking Modal ─────────────────────────────────────────────────────────────

  let selectedUnit = null;
  let appliedPromotion = null;   // stores the validated PromotionResponse

  const modalUnitTitle        = document.getElementById('modal-unit-title');
  const modalUnitPrice        = document.getElementById('modal-unit-price');
  const modalDownPaymentRatio = document.getElementById('modal-downpayment-ratio');
  const modalMonths           = document.getElementById('modal-months');
  const modalDownPaymentAmount= document.getElementById('modal-downpayment-amount');
  const modalMonthlyAmount    = document.getElementById('modal-monthly-amount');
  const bookingForm           = document.getElementById('booking-reservation-form');
  const bookingSuccessBox     = document.getElementById('booking-success-box');
  const applyPromoBtn         = document.getElementById('apply-promo-btn');
  const promoInput            = document.getElementById('modal-promo-code');
  const promoFeedback         = document.getElementById('promo-feedback');
  const discountPreviewRow    = document.getElementById('discount-preview-row');

  function openBookingModalForUnit(unitId) {
    selectedUnit = store.getUnits().find(u => u.unitId === unitId);
    if (!selectedUnit) return;

    appliedPromotion = null;
    if (promoInput)       promoInput.value = '';
    if (promoFeedback)    { promoFeedback.style.display = 'none'; promoFeedback.textContent = ''; }
    if (discountPreviewRow) discountPreviewRow.style.display = 'none';

    if (modalUnitTitle) modalUnitTitle.textContent = `${selectedUnit.location} (Unit ${selectedUnit.unitId})`;
    if (modalUnitPrice) modalUnitPrice.textContent = formatPrice(selectedUnit.unitPrice);

    calculateBookingSchedule();
    if (bookingSuccessBox) bookingSuccessBox.style.display = 'none';
    if (bookingForm)       bookingForm.style.display = 'block';

    openModal('booking-modal');
  }

  function getEffectivePrice() {
    if (!selectedUnit) return 0;
    if (appliedPromotion && appliedPromotion.discountPrecentage) {
      const discount = (selectedUnit.unitPrice * appliedPromotion.discountPrecentage) / 100;
      return selectedUnit.unitPrice - discount;
    }
    return selectedUnit.unitPrice;
  }

  function calculateBookingSchedule() {
    if (!selectedUnit) return;
    const ratio    = parseInt(modalDownPaymentRatio?.value || '20', 10);
    const months   = parseInt(modalMonths?.value || '36', 10);
    const price    = getEffectivePrice();
    const downPay  = (price * ratio) / 100;
    const remaining= price - downPay;
    const monthly  = remaining / months;

    if (modalDownPaymentAmount) modalDownPaymentAmount.textContent = formatPrice(downPay);
    if (modalMonthlyAmount)     modalMonthlyAmount.textContent    = formatPrice(Math.round(monthly));
  }

  modalDownPaymentRatio?.addEventListener('change', calculateBookingSchedule);
  modalMonths?.addEventListener('change', calculateBookingSchedule);

  // ── Apply Promo Code ──────────────────────────────────────────────────────────

  applyPromoBtn?.addEventListener('click', async () => {
    const code = promoInput?.value?.trim().toUpperCase();
    if (!code) return;

    applyPromoBtn.disabled    = true;
    applyPromoBtn.textContent = 'Checking…';
    promoFeedback.style.display = 'none';
    discountPreviewRow.style.display = 'none';
    appliedPromotion = null;

    try {
      const currentApartmentId = aptId;
      const promo = await promotionsApi.validateCode(code, currentApartmentId);

      // Success
      appliedPromotion = promo;
      const discountPct  = Number(promo.discountPrecentage) || 0;
      const origPrice    = selectedUnit?.unitPrice || 0;
      const discountAmt  = (origPrice * discountPct) / 100;
      const finalPrice   = origPrice - discountAmt;

      // Show discount preview
      document.getElementById('discount-original').textContent = formatPrice(origPrice);
      document.getElementById('discount-amount').textContent   = `-${formatPrice(discountAmt)} (${discountPct}% off)`;
      document.getElementById('discount-final').textContent    = formatPrice(finalPrice);
      discountPreviewRow.style.display = 'block';

      promoFeedback.style.color   = 'var(--success)';
      promoFeedback.textContent   = `✓ "${promo.promotionTitle}" applied successfully!`;
      promoFeedback.style.display = 'block';

      // Recalculate schedule with discounted price
      calculateBookingSchedule();

    } catch (err) {
      promoFeedback.style.color   = 'var(--danger)';
      promoFeedback.textContent   = `✗ ${err.message || 'Invalid promotion code.'}`;
      promoFeedback.style.display = 'block';
      discountPreviewRow.style.display = 'none';
      appliedPromotion = null;
      calculateBookingSchedule();
    } finally {
      applyPromoBtn.disabled    = false;
      applyPromoBtn.textContent = 'Apply Code';
    }
  });

  // Clear promo when code is changed manually
  promoInput?.addEventListener('input', () => {
    if (appliedPromotion) {
      appliedPromotion = null;
      discountPreviewRow.style.display = 'none';
      promoFeedback.style.display = 'none';
      calculateBookingSchedule();
    }
  });

  // ── Booking Form Submit ───────────────────────────────────────────────────────

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const user          = getCurrentUser();
    const ratio         = parseInt(modalDownPaymentRatio?.value || '20', 10);
    const months        = parseInt(modalMonths?.value || '36', 10);
    const effectivePrice= getEffectivePrice();
    const downPayment   = (effectivePrice * ratio) / 100;
    const paymentMethod = document.getElementById('modal-payment-method')?.value || 'Bank Transfer';
    const additions     = document.getElementById('modal-additions')?.value || 'Standard Luxury Finish';
    const proofFile     = document.getElementById('modal-payment-proof')?.files[0]?.name || `proof_${selectedUnit.unitId}.pdf`;
    const promoCode     = appliedPromotion?.promotionCode || promoInput?.value?.trim().toUpperCase() || null;

    const submitBtn = document.getElementById('submit-booking-btn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Processing reservation…'; }

    try {
      await store.createBooking({
        uid:            user?.uid || 'USR-EXT-5001',
        userName:       user ? `${user.firstName} ${user.lastName}` : 'Guest Buyer',
        userEmail:      user?.email || 'buyer@livingora.lk',
        unitId:         selectedUnit.unitId,
        unitLocation:   selectedUnit.location,
        paymentAmount:  effectivePrice,
        downPayment:    downPayment,
        paymentMethod,
        paymentProof:   proofFile,
        additions,
        months,
        unitPrice:      selectedUnit.unitPrice,
        promotionCode:  promoCode     // ← passed to backend for discount application
      });

      if (bookingForm)       bookingForm.style.display = 'none';
      if (bookingSuccessBox) bookingSuccessBox.style.display = 'block';

      setTimeout(() => {
        closeModal('booking-modal');
        renderComplexUnits();
      }, 2500);

    } catch (err) {
      alert(err.message || 'Failed to submit reservation.');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Unit Reservation'; }
    }
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return dateStr; }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});

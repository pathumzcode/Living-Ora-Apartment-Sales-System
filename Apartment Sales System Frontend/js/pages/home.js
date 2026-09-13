import { store } from '../store.js';
import { renderNavbar, renderFooter, formatPrice } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('home');
  renderFooter();

  const featuredContainer = document.getElementById('featured-apartments-grid');
  const topPicksContainer = document.getElementById('top-picks-units-grid');
  const searchInput = document.getElementById('home-search-input');
  const locationSelect = document.getElementById('home-location-select');
  const bedsSelect = document.getElementById('home-beds-select');
  const priceSelect = document.getElementById('home-price-select');
  const searchBtn = document.getElementById('home-search-btn');

  // Search tab pills toggling
  const searchTabs = document.querySelectorAll('.search-tab-pill');
  searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      searchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Render Flagship Developments (matching reference card layout)
  function renderFeatured(apartmentsList) {
    if (!featuredContainer) return;
    if (apartmentsList.length === 0) {
      featuredContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-muted);">
          No luxury developments match your search criteria. Try adjusting the filters.
        </div>`;
      return;
    }

    featuredContainer.innerHTML = apartmentsList.slice(0, 3).map(apt => `
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${apt.images || 'images/luxury-villa-hero.jpg'}" alt="${apt.name}" class="property-card-img" />
          <span class="property-card-badge">${apt.unitStatus || 'Exclusive Portfolio'}</span>
          <a href="apartment-detail.html?id=${apt.id || apt.apartmentId}" class="property-card-action-btn" title="View Details">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${apt.name}</h3>
          <p class="property-card-location">📍 ${apt.location}</p>
          <div class="property-card-specs">
            <span>🏢 ${apt.numOfFloors || 15} Floors</span>
            <span>🏊 ${apt.numOfSwimmingPool || 1} Pool</span>
            <span>🏋️ ${apt.numOfGYM || 1} Gym</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Price Range</div>
              <div class="property-card-price">${apt.priceRange || '$350k - $950k'}</div>
            </div>
            <a href="apartment-detail.html?id=${apt.id || apt.apartmentId}" class="btn btn-sm btn-primary">
              View Complex &rarr;
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Render Top Picks / Available Suite Units
  function renderTopPicks(unitsList) {
    if (!topPicksContainer) return;
    if (unitsList.length === 0) {
      topPicksContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-muted);">
          All suite units are currently reserved. Check back soon or contact concierge.
        </div>`;
      return;
    }

    topPicksContainer.innerHTML = unitsList.slice(0, 3).map(u => `
      <article class="property-card">
        <div class="property-card-img-wrap">
          <img src="${u.images || 'images/luxury-condo-exterior.jpg'}" alt="${u.title}" class="property-card-img" />
          <span class="property-card-badge badge-success">Immediate Booking</span>
          <a href="apartments.html?tab=units" class="property-card-action-btn" title="Reserve Unit">
            &nearr;
          </a>
        </div>
        <div class="property-card-body">
          <h3 class="property-card-title">${u.title || ('Suite #' + u.unitNumber)}</h3>
          <p class="property-card-location">📍 ${u.complexName || 'Marina Tower'}, Floor ${u.floorNumber || 4}</p>
          <div class="property-card-specs">
            <span>🛏️ ${u.numberOfBedrooms || 3} Beds</span>
            <span>🚿 ${u.numberOfWashrooms || 2} Baths</span>
            <span>📐 ${u.squareFeet || 1650} sqft</span>
          </div>
          <div class="property-card-footer">
            <div>
              <div class="property-card-price-label">Suite Price</div>
              <div class="property-card-price">${formatPrice(u.price || 420000)}</div>
            </div>
            <a href="apartments.html?tab=units" class="btn btn-sm btn-gold">
              Reserve Suite
            </a>
          </div>
        </div>
      </article>
    `).join('');
  }

  let allApartments = store.getApartments();
  let allUnits = store.getUnits().filter(u => u.status === 'AVAILABLE' || !u.status);
  
  renderFeatured(allApartments);
  renderTopPicks(allUnits);

  function syncData() {
    allApartments = store.getApartments();
    allUnits = store.getUnits().filter(u => u.status === 'AVAILABLE' || !u.status);
    applyFilter();
  }

  store.subscribe(syncData);
  if (store.ready) {
    store.ready.then(syncData);
  }

  function applyFilter() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const loc = (locationSelect?.value || '').toLowerCase().trim();
    const beds = Number(bedsSelect?.value || 0);
    const maxPrice = Number(priceSelect?.value || 0);

    const filteredApts = allApartments.filter(apt => {
      const matchText = `${apt.name} ${apt.location} ${apt.about}`.toLowerCase();
      const matchesQ = !q || matchText.includes(q);
      const matchesLoc = !loc || apt.location.toLowerCase().includes(loc);
      return matchesQ && matchesLoc;
    });

    const filteredUnits = allUnits.filter(u => {
      const matchText = `${u.title || ''} ${u.complexName || ''} ${u.unitNumber || ''}`.toLowerCase();
      const matchesQ = !q || matchText.includes(q);
      const matchesBeds = !beds || (u.numberOfBedrooms >= beds);
      const matchesPrice = !maxPrice || (u.price <= maxPrice);
      return matchesQ && matchesBeds && matchesPrice;
    });

    renderFeatured(filteredApts);
    renderTopPicks(filteredUnits);
  }

  if (searchBtn) searchBtn.addEventListener('click', applyFilter);
  if (searchInput) searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') applyFilter();
  });
  if (locationSelect) locationSelect.addEventListener('change', applyFilter);
  if (bedsSelect) bedsSelect.addEventListener('change', applyFilter);
  if (priceSelect) priceSelect.addEventListener('change', applyFilter);

  // Inquiry form submission handler
  const inquiryForm = document.getElementById('home-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiry-fullname')?.value;
      alert(`Thank you, ${name}! Your inquiry has been dispatched to our senior real estate advisors. We will contact you within 24 hours.`);
      inquiryForm.reset();
    });
  }
});

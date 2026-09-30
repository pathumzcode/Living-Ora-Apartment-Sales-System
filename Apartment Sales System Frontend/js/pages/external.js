import { store } from '../store.js';
import { renderNavbar, renderFooter, formatPrice, setupModalListeners } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('external');
  renderFooter();
  setupModalListeners();

  const externalGrid = document.getElementById('external-apartments-grid');
  const externalForm = document.getElementById('add-external-apt-form');
  const alertBox = document.getElementById('external-alert');

  function renderExternal() {
    const list = store.getExternalApartments();
    if (!externalGrid) return;
    if (list.length === 0) {
      externalGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No resale listings posted yet.</p>`;
      return;
    }

    externalGrid.innerHTML = list.map(item => `
      <article class="card">
        <div class="card-img-wrap">
          <img src="${item.images || 'images/luxury-condo-exterior.jpg'}" alt="${item.location}" class="card-img" />
          <div class="card-badge-pos">
            <span class="badge badge-gold">Resale / Agent</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${item.location}</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.75rem;">${item.about || ''}</p>
          <div class="card-meta">
            <span>🛏️ ${item.numOfRooms || 2} Rooms</span>
            <span>❄️ ${item.acOrNonAC || 'AC'}</span>
            <span>📝 ${item.additionalInfo || 'Verified Owner Listing'}</span>
          </div>
          <div class="card-footer">
            <div>
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Listed Price</small>
              <strong class="card-price">${formatPrice(item.price)}</strong>
            </div>
            <div>
              <small style="display: block; color: var(--text-dim); font-size: 0.75rem;">Est. Down Payment</small>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${formatPrice(item.downPayment || item.price * 0.1)}</strong>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderExternal();

  externalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('ex-location')?.value;
    const price = Number(document.getElementById('ex-price')?.value) || 200000;
    const downPayment = Number(document.getElementById('ex-downpayment')?.value) || price * 0.1;
    const numOfRooms = Number(document.getElementById('ex-rooms')?.value) || 2;
    const acOrNonAC = document.getElementById('ex-ac')?.value || 'AC';
    const about = document.getElementById('ex-about')?.value || '';
    const additionalInfo = document.getElementById('ex-info')?.value || 'Direct owner listing';

    try {
      await store.addExternalApartment({
        location,
        price,
        downPayment,
        numOfRooms,
        acOrNonAC,
        about,
        additionalInfo,
        images: 'images/luxury-condo-exterior.jpg'
      });

      if (alertBox) {
        alertBox.textContent = 'External apartment listing added successfully!';
        alertBox.className = 'alert alert-success';
        alertBox.style.display = 'block';
        setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
      }

      externalForm.reset();
      renderExternal();
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Failed to add listing.';
        alertBox.className = 'alert alert-danger';
        alertBox.style.display = 'block';
      }
    }
  });
});

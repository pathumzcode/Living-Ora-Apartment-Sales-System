import { store } from '../store.js';
import { requireAuth, getCurrentUser, logout, ROLES, ROLE_LABELS } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const allowedRoles = [
    ROLES.ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.MARKETING_MANAGER,
    ROLES.CUSTOMER_RELATIONS_OFFICER,
    ROLES.FINANCE_PAYMENTS_OFFICER,
    ROLES.PROPERTY_DEVELOPMENT_MANAGER,
    ROLES.OPERATIONS_DIRECTOR
  ];

  if (!requireAuth(allowedRoles)) return;

  renderNavbar();
  renderFooter();
  setupModalListeners();

  const user = getCurrentUser();

  // Header information
  const staffNameEl = document.getElementById('staff-name');
  const staffRoleEl = document.getElementById('staff-role-label');
  const staffIdEl = document.getElementById('staff-id');

  if (staffNameEl) staffNameEl.textContent = user.name || `${user.firstName} ${user.lastName}`;
  if (staffRoleEl) staffRoleEl.textContent = ROLE_LABELS[user.role] || user.role;
  if (staffIdEl) staffIdEl.textContent = user.empId || user.uid || 'EMP-001';

  // KPIs
  function updateKPIs() {
    const bookings = store.getBookings();
    const units = store.getUnits();
    const apts = store.getApartments();

    const confirmedRevenue = bookings
      .filter(b => b.status === 'Approved')
      .reduce((sum, b) => sum + (Number(b.paymentAmount) || 0), 0);
    const pendingCount = bookings.filter(b => b.status === 'Pending Approval').length;
    const availableCount = units.filter(u => (u.availability || u.avilability) === 'Available').length;

    const revEl = document.getElementById('kpi-revenue');
    const pendEl = document.getElementById('kpi-pending');
    const availEl = document.getElementById('kpi-available');
    const aptsEl = document.getElementById('kpi-complexes');

    if (revEl) revEl.textContent = formatPrice(confirmedRevenue);
    if (pendEl) pendEl.textContent = `${pendingCount} Requests`;
    if (availEl) availEl.textContent = `${availableCount} / ${units.length} Units`;
    if (aptsEl) aptsEl.textContent = `${apts.length} Complexes`;
  }

  // Tabs
  let activeTab = 'bookings';
  const tabBookingsBtn = document.getElementById('tab-bookings-btn');
  const tabInventoryBtn = document.getElementById('tab-inventory-btn');
  const bookingsPanel = document.getElementById('bookings-panel');
  const inventoryPanel = document.getElementById('inventory-panel');

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'inventory') {
      tabInventoryBtn?.classList.add('active');
      tabBookingsBtn?.classList.remove('active');
      inventoryPanel?.removeAttribute('hidden');
      bookingsPanel?.setAttribute('hidden', 'true');
    } else {
      tabBookingsBtn?.classList.add('active');
      tabInventoryBtn?.classList.remove('active');
      bookingsPanel?.removeAttribute('hidden');
      inventoryPanel?.setAttribute('hidden', 'true');
    }
  }

  tabBookingsBtn?.addEventListener('click', () => switchTab('bookings'));
  tabInventoryBtn?.addEventListener('click', () => switchTab('inventory'));

  // Bookings List Table
  const bookingsTbody = document.getElementById('bookings-tbody');
  function renderBookings() {
    if (!bookingsTbody) return;
    const bookings = store.getBookings();

    if (bookings.length === 0) {
      bookingsTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No reservation requests found.</td></tr>`;
      return;
    }

    bookingsTbody.innerHTML = bookings.map(b => {
      let badgeClass = 'badge-warning';
      if (b.status === 'Approved') badgeClass = 'badge-success';
      if (b.status === 'Rejected') badgeClass = 'badge-danger';

      return `
        <tr>
          <td><strong>${b.bookingId}</strong></td>
          <td>
            <div>${b.userName || 'Client'}</div>
            <small style="color: var(--text-dim);">${b.userEmail || ''}</small>
          </td>
          <td>${b.unitLocation || b.unitId}</td>
          <td><strong>${formatPrice(b.downPayment)}</strong></td>
          <td>${b.bookingDate}</td>
          <td><span class="badge ${badgeClass}">${b.status}</span></td>
          <td>
            ${b.status === 'Pending Approval' ? `
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-sm btn-success action-approve-btn" data-id="${b.bookingId}">Approve</button>
                <button class="btn btn-sm btn-danger action-reject-btn" data-id="${b.bookingId}">Reject</button>
              </div>
            ` : `
              <span style="color: var(--text-dim); font-size: 0.85rem;">Completed</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    // Attach approve / reject handlers
    document.querySelectorAll('.action-approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await store.updateBookingStatus(id, 'Approved');
        renderBookings();
        renderInventory();
        updateKPIs();
      });
    });

    document.querySelectorAll('.action-reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await store.updateBookingStatus(id, 'Rejected');
        renderBookings();
        renderInventory();
        updateKPIs();
      });
    });
  }

  // Inventory Table
  const inventoryTbody = document.getElementById('inventory-tbody');
  function renderInventory() {
    if (!inventoryTbody) return;
    const units = store.getUnits();

    inventoryTbody.innerHTML = units.map(u => {
      const isAvail = (u.availability || u.avilability) === 'Available';
      const badgeClass = isAvail ? 'badge-available' : ((u.availability || u.avilability) === 'Reserved' ? 'badge-warning' : 'badge-danger');

      return `
        <tr>
          <td><strong>${u.unitId}</strong></td>
          <td>${u.location}</td>
          <td>Floor ${u.floor}</td>
          <td>${u.numOfBeds} Beds, ${u.numOfBathRooms} Baths</td>
          <td><strong>${formatPrice(u.unitPrice)}</strong></td>
          <td><span class="badge ${badgeClass}">${u.availability || u.avilability || 'Available'}</span></td>
          <td>
            <select class="form-select form-select-sm unit-status-select" data-unit-id="${u.unitId}" style="padding: 0.25rem 0.5rem; font-size: 0.85rem; width: auto;">
              <option value="Available" ${u.availability === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Reserved" ${u.availability === 'Reserved' ? 'selected' : ''}>Reserved</option>
              <option value="Sold" ${u.availability === 'Sold' ? 'selected' : ''}>Sold</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.unit-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const unitId = sel.getAttribute('data-unit-id');
        const newStatus = e.target.value;
        await store.updateUnitStatus(unitId, newStatus);
        renderInventory();
        updateKPIs();
      });
    });
  }

  updateKPIs();
  renderBookings();
  renderInventory();

  // Add Complex Modal Form
  const addAptBtn = document.getElementById('open-add-apt-modal-btn');
  const addAptForm = document.getElementById('add-apartment-form');
  addAptBtn?.addEventListener('click', () => openModal('add-apt-modal'));

  addAptForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('apt-form-name')?.value;
    const location = document.getElementById('apt-form-location')?.value;
    const floors = Number(document.getElementById('apt-form-floors')?.value) || 15;
    const pools = Number(document.getElementById('apt-form-pools')?.value) || 1;
    const gyms = Number(document.getElementById('apt-form-gyms')?.value) || 1;
    const priceRange = document.getElementById('apt-form-pricerange')?.value || '$250,000 - $800,000';
    const about = document.getElementById('apt-form-about')?.value || '';

    await store.addApartment({
      name,
      location,
      numOfFloors: floors,
      numOfSwimmingPool: pools,
      numOfGYM: gyms,
      priceRange,
      about,
      images: 'images/luxury-complex-marina.jpg',
      floorPlan: 'images/luxury-interior-lounge.jpg',
      numOfUnitsAvilable: 10,
      unitStatus: 'Available'
    });

    closeModal('add-apt-modal');
    addAptForm.reset();
    updateKPIs();
    populateApartmentSelects();
    alert('New apartment complex added successfully!');
  });

  // Add Unit Modal Form
  const addUnitBtn = document.getElementById('open-add-unit-modal-btn');
  const addUnitForm = document.getElementById('add-unit-form');
  const unitAptSelect = document.getElementById('unit-form-apt');

  function populateApartmentSelects() {
    if (!unitAptSelect) return;
    const apts = store.getApartments();
    unitAptSelect.innerHTML = apts.map(a => `<option value="${a.id || a.apartmentId}">${a.name}</option>`).join('');
  }
  populateApartmentSelects();

  addUnitBtn?.addEventListener('click', () => openModal('add-unit-modal'));

  addUnitForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aptId = unitAptSelect?.value || 'APT-LO-001';
    const location = document.getElementById('unit-form-location')?.value;
    const floor = Number(document.getElementById('unit-form-floor')?.value) || 1;
    const price = Number(document.getElementById('unit-form-price')?.value) || 300000;
    const beds = Number(document.getElementById('unit-form-beds')?.value) || 2;
    const baths = Number(document.getElementById('unit-form-baths')?.value) || 2;
    const ac = document.getElementById('unit-form-ac')?.value || 'AC';
    const furnitures = document.getElementById('unit-form-furnitures')?.value || 'Fully Furnished';
    const about = document.getElementById('unit-form-about')?.value || '';

    await store.addUnit({
      apartment_id: aptId,
      location,
      floor,
      unitPrice: price,
      numOfBeds: beds,
      numOfBathRooms: baths,
      numOfRooms: beds,
      acOrNonAC: ac,
      furnitures,
      about,
      availability: 'Available',
      images: 'images/luxury-interior-lounge.jpg'
    });

    closeModal('add-unit-modal');
    addUnitForm.reset();
    renderInventory();
    updateKPIs();
    alert('New suite unit added to inventory!');
  });
});

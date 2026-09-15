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

  // Operations Director / Sales Manager specialized views
  const isOpsDirectorOrAdmin = user.role === ROLES.OPERATIONS_DIRECTOR || user.role === ROLES.ADMIN;
  const isSalesManagerOrOps = user.role === ROLES.SALES_MANAGER || isOpsDirectorOrAdmin;

  const tabBookingsBtn = document.getElementById('tab-bookings-btn');
  const tabInventoryBtn = document.getElementById('tab-inventory-btn');
  const tabOperationsBtn = document.getElementById('tab-operations-btn');
  const tabPromotionsBtn = document.getElementById('tab-promotions-btn');

  const bookingsPanel = document.getElementById('bookings-panel');
  const inventoryPanel = document.getElementById('inventory-panel');
  const operationsPanel = document.getElementById('operations-panel');
  const promotionsPanel = document.getElementById('promotions-panel');

  if (isOpsDirectorOrAdmin && tabOperationsBtn) {
    tabOperationsBtn.style.display = 'inline-block';
  }
  if (isSalesManagerOrOps && tabPromotionsBtn) {
    tabPromotionsBtn.style.display = 'inline-block';
  }

  function switchTab(tab) {
    [tabBookingsBtn, tabInventoryBtn, tabOperationsBtn, tabPromotionsBtn].forEach(b => b?.classList.remove('active'));
    [bookingsPanel, inventoryPanel, operationsPanel, promotionsPanel].forEach(p => p?.setAttribute('hidden', 'true'));

    if (tab === 'inventory') {
      tabInventoryBtn?.classList.add('active');
      inventoryPanel?.removeAttribute('hidden');
    } else if (tab === 'operations') {
      tabOperationsBtn?.classList.add('active');
      operationsPanel?.removeAttribute('hidden');
      renderOperationsStaff();
    } else if (tab === 'promotions') {
      tabPromotionsBtn?.classList.add('active');
      promotionsPanel?.removeAttribute('hidden');
      renderPromotions();
    } else {
      tabBookingsBtn?.classList.add('active');
      bookingsPanel?.removeAttribute('hidden');
    }
  }

  tabBookingsBtn?.addEventListener('click', () => switchTab('bookings'));
  tabInventoryBtn?.addEventListener('click', () => switchTab('inventory'));
  tabOperationsBtn?.addEventListener('click', () => switchTab('operations'));
  tabPromotionsBtn?.addEventListener('click', () => switchTab('promotions'));

  // Render Operations Staff (Accessible by Operations Director & Admin)
  async function renderOperationsStaff() {
    const tbody = document.getElementById('ops-staff-tbody');
    const countEl = document.getElementById('ops-staff-count');
    if (!tbody) return;

    try {
      const response = await fetch('http://localhost:8080/api/users/internal');
      if (response.ok) {
        const staffList = await response.json();
        if (countEl) countEl.textContent = `${staffList.length} Active Staff`;
        tbody.innerHTML = staffList.map(s => `
          <tr>
            <td><strong style="color: var(--primary); font-family: monospace;">${s.empId}</strong></td>
            <td><strong>${s.firstName} ${s.lastName}</strong></td>
            <td><span class="badge badge-gold">${ROLE_LABELS[s.role] || s.role}</span></td>
            <td>${s.companyEmail || s.email}</td>
            <td>${s.phoneNumber || '-'}</td>
            <td>${s.serviceYears ?? 1} Years</td>
          </tr>
        `).join('');
        return;
      }
    } catch (e) {
      console.warn('Could not fetch live staff list for operations roster:', e);
    }

    // Fallback sample roster
    const sampleStaff = [
      { empId: 'EMP-SALES-1001', name: 'Sales Manager', role: 'SALES_MANAGER', email: 'sales.manager@livingora.lk', phone: '0711000001', years: 5 },
      { empId: 'EMP-OPS-1001', name: 'Operations Director', role: 'OPERATIONS_DIRECTOR', email: 'operations.director@livingora.lk', phone: '0711000006', years: 8 },
      { empId: 'EMP-FIN-1001', name: 'Finance Officer', role: 'FINANCE_PAYMENTS_OFFICER', email: 'finance.officer@livingora.lk', phone: '0711000004', years: 4 }
    ];
    if (countEl) countEl.textContent = `${sampleStaff.length} Staff`;
    tbody.innerHTML = sampleStaff.map(s => `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">${s.empId}</strong></td>
        <td><strong>${s.name}</strong></td>
        <td><span class="badge badge-gold">${ROLE_LABELS[s.role] || s.role}</span></td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td>${s.years} Years</td>
      </tr>
    `).join('');
  }

  // Render Promotions (Coordinated by Sales Managers & Operations Directors)
  async function renderPromotions() {
    const tbody = document.getElementById('ops-promotions-tbody');
    if (!tbody) return;

    try {
      const res = await fetch('http://localhost:8080/api/promotions');
      if (res.ok) {
        const promos = await res.json();
        if (Array.isArray(promos) && promos.length > 0) {
          tbody.innerHTML = promos.map(p => `
            <tr>
              <td><strong style="color: var(--primary); font-family: monospace;">${p.promotionCode || p.promotionId}</strong></td>
              <td>${p.promotionTitle}</td>
              <td><span class="badge badge-gold">${p.promotionType}</span></td>
              <td><strong style="color: var(--success);">${p.discountPrecentage || 0}%</strong></td>
              <td>${p.startDate || ''} &rarr; ${p.endDate || ''}</td>
              <td>Sales Agents & Marketing</td>
            </tr>
          `).join('');
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch live promotions:', e);
    }

    tbody.innerHTML = `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">PROMO-LORA2026</strong></td>
        <td>Luxury Penthouse Seasonal Launch</td>
        <td><span class="badge badge-gold">Seasonal Discount</span></td>
        <td><strong style="color: var(--success);">10.00%</strong></td>
        <td>2026-01-01 &rarr; 2026-12-31</td>
        <td>Sales Agents & Operations Coordinated</td>
      </tr>
    `;
  }

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

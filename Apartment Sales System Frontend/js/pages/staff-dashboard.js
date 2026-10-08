import { store } from '../store.js';
import { unitsApi } from '../api.js';
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
  const staffIdEl   = document.getElementById('staff-id');

  if (staffNameEl) staffNameEl.textContent = user.name || `${user.firstName} ${user.lastName}`;
  if (staffRoleEl) staffRoleEl.textContent = ROLE_LABELS[user.role] || user.role;
  if (staffIdEl)   staffIdEl.textContent   = user.empId || user.uid || 'EMP-001';

  // KPIs
  function updateKPIs() {
    const bookings = store.getBookings();
    const units    = store.getUnits();
    const apts     = store.getApartments();

    const confirmedRevenue = bookings
      .filter(b => b.status === 'Approved')
      .reduce((sum, b) => sum + (Number(b.paymentAmount) || 0), 0);
    const pendingCount   = bookings.filter(b => b.status === 'Pending Approval').length;
    const availableCount = units.filter(u => (u.availability || u.avilability) === 'Available').length;

    const revEl   = document.getElementById('kpi-revenue');
    const pendEl  = document.getElementById('kpi-pending');
    const availEl = document.getElementById('kpi-available');
    const aptsEl  = document.getElementById('kpi-complexes');

    if (revEl)   revEl.textContent   = formatPrice(confirmedRevenue);
    if (pendEl)  pendEl.textContent  = `${pendingCount} Requests`;
    if (availEl) availEl.textContent = `${availableCount} / ${units.length} Units`;
    if (aptsEl)  aptsEl.textContent  = `${apts.length} Complexes`;
  }

  // Operations Director / Sales Manager specialized views
  const isOpsDirectorOrAdmin   = user.role === ROLES.OPERATIONS_DIRECTOR || user.role === ROLES.ADMIN;
  const isSalesManagerOrOps    = user.role === ROLES.SALES_MANAGER || isOpsDirectorOrAdmin;

  const tabBookingsBtn    = document.getElementById('tab-bookings-btn');
  const tabInventoryBtn   = document.getElementById('tab-inventory-btn');
  const tabOperationsBtn  = document.getElementById('tab-operations-btn');
  const tabPromotionsBtn  = document.getElementById('tab-promotions-btn');

  const bookingsPanel    = document.getElementById('bookings-panel');
  const inventoryPanel   = document.getElementById('inventory-panel');
  const operationsPanel  = document.getElementById('operations-panel');
  const promotionsPanel  = document.getElementById('promotions-panel');

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

  tabBookingsBtn?.addEventListener('click',   () => switchTab('bookings'));
  tabInventoryBtn?.addEventListener('click',  () => switchTab('inventory'));
  tabOperationsBtn?.addEventListener('click', () => switchTab('operations'));
  tabPromotionsBtn?.addEventListener('click', () => switchTab('promotions'));

  // ── Operations Staff ────────────────────────────────────────────────────────

  async function renderOperationsStaff() {
    const tbody   = document.getElementById('ops-staff-tbody');
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
      { empId: 'EMP-SALES-1001', name: 'Sales Manager',       role: 'SALES_MANAGER',          email: 'sales.manager@livingora.lk',       phone: '0711000001', years: 5 },
      { empId: 'EMP-OPS-1001',   name: 'Operations Director', role: 'OPERATIONS_DIRECTOR',     email: 'operations.director@livingora.lk', phone: '0711000006', years: 8 },
      { empId: 'EMP-FIN-1001',   name: 'Finance Officer',     role: 'FINANCE_PAYMENTS_OFFICER',email: 'finance.officer@livingora.lk',     phone: '0711000004', years: 4 }
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

  // ── Promotions ──────────────────────────────────────────────────────────────

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
              <td>Sales Agents &amp; Marketing</td>
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
        <td>Sales Agents &amp; Operations Coordinated</td>
      </tr>
    `;
  }

  // ── Bookings Table ──────────────────────────────────────────────────────────

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
      if (b.status === 'Approved')  badgeClass = 'badge-success';
      if (b.status === 'Rejected')  badgeClass = 'badge-danger';

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
                <button class="btn btn-sm btn-danger action-reject-btn"  data-id="${b.bookingId}">Reject</button>
              </div>
            ` : `
              <span style="color: var(--text-dim); font-size: 0.85rem;">Completed</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

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

  // ── Inventory Table (enhanced with Edit / Delete / Search) ──────────────────

  const inventoryTbody = document.getElementById('inventory-tbody');

  function renderInventory(units = null) {
    if (!inventoryTbody) return;
    const data = units !== null ? units : store.getUnits();

    if (data.length === 0) {
      inventoryTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No inventory units found.</td></tr>`;
      return;
    }

    inventoryTbody.innerHTML = data.map(u => {
      const avail = u.availability || u.avilability || 'Available';
      const badgeClass =
        avail === 'Available' ? 'badge-available' :
        avail === 'Reserved'  ? 'badge-warning'   : 'badge-danger';

      return `
        <tr>
          <td><strong>${u.unitId}</strong></td>
          <td>${u.location || '-'}</td>
          <td>Floor ${u.floor ?? '-'}</td>
          <td>${u.numOfBeds ?? '-'} Beds, ${u.numOfBathRooms ?? '-'} Baths</td>
          <td><strong>${formatPrice(u.unitPrice)}</strong></td>
          <td><span class="badge ${badgeClass}">${avail}</span></td>
          <td>
            <select class="form-select form-select-sm unit-status-select"
                    data-unit-id="${u.unitId}"
                    style="padding: 0.25rem 0.5rem; font-size: 0.85rem; width: auto;">
              <option value="Available" ${avail === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Reserved"  ${avail === 'Reserved'  ? 'selected' : ''}>Reserved</option>
              <option value="Sold"      ${avail === 'Sold'      ? 'selected' : ''}>Sold</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-sm btn-secondary inv-edit-btn"   data-unit-id="${u.unitId}">Edit</button>
              <button class="btn btn-sm btn-danger    inv-delete-btn" data-unit-id="${u.unitId}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status dropdown change
    document.querySelectorAll('.unit-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const unitId    = sel.getAttribute('data-unit-id');
        const newStatus = e.target.value;
        try {
          await store.updateUnitStatus(unitId, newStatus);
          renderInventory();
          updateKPIs();
        } catch (err) {
          alert(`Error updating status: ${err.message}`);
        }
      });
    });

    // Edit button → open modal prefilled
    document.querySelectorAll('.inv-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.getAttribute('data-unit-id');
        const unit   = store.getUnits().find(u => u.unitId === unitId);
        if (!unit) return;

        document.getElementById('edit-unit-id').value        = unit.unitId;
        document.getElementById('edit-unit-apt').value       = unit.apartmentId || unit.apartment_id || '';
        document.getElementById('edit-unit-location').value  = unit.location || '';
        document.getElementById('edit-unit-floor').value     = unit.floor ?? '';
        document.getElementById('edit-unit-price').value     = unit.unitPrice ?? '';
        document.getElementById('edit-unit-beds').value      = unit.numOfBeds ?? '';
        document.getElementById('edit-unit-baths').value     = unit.numOfBathRooms ?? '';
        document.getElementById('edit-unit-ac').value        = unit.acOrNonAC || 'AC';
        document.getElementById('edit-unit-furnitures').value = unit.furnitures || 'Fully Furnished';
        document.getElementById('edit-unit-status').value    = unit.availability || unit.avilability || 'Available';
        document.getElementById('edit-unit-about').value     = unit.about || '';

        openModal('edit-unit-modal');
      });
    });

    // Delete button → open confirmation modal
    document.querySelectorAll('.inv-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.getAttribute('data-unit-id');
        pendingDeleteUnitId = unitId;
        const codeEl = document.getElementById('delete-unit-code');
        if (codeEl) codeEl.textContent = unitId;
        openModal('delete-unit-modal');
      });
    });
  }

  // ── Edit Unit Form Submit ───────────────────────────────────────────────────

  const editUnitForm = document.getElementById('edit-unit-form');
  editUnitForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const unitId = document.getElementById('edit-unit-id')?.value;
    if (!unitId) return;

    const payload = {
      apartmentId:    document.getElementById('edit-unit-apt')?.value.trim() || null,
      location:       document.getElementById('edit-unit-location')?.value.trim(),
      floor:          parseInt(document.getElementById('edit-unit-floor')?.value, 10) || null,
      unitPrice:      parseFloat(document.getElementById('edit-unit-price')?.value) || null,
      numOfBeds:      parseInt(document.getElementById('edit-unit-beds')?.value, 10) || null,
      numOfBathRooms: parseInt(document.getElementById('edit-unit-baths')?.value, 10) || null,
      acOrNonAC:      document.getElementById('edit-unit-ac')?.value || null,
      furnitures:     document.getElementById('edit-unit-furnitures')?.value || null,
      availability:   document.getElementById('edit-unit-status')?.value || null,
      about:          document.getElementById('edit-unit-about')?.value.trim() || null
    };

    try {
      await store.updateUnit(unitId, payload);
      closeModal('edit-unit-modal');
      editUnitForm.reset();
      renderInventory();
      updateKPIs();
      alert(`Unit ${unitId} updated successfully!`);
    } catch (err) {
      alert(`Error updating unit: ${err.message}`);
    }
  });

  // ── Delete Unit Confirmation ────────────────────────────────────────────────

  let pendingDeleteUnitId = null;

  document.getElementById('confirm-delete-unit-btn')?.addEventListener('click', async () => {
    if (!pendingDeleteUnitId) return;
    const id = pendingDeleteUnitId;
    pendingDeleteUnitId = null;
    closeModal('delete-unit-modal');

    try {
      await store.deleteUnit(id);
      renderInventory();
      updateKPIs();
      alert(`Unit ${id} deleted successfully.`);
    } catch (err) {
      alert(`Cannot delete unit: ${err.message}`);
    }
  });

  // ── Search / Filter Bar ────────────────────────────────────────────────────

  document.getElementById('inv-search-btn')?.addEventListener('click', async () => {
    const aptId      = document.getElementById('inv-filter-apt')?.value.trim() || '';
    const statusVal  = document.getElementById('inv-filter-status')?.value || '';

    try {
      const results = await unitsApi.search({
        apartmentId:  aptId  || undefined,
        availability: statusVal || undefined
      });
      renderInventory(results);
    } catch (err) {
      console.warn('Search failed, using local data:', err.message);
      // Fallback: client-side filter from store
      let data = store.getUnits();
      if (aptId)     data = data.filter(u => (u.apartmentId || u.apartment_id || '') === aptId);
      if (statusVal) data = data.filter(u => (u.availability || u.avilability) === statusVal);
      renderInventory(data);
    }
  });

  document.getElementById('inv-reset-btn')?.addEventListener('click', () => {
    const aptInput    = document.getElementById('inv-filter-apt');
    const statusInput = document.getElementById('inv-filter-status');
    if (aptInput)    aptInput.value    = '';
    if (statusInput) statusInput.value = '';
    renderInventory();
  });

  // ── Initial Render ─────────────────────────────────────────────────────────

  updateKPIs();
  renderBookings();
  renderInventory();

  // Subscribe to store changes to keep UI in sync
  store.subscribe(() => {
    updateKPIs();
    renderBookings();
    renderInventory();
  });

  // ── Add Complex Modal Form ─────────────────────────────────────────────────

  const addAptBtn  = document.getElementById('open-add-apt-modal-btn');
  const addAptForm = document.getElementById('add-apartment-form');
  addAptBtn?.addEventListener('click', () => openModal('add-apt-modal'));

  addAptForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name       = document.getElementById('apt-form-name')?.value;
    const location   = document.getElementById('apt-form-location')?.value;
    const floors     = Number(document.getElementById('apt-form-floors')?.value)    || 15;
    const pools      = Number(document.getElementById('apt-form-pools')?.value)     || 1;
    const gyms       = Number(document.getElementById('apt-form-gyms')?.value)      || 1;
    const priceRange = document.getElementById('apt-form-pricerange')?.value || '$250,000 - $800,000';
    const about      = document.getElementById('apt-form-about')?.value || '';

    try {
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
    } catch (err) {
      alert(`Error adding complex: ${err.message}`);
    }
  });

  // ── Add Unit Modal Form ────────────────────────────────────────────────────

  const addUnitBtn   = document.getElementById('open-add-unit-modal-btn');
  const addUnitForm  = document.getElementById('add-unit-form');
  const unitAptSelect = document.getElementById('unit-form-apt');

  function populateApartmentSelects() {
    if (!unitAptSelect) return;
    const apts = store.getApartments();
    unitAptSelect.innerHTML = apts.map(a =>
      `<option value="${a.id || a.apartmentId}">${a.name || a.location || a.apartmentId}</option>`
    ).join('');
  }
  populateApartmentSelects();

  addUnitBtn?.addEventListener('click', () => openModal('add-unit-modal'));

  addUnitForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aptId      = unitAptSelect?.value || '';
    const location   = document.getElementById('unit-form-location')?.value;
    const floor      = Number(document.getElementById('unit-form-floor')?.value)      || 1;
    const price      = Number(document.getElementById('unit-form-price')?.value)      || 300000;
    const beds       = Number(document.getElementById('unit-form-beds')?.value)       || 2;
    const baths      = Number(document.getElementById('unit-form-baths')?.value)      || 2;
    const ac         = document.getElementById('unit-form-ac')?.value                 || 'AC';
    const furnitures = document.getElementById('unit-form-furnitures')?.value         || 'Fully Furnished';
    const about      = document.getElementById('unit-form-about')?.value              || '';

    try {
      await store.addUnit({
        apartmentId: aptId,
        location,
        floor,
        unitPrice:      price,
        numOfBeds:      beds,
        numOfBathRooms: baths,
        numOfRooms:     beds,
        acOrNonAC:      ac,
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
    } catch (err) {
      alert(`Error adding unit: ${err.message}`);
    }
  });
});

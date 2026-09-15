import { store } from '../store.js';
import { requireAuth, getCurrentUser, ROLES } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';
import { externalApartmentsApi } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce access control for Sales Agents (and Admins for auditing)
  if (!requireAuth([ROLES.SALES_AGENT, ROLES.ADMIN])) return;

  renderNavbar();
  renderFooter();
  setupModalListeners();

  const user = getCurrentUser();
  const agentNameEl = document.getElementById('agent-name');
  const agentUidEl = document.getElementById('agent-uid');
  const agentEmailEl = document.getElementById('agent-email');

  if (agentNameEl) agentNameEl.textContent = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sales Agent';
  if (agentUidEl) agentUidEl.textContent = user.uid || user.empId || 'USR-EXT-5003';
  if (agentEmailEl) agentEmailEl.textContent = user.email || 'agent@livingora.lk';

  const alertBox = document.getElementById('agent-alert');
  const tbody = document.getElementById('agent-resale-tbody');
  const kpiCount = document.getElementById('kpi-listed-count');
  const kpiVolume = document.getElementById('kpi-portfolio-value');
  const kpiCommission = document.getElementById('kpi-commission-value');

  // Modal elements
  const resaleModal = document.getElementById('resale-modal');
  const resaleModalTitle = document.getElementById('resale-modal-title');
  const resaleForm = document.getElementById('resale-apartment-form');
  const modalAptId = document.getElementById('modal-apt-id');
  const modalLocation = document.getElementById('modal-location');
  const modalRooms = document.getElementById('modal-rooms');
  const modalPrice = document.getElementById('modal-price');
  const modalDownpayment = document.getElementById('modal-downpayment');
  const modalAc = document.getElementById('modal-ac');
  const modalAbout = document.getElementById('modal-about');
  const modalInfo = document.getElementById('modal-info');
  const modalImage = document.getElementById('modal-image');

  const openRegisterBtn = document.getElementById('open-register-resale-btn');
  const closeResaleModalBtn = document.getElementById('close-resale-modal-btn');
  const cancelResaleModalBtn = document.getElementById('cancel-resale-modal-btn');

  // Delete modal elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteAptCode = document.getElementById('delete-apt-code');
  const closeDeleteBtn = document.getElementById('close-delete-modal-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  let activeApartmentToDelete = null;
  let myApartments = [];

  function showAlert(msg, isError = false) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 4500);
  }

  async function loadMyApartments() {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading your listed resale apartments from database...</td></tr>`;
    try {
      const agentUid = user.uid || 'USR-EXT-5003';
      const res = await externalApartmentsApi.getByAgent(agentUid);
      myApartments = Array.isArray(res) ? res : [];
    } catch (err) {
      console.warn('Fallback to local store filter:', err);
      const all = store.getExternalApartments();
      const agentUid = user.uid || 'USR-EXT-5003';
      myApartments = all.filter(a => a.registeredByUid === agentUid);
    }
    renderTable();
    updateKPIs();
  }

  function updateKPIs() {
    const count = myApartments.length;
    const totalVolume = myApartments.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const estimatedCommission = totalVolume * 0.03; // 3% standard broker incentive

    if (kpiCount) kpiCount.textContent = `${count} Properties`;
    if (kpiVolume) kpiVolume.textContent = formatPrice(totalVolume);
    if (kpiCommission) kpiCommission.textContent = formatPrice(Math.round(estimatedCommission));
  }

  function renderTable() {
    if (!tbody) return;
    if (myApartments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            <p style="margin-bottom: 1rem; font-size: 1.05rem;">You have not registered any apartments for resale yet.</p>
            <button class="btn btn-sm btn-primary" id="table-empty-register-btn">+ Register Your First Resale Property</button>
          </td>
        </tr>
      `;
      document.getElementById('table-empty-register-btn')?.addEventListener('click', openCreateModal);
      return;
    }

    tbody.innerHTML = myApartments.map(apt => `
      <tr>
        <td>
          <strong style="color: var(--primary); font-family: monospace;">${apt.exApartmentId}</strong>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${apt.location}</div>
          <small style="color: var(--text-dim);">${apt.about ? apt.about.substring(0, 50) + '...' : 'Secondary condo listing'}</small>
        </td>
        <td>
          <span>🛏️ ${apt.numOfRooms || 2} Beds</span> &bull; 
          <span class="badge ${apt.acOrNonAC === 'AC' ? 'badge-info' : 'badge-dark'}">${apt.acOrNonAC || 'AC'}</span>
        </td>
        <td><strong class="card-price">${formatPrice(apt.price)}</strong></td>
        <td><strong style="color: var(--success);">${formatPrice(apt.downPayment || apt.price * 0.1)}</strong></td>
        <td>
          <span class="badge badge-success">✓ Active in Marketplace</span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-outline edit-btn" data-id="${apt.exApartmentId}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${apt.exApartmentId}">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach row button listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteModal(id);
      });
    });
  }

  function openCreateModal() {
    resaleModalTitle.textContent = 'Register Resale Apartment';
    modalAptId.value = '';
    resaleForm.reset();
    if (modalRooms) modalRooms.value = 2;
    if (modalPrice) modalPrice.value = 220000;
    if (modalDownpayment) modalDownpayment.value = 22000;
    openModal('resale-modal');
  }

  function openEditModal(id) {
    const apt = myApartments.find(a => a.exApartmentId === id);
    if (!apt) return;

    resaleModalTitle.textContent = `Update Resale Property (${apt.exApartmentId})`;
    modalAptId.value = apt.exApartmentId;
    modalLocation.value = apt.location || '';
    modalRooms.value = apt.numOfRooms || 2;
    modalPrice.value = apt.price || '';
    modalDownpayment.value = apt.downPayment || '';
    modalAc.value = apt.acOrNonAC || 'AC';
    modalAbout.value = apt.about || '';
    modalInfo.value = apt.additionalInfo || '';
    modalImage.value = apt.images || 'images/luxury-condo-exterior.jpg';

    openModal('resale-modal');
  }

  function openDeleteModal(id) {
    activeApartmentToDelete = id;
    if (deleteAptCode) deleteAptCode.textContent = id;
    openModal('delete-modal');
  }

  openRegisterBtn?.addEventListener('click', openCreateModal);
  closeResaleModalBtn?.addEventListener('click', () => closeModal('resale-modal'));
  cancelResaleModalBtn?.addEventListener('click', () => closeModal('resale-modal'));
  closeDeleteBtn?.addEventListener('click', () => closeModal('delete-modal'));
  cancelDeleteBtn?.addEventListener('click', () => closeModal('delete-modal'));

  document.getElementById('refresh-resale-btn')?.addEventListener('click', async () => {
    await loadMyApartments();
    showAlert('Listings refreshed from database.');
  });

  // Calculate down payment dynamically on price change in form
  modalPrice?.addEventListener('input', () => {
    const val = Number(modalPrice.value) || 0;
    if (val > 0 && (!modalDownpayment.value || modalDownpayment.value === '0')) {
      modalDownpayment.value = Math.round(val * 0.1);
    }
  });

  // Handle Form Submit (Register or Update)
  resaleForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-resale-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving to database...';
    }

    const isEdit = Boolean(modalAptId.value);
    const id = modalAptId.value;

    const payload = {
      location: modalLocation.value.trim(),
      numOfRooms: Number(modalRooms.value) || 2,
      price: Number(modalPrice.value) || 100000,
      downPayment: Number(modalDownpayment.value) || Math.round(Number(modalPrice.value) * 0.1),
      acOrNonAC: modalAc.value || 'AC',
      about: modalAbout.value.trim(),
      additionalInfo: modalInfo.value.trim(),
      images: modalImage.value || 'images/luxury-condo-exterior.jpg',
      registeredByUid: user.uid || 'USR-EXT-5003'
    };

    try {
      if (isEdit) {
        await store.updateExternalApartment(id, payload);
        showAlert(`Resale apartment ${id} updated successfully!`);
      } else {
        const created = await store.addExternalApartment(payload);
        showAlert(`Resale apartment ${created.exApartmentId || ''} registered and active in the resale marketplace!`);
      }
      closeModal('resale-modal');
      await loadMyApartments();
    } catch (err) {
      showAlert(err.message || 'Operation failed.', true);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Resale Listing';
      }
    }
  });

  // Handle Confirm Delete
  confirmDeleteBtn?.addEventListener('click', async () => {
    if (!activeApartmentToDelete) return;
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Deleting...';

    try {
      await store.deleteExternalApartment(activeApartmentToDelete);
      closeModal('delete-modal');
      showAlert(`Listing ${activeApartmentToDelete} was permanently removed.`);
      activeApartmentToDelete = null;
      await loadMyApartments();
    } catch (err) {
      showAlert(err.message || 'Failed to delete listing.', true);
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = 'Delete Permanently';
    }
  });

  // Initial load
  await loadMyApartments();
});

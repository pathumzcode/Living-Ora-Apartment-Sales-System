/**
 * Promotion Management Page — Living-Ora
 * Authorized roles: ADMIN, MARKETING_MANAGER, SALES_MANAGER, OPERATIONS_DIRECTOR
 *
 * Features:
 *  - Load all promotions from real API
 *  - KPI counts (total / active / scheduled / expired)
 *  - Search by title + filter by status
 *  - Create / Edit via modal form with field-level validation
 *  - Activate / Deactivate toggle
 *  - Soft-delete with confirmation
 *  - Success / error notifications
 */

import { promotionsApi } from '../api.js';
import {
  requireAuth, getCurrentUser, ROLES
} from '../auth.js';
import { renderNavbar, renderFooter, openModal, closeModal, setupModalListeners } from '../ui.js';
import { store } from '../store.js';

// ── Auth Gate ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const ALLOWED_ROLES = [
    ROLES.ADMIN,
    ROLES.MARKETING_MANAGER,
    ROLES.SALES_MANAGER,
    ROLES.OPERATIONS_DIRECTOR
  ];

  if (!requireAuth(ALLOWED_ROLES)) return;

  renderNavbar();
  renderFooter();
  setupModalListeners();

  const user    = getCurrentUser();
  const isAdmin = user?.role === ROLES.ADMIN;

  // Populate the apartment dropdown once (store may already be ready)
  function populateApartmentDropdown() {
    const select = document.getElementById('form-assigned-apt');
    if (!select) return;
    const apartments = store.getApartments() || [];
    // Preserve the first "All Apartments" option and rebuild the rest
    select.innerHTML = '<option value="">All Apartments (Global)</option>' +
      apartments.map(a =>
        `<option value="${a.apartmentId || a.id}">${a.apartmentId || a.id} – ${a.location || ''}</option>`
      ).join('');
  }

  // Populate when store is ready and again on subscribe (in case it loads later)
  if (store.ready) store.ready.then(populateApartmentDropdown);
  store.subscribe(populateApartmentDropdown);
  populateApartmentDropdown();

  // State
  let allPromotions = [];
  let editingId = null;       // null = create, string = edit
  let pendingDeleteId = null;

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const tbody             = document.getElementById('promotions-tbody');
  const kpiTotal          = document.getElementById('kpi-total');
  const kpiActive         = document.getElementById('kpi-active');
  const kpiScheduled      = document.getElementById('kpi-scheduled');
  const kpiExpired        = document.getElementById('kpi-expired');
  const searchInput       = document.getElementById('search-input');
  const statusFilter      = document.getElementById('status-filter');
  const searchBtn         = document.getElementById('search-btn');
  const clearBtn          = document.getElementById('clear-search-btn');
  const openCreateBtn     = document.getElementById('open-create-modal-btn');
  const promotionForm     = document.getElementById('promotion-form');
  const confirmDeleteBtn  = document.getElementById('confirm-delete-btn');
  const notificationBanner = document.getElementById('notification-banner');

  // Form fields
  const fId          = () => document.getElementById('form-promotion-id');
  const fTitle       = () => document.getElementById('form-title');
  const fType        = () => document.getElementById('form-type');
  const fCode        = () => document.getElementById('form-code');
  const fDiscount    = () => document.getElementById('form-discount');
  const fStart       = () => document.getElementById('form-start');
  const fEnd         = () => document.getElementById('form-end');
  const fAbout       = () => document.getElementById('form-about');
  const fEligibility = () => document.getElementById('form-eligibility');
  const fButtonText  = () => document.getElementById('form-button-text');
  const fValidity    = () => document.getElementById('form-validity');
  const fBanner      = () => document.getElementById('form-banner');
  const fStatus      = () => document.getElementById('form-status');
  const fAssignedApt = () => document.getElementById('form-assigned-apt');
  const formError    = () => document.getElementById('form-error');

  // ── Load Data ─────────────────────────────────────────────────────────────────

  async function loadPromotions(q = '', statusVal = '') {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--text-muted);">Loading…</td></tr>`;
    try {
      if (q || statusVal) {
        allPromotions = await promotionsApi.search(q, statusVal);
      } else {
        allPromotions = await promotionsApi.getAll();
      }
      renderTable(allPromotions);
      renderKPIs(allPromotions);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--danger);">
        Failed to load promotions: ${escapeHtml(err.message)}
      </td></tr>`;
      showNotification('Failed to load promotions: ' + err.message, 'error');
    }
  }

  // ── Render Table ──────────────────────────────────────────────────────────────

  function renderTable(promotions) {
    if (!promotions || promotions.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="10" style="text-align:center;padding:3rem;color:var(--text-muted);">
          <div style="font-size:2rem;margin-bottom:0.5rem;">📋</div>
          No promotions found. Click "+ New Promotion" to create one.
        </td></tr>`;
      return;
    }

    tbody.innerHTML = promotions.map(p => {
      const statusClass = getStatusBadgeClass(p.computedStatus || p.status);
      const isActive    = p.computedStatus === 'ACTIVE';
      const toggleLabel = (p.status === 'ACTIVE') ? 'Deactivate' : 'Activate';
      const toggleClass = (p.status === 'ACTIVE') ? 'btn-warning' : 'btn-success';

      return `
        <tr>
          <td><code style="font-size:0.8rem;">${escapeHtml(p.promotionId)}</code></td>
          <td><strong>${escapeHtml(p.promotionTitle)}</strong></td>
          <td>${escapeHtml(p.promotionType || '—')}</td>
          <td>
            <strong style="color:var(--primary);">${p.discountPrecentage != null ? p.discountPrecentage + '%' : '—'}</strong>
          </td>
          <td>
            ${p.assinedApartment
              ? `<code style="font-size:0.78rem;">${escapeHtml(p.assinedApartment)}</code>`
              : `<span class="badge badge-dark" style="font-size:0.72rem;">All</span>`}
          </td>
          <td>${formatDate(p.startDate)}</td>
          <td>${formatDate(p.endDate)}</td>
          <td><span class="badge ${statusClass}">${escapeHtml(p.computedStatus || p.status)}</span></td>
          <td><code style="color:var(--primary);letter-spacing:1px;font-size:0.85rem;">${escapeHtml(p.promotionCode || '—')}</code></td>
          <td>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
              <button class="btn btn-sm btn-secondary edit-btn" data-id="${escapeHtml(p.promotionId)}">Edit</button>
              <button class="btn btn-sm ${toggleClass} toggle-btn" data-id="${escapeHtml(p.promotionId)}">${toggleLabel}</button>
              ${isAdmin ? `<button class="btn btn-sm btn-danger delete-btn" data-id="${escapeHtml(p.promotionId)}" data-title="${escapeHtml(p.promotionTitle)}">Delete</button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    // Toggle status buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => handleToggle(btn.getAttribute('data-id')));
    });

    // Delete buttons (admin only)
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.getAttribute('data-id');
        document.getElementById('delete-promo-title').textContent = btn.getAttribute('data-title');
        openModal('delete-modal');
      });
    });
  }

  // ── KPI Counts ────────────────────────────────────────────────────────────────

  function renderKPIs(promotions) {
    if (kpiTotal)     kpiTotal.textContent     = promotions.length;
    if (kpiActive)    kpiActive.textContent    = promotions.filter(p => p.computedStatus === 'ACTIVE').length;
    if (kpiScheduled) kpiScheduled.textContent = promotions.filter(p => p.computedStatus === 'SCHEDULED').length;
    if (kpiExpired)   kpiExpired.textContent   = promotions.filter(p => p.computedStatus === 'EXPIRED').length;
  }

  // ── Create Modal ──────────────────────────────────────────────────────────────

  openCreateBtn?.addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Create Promotion';
    document.getElementById('form-submit-btn').textContent = 'Save Promotion';
    promotionForm.reset();
    fId().value = '';
    clearFieldErrors();
    hideFormError();
    openModal('promotion-modal');
  });

  // ── Edit Modal ────────────────────────────────────────────────────────────────

  function openEditModal(id) {
    const promo = allPromotions.find(p => p.promotionId === id);
    if (!promo) return;

    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Promotion';
    document.getElementById('form-submit-btn').textContent = 'Update Promotion';
    clearFieldErrors();
    hideFormError();

    fId().value          = promo.promotionId;
    fTitle().value       = promo.promotionTitle || '';
    fType().value        = promo.promotionType || 'Discount Code';
    fCode().value        = promo.promotionCode || '';
    fDiscount().value    = promo.discountPrecentage != null ? promo.discountPrecentage : '';
    fStart().value       = promo.startDate ? promo.startDate.toString().slice(0, 10) : '';
    fEnd().value         = promo.endDate ? promo.endDate.toString().slice(0, 10) : '';
    fAbout().value       = promo.about || '';
    fEligibility().value = promo.eligibilityCriteria || '';
    fButtonText().value  = promo.buttonText || '';
    fValidity().value    = promo.validityPeriod || '';
    fBanner().value      = promo.bannerImage || '';
    fStatus().value      = promo.status || 'ACTIVE';
    if (fAssignedApt()) fAssignedApt().value = promo.assinedApartment || '';

    openModal('promotion-modal');
  }

  // ── Form Submit (Create / Update) ─────────────────────────────────────────────

  promotionForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    hideFormError();

    // Frontend validation
    let valid = true;
    if (!fTitle().value.trim()) {
      showFieldError('err-title', 'Promotion title is required.');
      valid = false;
    }
    if (!fCode().value.trim()) {
      showFieldError('err-code', 'Promotion code is required.');
      valid = false;
    }
    const discount = parseFloat(fDiscount().value);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      showFieldError('err-discount', 'Discount must be between 0 and 100.');
      valid = false;
    }
    const startDate = fStart().value;
    const endDate   = fEnd().value;
    if (!startDate) {
      showFieldError('err-start', 'Start date is required.');
      valid = false;
    }
    if (!endDate) {
      showFieldError('err-end', 'End date is required.');
      valid = false;
    }
    if (startDate && endDate && endDate < startDate) {
      showFieldError('err-end', 'End date cannot be before start date.');
      valid = false;
    }
    if (!valid) return;

    const payload = {
      promotionTitle:      fTitle().value.trim(),
      promotionType:       fType().value,
      promotionCode:       fCode().value.trim().toUpperCase(),
      discountPrecentage:  parseFloat(fDiscount().value),
      startDate:           startDate,
      endDate:             endDate,
      about:               fAbout().value.trim(),
      eligibilityCriteria: fEligibility().value.trim(),
      buttonText:          fButtonText().value.trim(),
      validityPeriod:      fValidity().value.trim(),
      bannerImage:         fBanner().value.trim(),
      status:              fStatus().value,
      assinedApartment:    fAssignedApt() ? (fAssignedApt().value || null) : null
    };

    const submitBtn = document.getElementById('form-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      if (editingId) {
        await promotionsApi.update(editingId, payload);
        showNotification('Promotion updated successfully!', 'success');
      } else {
        await promotionsApi.create(payload);
        showNotification('Promotion created successfully!', 'success');
      }
      closeModal('promotion-modal');
      await loadPromotions();
    } catch (err) {
      showFormError(err.message || 'An error occurred. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? 'Update Promotion' : 'Save Promotion';
    }
  });

  // ── Toggle Status ─────────────────────────────────────────────────────────────

  async function handleToggle(id) {
    try {
      await promotionsApi.toggleStatus(id);
      const promo = allPromotions.find(p => p.promotionId === id);
      const newStatus = promo?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      showNotification(`Promotion ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`, 'success');
      await loadPromotions();
    } catch (err) {
      showNotification('Failed to update status: ' + err.message, 'error');
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  confirmDeleteBtn?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      await promotionsApi.remove(pendingDeleteId);
      closeModal('delete-modal');
      showNotification('Promotion deleted successfully.', 'success');
      pendingDeleteId = null;
      await loadPromotions();
    } catch (err) {
      closeModal('delete-modal');
      showNotification('Failed to delete promotion: ' + err.message, 'error');
    }
  });

  // ── Search & Filter ───────────────────────────────────────────────────────────

  searchBtn?.addEventListener('click', () => {
    loadPromotions(searchInput.value.trim(), statusFilter.value);
  });

  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadPromotions(searchInput.value.trim(), statusFilter.value);
  });

  statusFilter?.addEventListener('change', () => {
    loadPromotions(searchInput.value.trim(), statusFilter.value);
  });

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = '';
    loadPromotions();
  });

  // ── Notification Banner ───────────────────────────────────────────────────────

  function showNotification(message, type = 'success') {
    notificationBanner.textContent = message;
    notificationBanner.style.display = 'block';
    notificationBanner.style.background = type === 'success'
      ? 'rgba(25, 135, 84, 0.12)'
      : 'rgba(220, 53, 69, 0.12)';
    notificationBanner.style.color = type === 'success'
      ? 'var(--success)'
      : 'var(--danger)';
    notificationBanner.style.border = `1px solid ${type === 'success' ? 'var(--success)' : 'var(--danger)'}`;
    clearTimeout(notificationBanner._hideTimer);
    notificationBanner._hideTimer = setTimeout(() => {
      notificationBanner.style.display = 'none';
    }, 5000);
  }

  function showFormError(msg) {
    const el = formError();
    el.textContent = msg;
    el.style.display = 'block';
  }

  function hideFormError() {
    const el = formError();
    el.style.display = 'none';
    el.textContent = '';
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearFieldErrors() {
    ['err-title', 'err-code', 'err-discount', 'err-start', 'err-end'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.style.display = 'none'; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function getStatusBadgeClass(status) {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE':    return 'badge-success';
      case 'SCHEDULED': return 'badge-gold';
      case 'EXPIRED':   return 'badge-dark';
      case 'INACTIVE':  return 'badge-warning';
      case 'DELETED':   return 'badge-danger';
      default:          return 'badge-dark';
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Initial Load ──────────────────────────────────────────────────────────────
  loadPromotions();
});

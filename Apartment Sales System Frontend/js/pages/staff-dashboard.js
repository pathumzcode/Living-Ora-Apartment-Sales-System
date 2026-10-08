import { store } from '../store.js';
import { requireAuth, getCurrentUser, logout, ROLES, ROLE_LABELS, getVerificationsTable, saveVerificationsTable } from '../auth.js';
import { renderNavbar, renderFooter, formatPrice, openModal, closeModal, setupModalListeners } from '../ui.js';
import { operationsDeletionApi, userApi } from '../api.js';

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
  const tabLeadsBtn = document.getElementById('tab-leads-btn');
  const tabOperationsBtn = document.getElementById('tab-operations-btn');
  const tabPromotionsBtn = document.getElementById('tab-promotions-btn');
  const tabPendingDeletionsBtn = document.getElementById('tab-pending-deletions-btn');
  const tabProfileBtn = document.getElementById('tab-profile-btn');
  const openProfileBtn = document.getElementById('open-profile-btn');

  const bookingsPanel = document.getElementById('bookings-panel');
  const inventoryPanel = document.getElementById('inventory-panel');
  const leadsPanel = document.getElementById('leads-panel');
  const operationsPanel = document.getElementById('operations-panel');
  const promotionsPanel = document.getElementById('promotions-panel');
  const pendingDeletionsPanel = document.getElementById('pending-deletions-panel');
  const profilePanel = document.getElementById('profile-panel');

  if (isOpsDirectorOrAdmin && tabOperationsBtn) {
    tabOperationsBtn.style.display = 'inline-block';
    const opLi = document.getElementById('tab-operations-li');
    if (opLi) opLi.style.display = 'block';
  }
  if (isSalesManagerOrOps && tabPromotionsBtn) {
    tabPromotionsBtn.style.display = 'inline-block';
    const promoLi = document.getElementById('tab-promotions-li');
    if (promoLi) promoLi.style.display = 'block';
  }

  // Show Deletion Approvals tab only for Operations Director
  const isOpsDirectorOnly = user.role === ROLES.OPERATIONS_DIRECTOR;
  if (isOpsDirectorOnly && tabPendingDeletionsBtn) {
    tabPendingDeletionsBtn.style.display = 'inline-block';
    const delLi = document.getElementById('tab-pending-deletions-li');
    if (delLi) delLi.style.display = 'block';
  }

  function renderStaffLeads() {
    const tbody = document.getElementById('staff-leads-tbody');
    const countEl = document.getElementById('staff-leads-count');
    if (!tbody) return;

    let leads = [];
    try {
      const stored = localStorage.getItem('livingora_leads_data');
      if (stored) leads = JSON.parse(stored);
    } catch (e) {
      console.error('Error reading leads', e);
    }

    // Filter leads assigned to this staff member (or show all if admin/director)
    const myEmpId = user.empId || user.uid;
    const isDirectorOrAdmin = user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_DIRECTOR;
    const filteredLeads = isDirectorOrAdmin ? leads : leads.filter(l => l.assignedStaffId === myEmpId);

    if (countEl) countEl.textContent = `${filteredLeads.length} Leads`;

    if (filteredLeads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No leads currently assigned to your account.</td></tr>`;
      return;
    }

    const statusBadge = {
      'NEW': '<span class="badge badge-gold">New Inquiry</span>',
      'CONTACTED': '<span class="badge badge-primary">Contacted</span>',
      'SITE_VISIT': '<span class="badge badge-info">Site Visit</span>',
      'NEGOTIATION': '<span class="badge badge-warning">Negotiation</span>',
      'WON': '<span class="badge badge-success">Reserved</span>',
      'LOST': '<span class="badge badge-danger">Dropped</span>'
    };

    tbody.innerHTML = filteredLeads.map(l => `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">${l.leadId}</strong></td>
        <td><strong>${l.clientName}</strong></td>
        <td>
          <div>${l.phone || '-'}</div>
          <small style="color: var(--text-muted);">${l.email || '-'}</small>
        </td>
        <td>${l.interestedProperty || 'Luxury Unit'}</td>
        <td>${statusBadge[l.status] || `<span class="badge badge-gold">${l.status}</span>`}</td>
        <td><strong style="color: var(--success);">$${Number(l.budget || 0).toLocaleString()}</strong></td>
        <td><small style="color: var(--text-muted);">${l.notes || 'No notes'}</small></td>
      </tr>
    `).join('');
  }

  // ─── Pending Deletions Badge ─────────────────────────────────────────────
  async function updateDeletionsBadge() {
    const badge = document.getElementById('pending-deletions-badge');
    if (!badge || !isOpsDirectorOnly) return;
    try {
      const backendPending = await operationsDeletionApi.getPending();
      if (Array.isArray(backendPending)) {
        if (backendPending.length > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = backendPending.length;
          return;
        }
      }
    } catch (e) {
      // Local fallback
    }

    let pending = [];
    try { pending = JSON.parse(localStorage.getItem('livingora_pending_deletions') || '[]'); } catch(e) {}
    const count = pending.filter(r => r.status === 'PENDING').length;
    if (count > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = count;
    } else {
      badge.style.display = 'none';
    }
  }

  // ─── Render Pending Deletions List ───────────────────────────────────────
  async function renderPendingDeletions() {
    const listEl = document.getElementById('pending-deletions-list');
    if (!listEl) return;

    let active = [];
    try {
      const backendList = await operationsDeletionApi.getPending();
      if (Array.isArray(backendList)) {
        active = backendList.map(r => ({
          requestId: r.requestId,
          empId: r.targetEmpId,
          name: r.targetName,
          role: r.targetRole,
          companyEmail: r.targetEmail,
          requestedBy: r.requestedByEmpId,
          requestedAt: r.requestedAt,
          status: r.status
        }));
      }
    } catch (err) {
      console.warn('Backend deletion requests API unreachable, using local storage:', err);
    }

    if (active.length === 0) {
      let pending = [];
      try { pending = JSON.parse(localStorage.getItem('livingora_pending_deletions') || '[]'); } catch(e) {}
      active = pending.filter(r => r.status === 'PENDING');
    }

    if (active.length === 0) {
      listEl.innerHTML = `
        <div class="card" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
          <h3 style="font-weight: 600; margin-bottom: 0.5rem;">No Pending Requests</h3>
          <p style="font-size: 0.9rem;">All deletion requests have been reviewed. The queue is clear.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = active.map(req => `
      <div class="card" style="padding: 1.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-left: 3px solid #e74c3c;">
        <div style="flex: 1; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(231,76,60,0.12); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">👤</div>
            <div>
              <div style="font-weight: 700; font-size: 1rem;">${req.name || 'Unknown User'}</div>
              <div style="color: var(--text-muted); font-size: 0.8rem;">${req.companyEmail || '-'}</div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span class="badge badge-gold">${req.role || 'Staff'}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">ID: <code style="color: var(--primary);">${req.empId}</code></span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Requested by: <strong>${req.requestedBy}</strong></span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">At: ${new Date(req.requestedAt).toLocaleString()}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.6rem; flex-shrink: 0;">
          <button class="btn btn-sm" style="background: var(--danger, #e74c3c); color: #fff; border: none;" data-approve-del="${req.requestId}" data-emp-id="${req.empId}" data-email="${req.companyEmail || ''}" data-name="${req.name}">
            ✅ Approve &amp; Delete
          </button>
          <button class="btn btn-sm btn-outline" data-reject-del="${req.requestId}" data-name="${req.name}">
            ✕ Reject
          </button>
        </div>
      </div>
    `).join('');

    // Approve handlers — permanently deletes user from userVerification and internalUser
    listEl.querySelectorAll('[data-approve-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reqId = btn.getAttribute('data-approve-del');
        const empId = btn.getAttribute('data-emp-id');
        const email = btn.getAttribute('data-email')?.toLowerCase();
        const name = btn.getAttribute('data-name');
        if (!confirm(`⚠️ Permanently delete staff account for "${name}"?\n\nThis will remove the user and their authentication record in userVerification database table permanently.`)) return;

        try {
          // 1. Call backend Java API to execute deletion from database & userVerification table
          await operationsDeletionApi.approve(reqId);
        } catch (apiErr) {
          console.warn('Backend deletion execution error, continuing local sync:', apiErr);
        }

        // 2. Remove from internal users local cache
        const VER_KEY = 'livingora_demo_internal_users';
        let internalList = [];
        try { internalList = JSON.parse(localStorage.getItem(VER_KEY) || '[]'); } catch(e) {}
        internalList = internalList.filter(u => {
          const matchId = (u.empId === empId || u.uid === empId);
          const matchEmail = email && (u.companyEmail?.toLowerCase() === email || u.email?.toLowerCase() === email);
          return !matchId && !matchEmail;
        });
        localStorage.setItem(VER_KEY, JSON.stringify(internalList));

        // 3. Remove from userVerification local cache
        const vTable = getVerificationsTable();
        const updatedVTable = vTable.filter(v => {
          const matchId = (v.empId === empId || v.uid === empId);
          const matchEmail = email && v.email?.toLowerCase() === email;
          return !matchId && !matchEmail;
        });
        saveVerificationsTable(updatedVTable);

        // 4. Mark request as approved in local pending deletions
        let pending = [];
        try { pending = JSON.parse(localStorage.getItem('livingora_pending_deletions') || '[]'); } catch(e) {}
        pending = pending.map(r => r.requestId === reqId ? { ...r, status: 'APPROVED' } : r);
        localStorage.setItem('livingora_pending_deletions', JSON.stringify(pending));

        await updateDeletionsBadge();
        await renderPendingDeletions();
        alert(`✅ Staff account for "${name}" and userVerification record have been permanently deleted from the database.`);
      });
    });

    // Reject handlers
    listEl.querySelectorAll('[data-reject-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reqId = btn.getAttribute('data-reject-del');
        const name = btn.getAttribute('data-name');

        try {
          await operationsDeletionApi.reject(reqId, 'Rejected by Operations Director');
        } catch (apiErr) {
          console.warn('Backend rejection error, continuing local sync:', apiErr);
        }

        let pending = [];
        try { pending = JSON.parse(localStorage.getItem('livingora_pending_deletions') || '[]'); } catch(e) {}
        pending = pending.map(r => r.requestId === reqId ? { ...r, status: 'REJECTED' } : r);
        localStorage.setItem('livingora_pending_deletions', JSON.stringify(pending));

        await updateDeletionsBadge();
        await renderPendingDeletions();
        alert(`❌ Deletion request for "${name}" has been rejected. The account remains active.`);
      });
    });
  }

  function switchTab(tab) {
    [tabBookingsBtn, tabInventoryBtn, tabLeadsBtn, tabOperationsBtn, tabPromotionsBtn, tabPendingDeletionsBtn, tabProfileBtn].forEach(b => b?.classList.remove('active'));
    [bookingsPanel, inventoryPanel, leadsPanel, operationsPanel, promotionsPanel, pendingDeletionsPanel, profilePanel].forEach(p => p?.setAttribute('hidden', 'true'));

    if (tab === 'inventory') {
      tabInventoryBtn?.classList.add('active');
      inventoryPanel?.removeAttribute('hidden');
    } else if (tab === 'leads') {
      tabLeadsBtn?.classList.add('active');
      leadsPanel?.removeAttribute('hidden');
      renderStaffLeads();
    } else if (tab === 'operations') {
      tabOperationsBtn?.classList.add('active');
      operationsPanel?.removeAttribute('hidden');
      renderOperationsStaff();
    } else if (tab === 'promotions') {
      tabPromotionsBtn?.classList.add('active');
      promotionsPanel?.removeAttribute('hidden');
      renderPromotions();
    } else if (tab === 'pending-deletions') {
      tabPendingDeletionsBtn?.classList.add('active');
      pendingDeletionsPanel?.removeAttribute('hidden');
      renderPendingDeletions();
    } else if (tab === 'profile') {
      tabProfileBtn?.classList.add('active');
      profilePanel?.removeAttribute('hidden');
      loadStaffProfile();
    } else {
      tabBookingsBtn?.classList.add('active');
      bookingsPanel?.removeAttribute('hidden');
    }
  }

  tabBookingsBtn?.addEventListener('click', () => switchTab('bookings'));
  tabInventoryBtn?.addEventListener('click', () => switchTab('inventory'));
  tabLeadsBtn?.addEventListener('click', () => switchTab('leads'));
  tabOperationsBtn?.addEventListener('click', () => switchTab('operations'));
  tabPromotionsBtn?.addEventListener('click', () => switchTab('promotions'));
  tabPendingDeletionsBtn?.addEventListener('click', () => switchTab('pending-deletions'));
  tabProfileBtn?.addEventListener('click', () => switchTab('profile'));
  openProfileBtn?.addEventListener('click', () => switchTab('profile'));

  document.querySelectorAll('.admin-nav-item[data-staff-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-staff-tab');
      if (tab) switchTab(tab);
    });
  });

  // ─── Staff Profile Management ──────────────────────────────────────────
  function updateHeaderAvatar(picUrl) {
    const avatarImg = document.getElementById('staff-header-avatar-img');
    const avatarIcon = document.getElementById('staff-header-avatar-icon');
    if (picUrl && avatarImg) {
      avatarImg.src = picUrl;
      avatarImg.style.display = 'block';
      if (avatarIcon) avatarIcon.style.display = 'none';
    } else {
      if (avatarImg) avatarImg.style.display = 'none';
      if (avatarIcon) avatarIcon.style.display = 'block';
    }
  }

  // Set avatar on page load from current user session
  if (user?.profilePicture) {
    updateHeaderAvatar(user.profilePicture);
  }

  async function loadStaffProfile() {
    const empId = user.empId || user.uid;
    let staffData = user;

    try {
      const fetched = await userApi.getInternalUser(empId);
      if (fetched && (fetched.empId || fetched.email)) {
        staffData = fetched;
      }
    } catch (e) {
      console.warn('Could not load staff profile from backend, using session profile:', e);
      try {
        const localList = JSON.parse(localStorage.getItem('livingora_demo_internal_users') || '[]');
        const found = localList.find(u => u.empId === empId || u.uid === empId);
        if (found) staffData = { ...staffData, ...found };
      } catch (err) {}
    }

    // Editable fields
    const personalEmailInput = document.getElementById('staff-profile-personal-email');
    const phoneInput = document.getElementById('staff-profile-phone');
    const addressInput = document.getElementById('staff-profile-address');
    const picHidden = document.getElementById('staff-profile-picture-val');
    const picPreview = document.getElementById('staff-profile-avatar-preview');
    const picPlaceholder = document.getElementById('staff-profile-avatar-placeholder');
    const picUrlInput = document.getElementById('staff-pic-url-input');

    if (personalEmailInput) personalEmailInput.value = staffData.personalEmail || staffData.email || '';
    if (phoneInput) phoneInput.value = staffData.phoneNumber || '';
    if (addressInput) addressInput.value = staffData.address || '';

    const picUrl = staffData.profilePicture || '';
    if (picHidden) picHidden.value = picUrl;
    if (picUrlInput) picUrlInput.value = picUrl.startsWith('data:') ? '' : picUrl;
    if (picUrl && picPreview) {
      picPreview.src = picUrl;
      picPreview.style.display = 'block';
      if (picPlaceholder) picPlaceholder.style.display = 'none';
    } else {
      if (picPreview) picPreview.style.display = 'none';
      if (picPlaceholder) picPlaceholder.style.display = 'block';
    }

    // Locked System fields (Contact Admin to change)
    const fnInput = document.getElementById('staff-profile-firstname');
    const lnInput = document.getElementById('staff-profile-lastname');
    const cEmailInput = document.getElementById('staff-profile-company-email');
    const nicInput = document.getElementById('staff-profile-nic');
    const dobInput = document.getElementById('staff-profile-dob');
    const ageInput = document.getElementById('staff-profile-age');
    const empIdInput = document.getElementById('staff-profile-empid');
    const roleInput = document.getElementById('staff-profile-role');
    const roleBadge = document.getElementById('staff-profile-role-badge');

    if (fnInput) fnInput.value = staffData.firstName || '';
    if (lnInput) lnInput.value = staffData.lastName || '';
    if (cEmailInput) cEmailInput.value = staffData.companyEmail || staffData.email || '';
    if (nicInput) nicInput.value = staffData.nic || '';
    if (dobInput) dobInput.value = staffData.dateOfBirth || 'Not specified';
    if (ageInput) ageInput.value = staffData.age ? `${staffData.age} Years Old` : 'Not specified';
    if (empIdInput) empIdInput.value = staffData.empId || staffData.uid || '';
    if (roleInput) roleInput.value = ROLE_LABELS[staffData.role] || staffData.role || 'Staff Officer';
    if (roleBadge) roleBadge.textContent = `Role: ${ROLE_LABELS[staffData.role] || staffData.role || 'Staff Officer'}`;

    updateHeaderAvatar(picUrl);
  }

  // Profile Picture Upload Listeners
  const staffPicFile = document.getElementById('staff-pic-file-input');
  const staffPicUrl = document.getElementById('staff-pic-url-input');
  const staffPicHidden = document.getElementById('staff-profile-picture-val');
  const staffPicPreview = document.getElementById('staff-profile-avatar-preview');
  const staffPicPlaceholder = document.getElementById('staff-profile-avatar-placeholder');

  staffPicFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        if (staffPicHidden) staffPicHidden.value = base64;
        if (staffPicPreview) {
          staffPicPreview.src = base64;
          staffPicPreview.style.display = 'block';
        }
        if (staffPicPlaceholder) staffPicPlaceholder.style.display = 'none';
        if (staffPicUrl) staffPicUrl.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  staffPicUrl?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      if (staffPicHidden) staffPicHidden.value = url;
      if (staffPicPreview) {
        staffPicPreview.src = url;
        staffPicPreview.style.display = 'block';
      }
      if (staffPicPlaceholder) staffPicPlaceholder.style.display = 'none';
    } else {
      if (staffPicHidden) staffPicHidden.value = '';
      if (staffPicPreview) staffPicPreview.style.display = 'none';
      if (staffPicPlaceholder) staffPicPlaceholder.style.display = 'block';
    }
  });

  // Profile Form Submit Handler
  const profileForm = document.getElementById('staff-profile-form');
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const empId = user.empId || user.uid;
    const personalEmail = document.getElementById('staff-profile-personal-email')?.value.trim();
    const phoneNumber = document.getElementById('staff-profile-phone')?.value.trim();
    const address = document.getElementById('staff-profile-address')?.value.trim();
    const profilePicture = document.getElementById('staff-profile-picture-val')?.value.trim() || '';
    const saveMsg = document.getElementById('staff-profile-save-msg');

    // Validate phone number: exactly 10 digits
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      alert('Phone number must contain exactly 10 digits (e.g. 0771234567).');
      document.getElementById('staff-profile-phone')?.focus();
      return;
    }

    // Validate personal email format
    if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      alert('Please enter a valid personal email address.');
      document.getElementById('staff-profile-personal-email')?.focus();
      return;
    }

    // Optional password change validation
    const newPassword = document.getElementById('staff-profile-new-password')?.value.trim();
    const confirmPassword = document.getElementById('staff-profile-confirm-password')?.value.trim();

    if (newPassword || confirmPassword) {
      if (!newPassword || newPassword.length < 8) {
        alert('New password must contain at least 8 characters.');
        document.getElementById('staff-profile-new-password')?.focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match. Please re-enter identical passwords to confirm.');
        document.getElementById('staff-profile-confirm-password')?.focus();
        return;
      }
    }

    const payload = {
      personalEmail,
      phoneNumber,
      profilePicture,
      address
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      const updated = await userApi.updateInternalProfile(empId, payload);
      const currentUser = JSON.parse(localStorage.getItem('livingora_user') || '{}');
      const mergedUser = {
        ...currentUser,
        personalEmail,
        phoneNumber,
        address,
        profilePicture: profilePicture || currentUser.profilePicture
      };
      localStorage.setItem('livingora_user', JSON.stringify(mergedUser));

      try {
        let localUsers = JSON.parse(localStorage.getItem('livingora_demo_internal_users') || '[]');
        localUsers = localUsers.map(u => (u.empId === empId || u.uid === empId) ? { ...u, ...payload } : u);
        localStorage.setItem('livingora_demo_internal_users', JSON.stringify(localUsers));
      } catch (err) {}

      updateHeaderAvatar(profilePicture);
      const newPassEl = document.getElementById('staff-profile-new-password');
      const confPassEl = document.getElementById('staff-profile-confirm-password');
      if (newPassEl) newPassEl.value = '';
      if (confPassEl) confPassEl.value = '';

      if (saveMsg) {
        saveMsg.textContent = '✓ Profile details saved successfully in database!';
        saveMsg.style.color = 'var(--success, #22c55e)';
        saveMsg.style.display = 'inline-block';
        setTimeout(() => { saveMsg.style.display = 'none'; }, 4000);
      }
      alert('Your personal details have been updated successfully in the database.');
    } catch (err) {
      console.warn('Backend profile update failed, saving locally:', err);
      const currentUser = JSON.parse(localStorage.getItem('livingora_user') || '{}');
      const mergedUser = {
        ...currentUser,
        personalEmail,
        phoneNumber,
        address,
        profilePicture: profilePicture || currentUser.profilePicture
      };
      localStorage.setItem('livingora_user', JSON.stringify(mergedUser));

      try {
        let localUsers = JSON.parse(localStorage.getItem('livingora_demo_internal_users') || '[]');
        localUsers = localUsers.map(u => (u.empId === empId || u.uid === empId) ? { ...u, ...payload } : u);
        localStorage.setItem('livingora_demo_internal_users', JSON.stringify(localUsers));
      } catch (err) {}

      updateHeaderAvatar(profilePicture);
      if (saveMsg) {
        saveMsg.textContent = '✓ Profile details saved locally.';
        saveMsg.style.color = 'var(--success, #22c55e)';
        saveMsg.style.display = 'inline-block';
        setTimeout(() => { saveMsg.style.display = 'none'; }, 4000);
      }
      alert('Your personal details have been updated.');
    }
  });

  // Initialise badge on page load
  updateDeletionsBadge();

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

  // Promotion Modal & Action Listeners Setup
  const promoModal = document.getElementById('add-promo-modal');
  const btnOpenPromoModal = document.getElementById('btn-open-create-promo-modal');
  const btnClosePromoModal = document.getElementById('btn-close-promo-modal');
  const btnCancelPromoModal = document.getElementById('btn-cancel-promo-modal');
  const promoForm = document.getElementById('promo-manage-form');

  if (btnOpenPromoModal) {
    btnOpenPromoModal.addEventListener('click', () => {
      if (promoForm) promoForm.reset();
      const idEl = document.getElementById('promo-form-id');
      const titleEl = document.getElementById('promo-modal-title');
      if (idEl) idEl.value = '';
      if (titleEl) titleEl.textContent = 'Create Promotional Campaign';
      openModal('add-promo-modal');
    });
  }

  if (btnClosePromoModal) {
    btnClosePromoModal.addEventListener('click', () => {
      closeModal('add-promo-modal');
    });
  }

  if (btnCancelPromoModal) {
    btnCancelPromoModal.addEventListener('click', () => {
      closeModal('add-promo-modal');
    });
  }

  if (promoForm) {
    promoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
            const id = document.getElementById('promo-form-id').value;
      const title = document.getElementById('promo-form-title').value;
      const code = document.getElementById('promo-form-code').value.toUpperCase();
      const discount = Number(document.getElementById('promo-form-discount').value);
      const type = document.getElementById('promo-form-type').value;
      const start = document.getElementById('promo-form-start').value;
      const end = document.getElementById('promo-form-end').value;
      const criteria = document.getElementById('promo-form-criteria').value;
      const about = document.getElementById('promo-form-about').value;
      const btnText = document.getElementById('promo-form-button-text').value;
      const validPeriod = document.getElementById('promo-form-validity').value;
      const banner = document.getElementById('promo-form-banner').value;
      const assignedApt = document.getElementById('promo-form-assigned-apt').value;
      const statusVal = document.getElementById('promo-form-status').value;

      if (!id) {
          const existing = cachedPromos.find(p => p.promotionCode === code);
          if (existing) {
              alert('Promotion code already exists.');
              return;
          }
      }

      const payload = {
        promotionTitle: title,
        promotionCode: code,
        discountPrecentage: discount,
        promotionType: type,
        startDate: start,
        endDate: end,
        eligibilityCriteria: criteria,
        about: about,
        buttonText: btnText,
        bannerImage: banner,
        validityPeriod: validPeriod,
        assinedApartment: assignedApt || 'All',
        status: statusVal,
        campaignPerformance: 'N/A'
      };

      const user = JSON.parse(localStorage.getItem('livingora_user') || '{}');
      const staffRole = user.role || 'SALES_MANAGER';

      try {
        let url = 'http://localhost:8080/api/promotions';
        let method = 'POST';
        if (id) {
          url = `http://localhost:8080/api/promotions/${id}`;
          method = 'PUT';
        }

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Staff-Role': staffRole
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert(id ? 'Promotion updated successfully!' : 'Promotion created successfully!');
          closeModal('add-promo-modal');
          await renderPromotions();
          return;
        } else {
          const err = await res.text();
          alert('Error saving promotion: ' + err);
        }
      } catch (err) {
        // Fallback for local demo mode
        if (id) {
          cachedPromos = cachedPromos.map(p => p.promotionId === id ? { ...p, ...payload } : p);
        } else {
          const newId = 'PROMO-' + (Date.now() % 10000);
          cachedPromos.unshift({ ...payload, promotionId: newId, status: 'ACTIVE' });
        }
        alert(id ? 'Promotion updated successfully!' : 'Promotion created successfully!');
        closeModal('add-promo-modal');
        renderPromotions();
      }
    });
  }

  // Render Promotions (Coordinated by Sales Managers & Operations Directors)
  let cachedPromos = [];

  async function renderPromotions() {
    const tbody = document.getElementById('ops-promotions-tbody');
    if (!tbody) return;

    try {
      const res = await fetch('http://localhost:8080/api/promotions');
      if (res.ok) {
        const promos = await res.json();
        if (Array.isArray(promos)) {
          cachedPromos = promos;
        }
      }
    } catch (e) {
      console.warn('Could not fetch live promotions:', e);
    }

    if (cachedPromos.length === 0) {
      cachedPromos = [
        { promotionId: 'PROMO-001', promotionCode: 'ORA2026', promotionTitle: 'New Year Grand Discount', promotionType: 'Discount Code', discountPrecentage: 5.0, startDate: '2026-09-30', endDate: '2026-12-30', eligibilityCriteria: 'All buyers', about: 'New year discount', status: 'ACTIVE' },
        { promotionId: 'PROMO-002', promotionCode: 'ORARLY', promotionTitle: 'Early Reservation Bonus', promotionType: 'Discount Code', discountPrecentage: 10.0, startDate: '2026-09-30', endDate: '2026-12-30', eligibilityCriteria: 'Min 20% down payment', about: 'Early bird bonus', status: 'ACTIVE' },
        { promotionId: 'PROMO-003', promotionCode: 'ORAFAMILY', promotionTitle: 'Family Home Offer', promotionType: 'Discount Code', discountPrecentage: 7.5, startDate: '2026-09-30', endDate: '2026-12-30', eligibilityCriteria: '3+ bedroom units', about: 'Family offer', status: 'ACTIVE' }
      ];
    }

    const computeStatus = (p) => {
      if (p.status === 'INACTIVE') return { label: 'INACTIVE', color: '#ef4444' };
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      if (today < start) return { label: 'SCHEDULED', color: '#f59e0b' };
      if (today > end) return { label: 'EXPIRED', color: '#6b7280' };
      return { label: 'ACTIVE', color: '#10b981' };
    };

    tbody.innerHTML = cachedPromos.map(p => {
      const st = computeStatus(p);
      return `
        <tr>
          <td><strong style="color: var(--primary); font-family: monospace;">${p.promotionCode || p.promotionId}</strong></td>
          <td>${p.promotionTitle}</td>
          <td><span class="badge badge-gold">${p.promotionType}</span></td>
          <td><strong style="color: var(--success);">${p.discountPrecentage || 0}%</strong></td>
          <td>${p.startDate || ''} &rarr; ${p.endDate || ''}</td>
          <td>
            <span style="font-size: 0.75rem; font-weight: bold; color: ${st.color}; border: 1px solid ${st.color}; padding: 2px 8px; border-radius: 12px;">
              ${st.label}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-sm btn-outline btn-toggle-promo" data-id="${p.promotionId}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                ${p.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
              </button>
              <button class="btn btn-sm btn-outline btn-edit-promo" data-id="${p.promotionId}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                Edit
              </button>
              <button class="btn btn-sm btn-outline btn-delete-promo" data-id="${p.promotionId}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-color: #ef4444; color: #ef4444;">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners for action buttons
    tbody.querySelectorAll('.btn-toggle-promo').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const user = JSON.parse(localStorage.getItem('livingora_user') || '{}');
        try {
          await fetch(`http://localhost:8080/api/promotions/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'X-Staff-Role': user.role || 'SALES_MANAGER' }
          });
        } catch (e) {}
        cachedPromos = cachedPromos.map(p => {
          if (p.promotionId === id) {
            return { ...p, status: p.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE' };
          }
          return p;
        });
        renderPromotions();
      });
    });

    tbody.querySelectorAll('.btn-edit-promo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const promo = cachedPromos.find(p => p.promotionId === id);
        if (promo) {
                    document.getElementById('promo-form-id').value = promo.promotionId;
          document.getElementById('promo-form-title').value = promo.promotionTitle || '';
          document.getElementById('promo-form-code').value = promo.promotionCode || '';
          document.getElementById('promo-form-code').disabled = true;
          document.getElementById('promo-form-discount').value = promo.discountPrecentage || '';
          document.getElementById('promo-form-type').value = promo.promotionType || 'Discount Code';
          document.getElementById('promo-form-start').value = promo.startDate || '';
          document.getElementById('promo-form-end').value = promo.endDate || '';
          document.getElementById('promo-form-criteria').value = promo.eligibilityCriteria || '';
          document.getElementById('promo-form-about').value = promo.about || '';
          
          document.getElementById('promo-form-button-text').value = promo.buttonText || '';
          document.getElementById('promo-form-validity').value = promo.validityPeriod || '';
          document.getElementById('promo-form-banner').value = promo.bannerImage || '';
          document.getElementById('promo-form-assigned-apt').value = promo.assinedApartment === 'All' ? '' : (promo.assinedApartment || '');
          document.getElementById('promo-form-status').value = promo.status || 'ACTIVE';

          document.getElementById('promo-modal-title').textContent = 'Edit Promotional Campaign';
          openModal('add-promo-modal');
        }
      });
    });

    tbody.querySelectorAll('.btn-delete-promo').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this promotion?')) return;
        const user = JSON.parse(localStorage.getItem('livingora_user') || '{}');
        try {
          await fetch(`http://localhost:8080/api/promotions/${id}`, {
            method: 'DELETE',
            headers: { 'X-Staff-Role': user.role || 'SALES_MANAGER' }
          });
        } catch (e) {}
        cachedPromos = cachedPromos.filter(p => p.promotionId !== id);
        renderPromotions();
      });
    });
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


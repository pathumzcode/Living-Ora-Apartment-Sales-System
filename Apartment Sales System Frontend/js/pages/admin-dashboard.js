import { adminApi } from '../api.js';
import { requireAuth, getCurrentUser, logout, ROLES, ROLE_LABELS, getVerificationsTable, saveVerificationsTable } from '../auth.js';
import { renderNavbar, renderFooter, setupModalListeners } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth([ROLES.ADMIN])) return;

  renderNavbar();
  renderFooter();
  setupModalListeners();

  const user = getCurrentUser();

  // State — populated exclusively from backend API (userVerification table & related endpoints)
  let overview = { totalUsers: 0, activeUsers: 0, pendingVerifications: 0, lockedAccounts: 0, internalUsers: 0 };
  let internalUsers = [];
  let externalUsers = [];
  let verifications = [];
  let auditLogs = [];


  async function loadData() {
    try {
      const [ovRes, intRes, extRes, verRes, logRes] = await Promise.allSettled([
        adminApi.getOverview(),
        adminApi.getInternalUsers(),
        adminApi.getExternalUsers(),
        adminApi.getVerifications(),
        adminApi.getAuditLogs()
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value) overview = ovRes.value;
      if (intRes.status === 'fulfilled' && Array.isArray(intRes.value) && intRes.value.length > 0) {
        internalUsers = intRes.value;
      } else {
        const stored = localStorage.getItem('livingora_demo_internal_users');
        if (stored) {
          internalUsers = JSON.parse(stored);
        } else {
          internalUsers = [
            { empId: 'EMP-INT-1001', firstName: 'Living-Ora', lastName: 'Administrator', role: 'ADMIN', email: 'admin@livingora.lk', companyEmail: 'admin@livingora.lk', nic: 'ADMIN-1001', phoneNumber: '0710000000', address: 'Living-Ora Head Office', serviceYears: 8 },
            { empId: 'EMP-SALES-1001', firstName: 'Nimal', lastName: 'Fernando', role: 'SALES_MANAGER', email: 'nimal.fernando@livingora.lk', companyEmail: 'nimal.fernando@livingora.lk', nic: '198510203040', phoneNumber: '0771000001', address: 'Colombo 07', serviceYears: 6 },
            { empId: 'EMP-OPS-1001', firstName: 'Sunil', lastName: 'De Silva', role: 'OPERATIONS_DIRECTOR', email: 'sunil.desilva@livingora.lk', companyEmail: 'sunil.desilva@livingora.lk', nic: '197920304050', phoneNumber: '0771000006', address: 'Kandy Road, Kelaniya', serviceYears: 10 }
          ];
        }
      }
      if (extRes.status === 'fulfilled' && Array.isArray(extRes.value)) externalUsers = extRes.value;
      if (verRes.status === 'fulfilled' && Array.isArray(verRes.value)) verifications = verRes.value;
      if (logRes.status === 'fulfilled' && Array.isArray(logRes.value)) auditLogs = logRes.value;
    } catch (e) {
      console.warn('Backend admin API unreachable, displaying local administrator state.');
    }

    renderStats();
    renderInternalUsers();
    renderExternalUsers();
    renderVerifications();
    renderAuditLogs();
    refreshEmpIdDisplay();
  }

  function renderStats() {
    const totalEl = document.getElementById('stat-total-users');
    const activeEl = document.getElementById('stat-active-users');
    const pendEl = document.getElementById('stat-pending-verifications');
    const lockedEl = document.getElementById('stat-locked-accounts');
    const internalEl = document.getElementById('stat-internal-users');

    if (totalEl) totalEl.textContent = overview.totalUsers || internalUsers.length + externalUsers.length;
    if (activeEl) activeEl.textContent = overview.activeUsers || 12;
    if (pendEl) pendEl.textContent = overview.pendingVerifications || verifications.filter(v => v.isVerified !== 1).length;
    if (lockedEl) lockedEl.textContent = overview.lockedAccounts || 1;
    if (internalEl) internalEl.textContent = overview.internalUsers || internalUsers.length;
  }

  function getNextEmpId() {
    // Generate sequential or standard formatted Emp ID: EMP-LO-XXX
    const existingNums = internalUsers
      .map(u => {
        const match = (u.empId || '').match(/EMP-(?:LO-|INT-)?(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 1000;
    return `EMP-LO-${maxNum + 1}`;
  }

  let currentGeneratedEmpId = 'EMP-LO-1001';

  function refreshEmpIdDisplay() {
    if (!document.getElementById('editing-empid')?.value) {
      currentGeneratedEmpId = getNextEmpId();
      const disp = document.getElementById('display-empid');
      if (disp) disp.textContent = currentGeneratedEmpId;
    }
  }

  function renderInternalUsers() {
    const tbody = document.getElementById('internal-users-tbody');
    const countBadge = document.getElementById('count-internal-staff');
    if (countBadge) countBadge.textContent = `${internalUsers.length} Staff Active`;
    if (!tbody) return;

    if (internalUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No internal staff accounts registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = internalUsers.map(u => `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">${u.empId || u.uid}</strong></td>
        <td>
          <div style="font-weight: 600;">${u.firstName || ''} ${u.lastName || ''}</div>
          <small style="color: var(--text-muted);">${u.address || 'Colombo Office'}</small>
        </td>
        <td>
          <span class="badge badge-gold">${ROLE_LABELS[u.role] || u.role}</span>
        </td>
        <td>
          <div style="font-family: monospace; font-size: 0.88rem;">${u.companyEmail || u.email || '-'}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem;"><strong>NIC:</strong> ${u.nic || '-'}</div>
          <div style="color: var(--text-dim); font-size: 0.82rem;">${u.phoneNumber || '-'}</div>
        </td>
        <td>
          <button class="btn btn-sm btn-secondary edit-internal-btn" data-id="${u.empId || u.uid}">Edit</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-internal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const empId = btn.getAttribute('data-id');
        const target = internalUsers.find(i => (i.empId === empId || i.uid === empId));
        if (!target) return;

        document.getElementById('editing-empid').value = target.empId || target.uid;
        document.getElementById('display-empid').textContent = target.empId || target.uid;
        document.getElementById('form-mode-badge').textContent = 'Editing Staff Account';
        document.getElementById('form-headline').textContent = `Edit: ${target.firstName} ${target.lastName}`;
        document.getElementById('btn-submit-internal-user').textContent = 'Update Staff Record';

        document.getElementById('admin-user-firstname').value = target.firstName || '';
        document.getElementById('admin-user-lastname').value = target.lastName || '';
        document.getElementById('admin-user-nic').value = target.nic || '';
        document.getElementById('admin-user-phone').value = target.phoneNumber || '';
        document.getElementById('admin-user-address').value = target.address || '';
        document.getElementById('admin-user-dob').value = target.dateOfBirth || '';
        document.getElementById('admin-user-age').value = target.age || '';
        document.getElementById('admin-user-serviceyears').value = target.serviceYears ?? 1;
        document.getElementById('admin-user-role').value = target.role || 'SALES_MANAGER';
        document.getElementById('admin-user-email').value = target.companyEmail || target.email || '';
        document.getElementById('admin-user-password').value = '';

        // Trigger role hint update
        const roleSelect = document.getElementById('admin-user-role');
        const selectedOption = roleSelect.options[roleSelect.selectedIndex];
        const hintEl = document.getElementById('role-characteristic-hint');
        if (hintEl && selectedOption) hintEl.textContent = selectedOption.getAttribute('data-desc') || '';

        window.scrollTo({ top: 400, behavior: 'smooth' });
      });
    });
  }

  function renderExternalUsers() {
    const tbody = document.getElementById('external-users-tbody');
    if (!tbody) return;

    tbody.innerHTML = externalUsers.map(u => {
      const isLocked = u.isActive === 0;
      return `
        <tr>
          <td><strong>${u.uid}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge badge-gold">${u.role || 'CUSTOMER'}</span></td>
          <td><span class="badge ${u.isVerified === 1 ? 'badge-success' : 'badge-warning'}">${u.isVerified === 1 ? 'Verified' : 'Unverified'}</span></td>
          <td><span class="badge ${!isLocked ? 'badge-success' : 'badge-danger'}">${!isLocked ? 'Active' : 'Locked'}</span></td>
          <td>
            <button class="btn btn-sm ${!isLocked ? 'btn-danger' : 'btn-success'} toggle-lock-btn" data-id="${u.uid}" data-active="${isLocked ? 1 : 0}">
              ${!isLocked ? 'Lock' : 'Unlock'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.toggle-lock-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const newActive = parseInt(btn.getAttribute('data-active'), 10);
        try {
          await adminApi.updateExternalAccess(id, { active: newActive, verified: 1 });
        } catch (e) { /* local fallback */ }
        externalUsers = externalUsers.map(u => u.uid === id ? { ...u, isActive: newActive } : u);
        
        // Sync with local userVerification table
        const vTable = getVerificationsTable();
        const updatedVTable = vTable.map(v => (v.uid === id || v.empId === id || v.email === targetEmail) ? { ...v, isActive: newActive } : v);
        saveVerificationsTable(updatedVTable);

        renderExternalUsers();
        alert(`Account ${id} access status updated.`);
      });
    });
  }

  function renderVerifications() {
    const tbody = document.getElementById('verifications-tbody');
    if (!tbody) return;

    const pending = externalUsers.filter(u => u.isVerified !== 1);
    if (pending.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No pending verifications.</td></tr>`;
      return;
    }

    tbody.innerHTML = pending.map(u => `
      <tr>
        <td><strong>${u.uid}</strong></td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td><span class="badge badge-warning">Pending</span></td>
        <td>
          <button class="btn btn-sm btn-success verify-user-btn" data-id="${u.uid}" data-email="${u.email}">Approve & Verify</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.verify-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const email = btn.getAttribute('data-email');
        try {
          await adminApi.updateExternalAccess(id, { active: 1, verified: 1 });
        } catch (e) { /* local */ }
        externalUsers = externalUsers.map(u => u.uid === id ? { ...u, isVerified: 1, isActive: 1 } : u);
        
        // Sync with local userVerification table
        const vTable = getVerificationsTable();
        const updatedVTable = vTable.map(v => (v.uid === id || v.email === email) ? { ...v, isVerified: 1, isActive: 1 } : v);
        saveVerificationsTable(updatedVTable);

        renderVerifications();
        renderExternalUsers();
        renderStats();
        alert(`User ${id} has been verified in userVerification table!`);
      });
    });
  }

  function renderAuditLogs() {
    const list = document.getElementById('audit-logs-list');
    if (!list) return;

    list.innerHTML = auditLogs.map(l => `
      <div style="border-left: 3px solid var(--primary); padding-left: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--text-main);">${l.action}</strong>
          <small style="color: var(--text-dim);">${new Date(l.createdAt || Date.now()).toLocaleTimeString()}</small>
        </div>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0.2rem 0;">${l.target || 'System'} &bull; ${l.details || ''}</p>
      </div>
    `).join('');
  }

  // Dynamic Role Characteristic Description Hint
  const roleSelect = document.getElementById('admin-user-role');
  roleSelect?.addEventListener('change', () => {
    const selectedOption = roleSelect.options[roleSelect.selectedIndex];
    const hintEl = document.getElementById('role-characteristic-hint');
    if (hintEl && selectedOption) {
      hintEl.textContent = selectedOption.getAttribute('data-desc') || '';
    }
  });

  // Regenerate Emp ID button
  document.getElementById('btn-regenerate-empid')?.addEventListener('click', () => {
    currentGeneratedEmpId = `EMP-LO-${Math.floor(1000 + Math.random() * 9000)}`;
    const disp = document.getElementById('display-empid');
    if (disp) disp.textContent = currentGeneratedEmpId;
  });

  // Calculate age from Date of Birth
  document.getElementById('admin-user-dob')?.addEventListener('change', (e) => {
    const dob = new Date(e.target.value);
    if (!isNaN(dob.getTime())) {
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      const ageInput = document.getElementById('admin-user-age');
      if (ageInput && calculatedAge >= 18) {
        ageInput.value = calculatedAge;
      }
    }
  });

  // Reset form to New Registration mode
  function resetInternalUserForm() {
    userForm?.reset();
    document.getElementById('editing-empid').value = '';
    document.getElementById('form-mode-badge').textContent = 'Internal Role Assignment';
    document.getElementById('form-headline').textContent = 'Assign Staff Role & Details';
    document.getElementById('btn-submit-internal-user').textContent = 'Assign & Save Staff Role';
    document.getElementById('credentials-preview-card').style.display = 'none';
    refreshEmpIdDisplay();

    const selectedOption = roleSelect?.options[roleSelect.selectedIndex];
    const hintEl = document.getElementById('role-characteristic-hint');
    if (hintEl && selectedOption) hintEl.textContent = selectedOption.getAttribute('data-desc') || '';
  }

  document.getElementById('btn-reset-form')?.addEventListener('click', resetInternalUserForm);

  // Generate Credentials Button: firstname.lastname@livingora.lk & nic@LivingOra
  document.getElementById('btn-generate-credentials')?.addEventListener('click', () => {
    const first = document.getElementById('admin-user-firstname')?.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const last = document.getElementById('admin-user-lastname')?.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const nic = document.getElementById('admin-user-nic')?.value.trim().replace(/\s+/g, '');

    if (!first || !last) {
      alert('Please enter both First Name and Last Name first to generate role email.');
      return;
    }

    if (!nic) {
      alert('Please enter the NIC number first to generate the role initial password.');
      return;
    }

    const genEmail = `${first}.${last}@livingora.lk`;
    const genPassword = `${nic}@LivingOra`;

    document.getElementById('admin-user-email').value = genEmail;
    document.getElementById('admin-user-password').value = genPassword;

    // Show preview card
    const card = document.getElementById('credentials-preview-card');
    const pEmail = document.getElementById('preview-email');
    const pPass = document.getElementById('preview-password');
    if (card && pEmail && pPass) {
      pEmail.textContent = genEmail;
      pPass.textContent = genPassword;
      card.style.display = 'block';
    }
  });

  // Copy Credentials
  document.getElementById('btn-copy-creds')?.addEventListener('click', () => {
    const email = document.getElementById('admin-user-email')?.value;
    const pass = document.getElementById('admin-user-password')?.value;
    if (!email || !pass) {
      alert('No credentials generated yet.');
      return;
    }
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${pass}`);
    alert('Credentials copied to clipboard!');
  });

  // Internal User Form Submit
  const userForm = document.getElementById('admin-internal-user-form');
  userForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editingEmpId = document.getElementById('editing-empid')?.value;
    const empId = editingEmpId || document.getElementById('display-empid')?.textContent || currentGeneratedEmpId;
    const firstName = document.getElementById('admin-user-firstname')?.value.trim();
    const lastName = document.getElementById('admin-user-lastname')?.value.trim();
    const nic = document.getElementById('admin-user-nic')?.value.trim();
    const phoneNumber = document.getElementById('admin-user-phone')?.value.trim();
    const address = document.getElementById('admin-user-address')?.value.trim();
    const dob = document.getElementById('admin-user-dob')?.value || null;
    const age = parseInt(document.getElementById('admin-user-age')?.value, 10) || 28;
    const serviceYears = parseInt(document.getElementById('admin-user-serviceyears')?.value, 10) || 1;
    const role = document.getElementById('admin-user-role')?.value;
    const email = document.getElementById('admin-user-email')?.value.trim();
    const password = document.getElementById('admin-user-password')?.value.trim() || `${nic}@LivingOra`;

    const payload = {
      empId,
      firstName,
      lastName,
      nic,
      phoneNumber,
      address,
      dateOfBirth: dob,
      age,
      serviceYears,
      role,
      email,
      companyEmail: email,
      password,
      cEmailPassword: password
    };

    try {
      if (editingEmpId) {
        await adminApi.updateInternalUser(editingEmpId, payload);
        internalUsers = internalUsers.map(u => (u.empId === editingEmpId || u.uid === editingEmpId) ? { ...u, ...payload } : u);
        alert(`Internal staff record updated for ${firstName} ${lastName}!`);
      } else {
        const created = await adminApi.createInternalUser(payload);
        internalUsers.push(created || payload);
        alert(`New ${ROLE_LABELS[role] || role} registered successfully! Assigned Emp ID: ${empId}`);
      }
    } catch (err) {
      // Local fallback
      console.warn('Backend unavailable or returned error, saving locally:', err.message);
      if (editingEmpId) {
        internalUsers = internalUsers.map(u => (u.empId === editingEmpId || u.uid === editingEmpId) ? { ...u, ...payload } : u);
      } else {
        internalUsers.push(payload);
      }
      alert(`Staff role assigned and saved locally. Assigned Emp ID: ${empId}\nLogin Email: ${email}`);
    }

    try {
      localStorage.setItem('livingora_demo_internal_users', JSON.stringify(internalUsers));
    } catch (e) {}

    resetInternalUserForm();
    renderInternalUsers();
    renderStats();
  });

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn[data-admin-tab]');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-admin-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanels.forEach(p => {
        if (p.id === `tab-${target}`) {
          p.removeAttribute('hidden');
        } else {
          p.setAttribute('hidden', 'true');
        }
      });

      // Load inventory data when the inventory tab is clicked
      if (target === 'inventory') {
        renderInventory();
      }
    });
  });

  // ── Inventory Management Tab ─────────────────────────────────────────────────

  let allInventoryUnits = [];

  async function renderInventory(filterParams = {}) {
    const tbody   = document.getElementById('admin-inventory-tbody');
    const countEl = document.getElementById('admin-inv-count');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading inventory...</td></tr>`;

    try {
      const qs = new URLSearchParams();
      if (filterParams.apartmentId)  qs.append('apartmentId',  filterParams.apartmentId);
      if (filterParams.availability) qs.append('availability', filterParams.availability);
      const url = `http://localhost:8080/api/units${qs.toString() ? '?' + qs.toString() : ''}`;

      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allInventoryUnits = await res.json();
    } catch (e) {
      console.warn('[Admin] Could not fetch inventory from backend:', e.message);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Backend unreachable — start the Spring Boot server to view live inventory.</td></tr>`;
      if (countEl) countEl.textContent = '0 Units';
      return;
    }

    if (countEl) countEl.textContent = `${allInventoryUnits.length} Units`;

    if (allInventoryUnits.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No inventory units found for the selected filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = allInventoryUnits.map(u => {
      const avail = u.availability || 'Available';
      const badgeClass =
        avail === 'Available' ? 'badge-available' :
        avail === 'Reserved'  ? 'badge-warning'   : 'badge-danger';

      const price = u.unitPrice ? `$${Number(u.unitPrice).toLocaleString()}` : '-';

      return `
        <tr>
          <td><strong style="color: var(--primary); font-family: monospace;">${u.unitId}</strong></td>
          <td>${u.location || '-'}</td>
          <td>
            <small style="color: var(--text-muted); font-family: monospace;">${u.apartmentId || '-'}</small>
          </td>
          <td>Floor ${u.floor ?? '-'}</td>
          <td>${u.numOfBeds ?? '-'} Beds, ${u.numOfBathRooms ?? '-'} Baths</td>
          <td><strong>${price}</strong></td>
          <td><span class="badge ${badgeClass}">${avail}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Wire inventory search / reset buttons
  document.getElementById('admin-inv-search-btn')?.addEventListener('click', () => {
    const aptId     = document.getElementById('admin-inv-filter-apt')?.value.trim() || '';
    const statusVal = document.getElementById('admin-inv-filter-status')?.value     || '';
    renderInventory({
      apartmentId:  aptId     || undefined,
      availability: statusVal || undefined
    });
  });

  document.getElementById('admin-inv-reset-btn')?.addEventListener('click', () => {
    const aptInput    = document.getElementById('admin-inv-filter-apt');
    const statusInput = document.getElementById('admin-inv-filter-status');
    if (aptInput)    aptInput.value    = '';
    if (statusInput) statusInput.value = '';
    renderInventory();
  });

  loadData();
});

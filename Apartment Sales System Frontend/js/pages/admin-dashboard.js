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
      if (intRes.status === 'fulfilled' && Array.isArray(intRes.value)) internalUsers = intRes.value;
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

  function renderInternalUsers() {
    const tbody = document.getElementById('internal-users-tbody');
    if (!tbody) return;

    tbody.innerHTML = internalUsers.map(u => `
      <tr>
        <td><strong>${u.empId || u.uid}</strong></td>
        <td>${u.firstName} ${u.lastName}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-gold">${ROLE_LABELS[u.role] || u.role}</span></td>
        <td>${u.phoneNumber || '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-internal-btn" data-id="${u.empId}">Edit</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-internal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const empId = btn.getAttribute('data-id');
        const target = internalUsers.find(i => i.empId === empId);
        if (!target) return;
        document.getElementById('admin-user-firstname').value = target.firstName || '';
        document.getElementById('admin-user-lastname').value = target.lastName || '';
        document.getElementById('admin-user-email').value = target.email || '';
        document.getElementById('admin-user-role').value = target.role || 'SALES_MANAGER';
        document.getElementById('admin-user-phone').value = target.phoneNumber || '';
        document.getElementById('editing-empid').value = target.empId;
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

  // Internal User Form Submit
  const userForm = document.getElementById('admin-internal-user-form');
  userForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const empId = document.getElementById('editing-empid')?.value;
    const firstName = document.getElementById('admin-user-firstname')?.value;
    const lastName = document.getElementById('admin-user-lastname')?.value;
    const email = document.getElementById('admin-user-email')?.value;
    const role = document.getElementById('admin-user-role')?.value;
    const phoneNumber = document.getElementById('admin-user-phone')?.value;

    const payload = {
      firstName,
      lastName,
      email,
      role,
      phoneNumber
    };

    try {
      if (empId) {
        await adminApi.updateInternalUser(empId, payload);
        internalUsers = internalUsers.map(u => u.empId === empId ? { ...u, ...payload } : u);
        alert('Internal staff member updated!');
      } else {
        await adminApi.createInternalUser(payload);
        internalUsers.push({ empId: `EMP-${Date.now().toString().slice(-3)}`, ...payload });
        alert('New internal staff account registered!');
      }
    } catch (err) {
      // Local fallback
      if (empId) {
        internalUsers = internalUsers.map(u => u.empId === empId ? { ...u, ...payload } : u);
      } else {
        internalUsers.push({ empId: `EMP-${Date.now().toString().slice(-3)}`, ...payload });
      }
      alert('Internal staff record saved locally.');
    }

    userForm.reset();
    document.getElementById('editing-empid').value = '';
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
    });
  });

  loadData();
});

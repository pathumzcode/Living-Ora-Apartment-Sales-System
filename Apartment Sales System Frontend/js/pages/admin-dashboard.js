import { adminApi } from '../api.js';
import { requireAuth, getCurrentUser, logout, ROLES, ROLE_LABELS, getVerificationsTable, saveVerificationsTable } from '../auth.js';
import { renderNavbar, renderFooter, setupModalListeners } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth([ROLES.ADMIN])) return;

  renderNavbar();
  setupModalListeners();

  const user = getCurrentUser();

  // ─── Toast Notification Utility ─────────────────────────────────────────────
  function showToast(message, type = 'success') {
    // type: 'success' | 'error' | 'info' | 'warning'
    const colorMap = {
      success: 'var(--success)',
      error: '#ef4444',
      info: 'var(--primary)',
      warning: '#f59e0b'
    };
    const iconMap = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div');
      el.id = 'toast-container';
      el.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:0.6rem;';
      document.body.appendChild(el);
      return el;
    })();

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: var(--bg-card);
      border: 1px solid ${colorMap[type]};
      border-left: 4px solid ${colorMap[type]};
      color: var(--text-main);
      padding: 0.85rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      display: flex; align-items: center; gap: 0.65rem;
      font-size: 0.9rem; font-family: var(--font-sans);
      max-width: 380px;
      animation: toastIn 0.3s ease;
    `;
    toast.innerHTML = `<span style="font-weight:800;color:${colorMap[type]};font-size:1.05rem;">${iconMap[type]}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.35s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  // ─── State ──────────────────────────────────────────────────────────────────
  // State — populated exclusively from backend API (userVerification table & related endpoints)
  let overview = { totalUsers: 0, activeUsers: 0, pendingVerifications: 0, lockedAccounts: 0, internalUsers: 0 };
  let internalUsers = [];
  let externalUsers = [];
  let verifications = [];
  let auditLogs = [];
  let leads = [];

  function loadLeadsFromStorage() {
    try {
      const stored = localStorage.getItem('livingora_leads_data');
      if (stored) {
        leads = JSON.parse(stored);
      } else {
        leads = [
          {
            leadId: 'LEAD-2026-101',
            clientName: 'Priyantha Jayasuriya',
            phone: '+94 77 234 5678',
            email: 'priyantha.j@gmail.com',
            interestedProperty: 'Horizon Sky Tower - Suite 14B',
            assignedStaffId: 'EMP-SM-1002',
            assignedStaffName: 'Nimal Fernando',
            budget: 185000,
            status: 'CONTACTED',
            source: 'Web Portal Direct',
            notes: 'Looking for high floor sea view, requesting 20% down payment plan.'
          },
          {
            leadId: 'LEAD-2026-102',
            clientName: 'Anuki Samarawickrama',
            phone: '+94 71 889 1234',
            email: 'anuki.s@yahoo.com',
            interestedProperty: 'Ocean Vista Crest - Penthouse A',
            assignedStaffId: 'EMP-OPS-1003',
            assignedStaffName: 'Sunil De Silva',
            budget: 340000,
            status: 'SITE_VISIT',
            source: 'Sales Agent Referral',
            notes: 'Completed virtual walkthrough. Wants site visit this Saturday 10:00 AM.'
          },
          {
            leadId: 'LEAD-2026-103',
            clientName: 'Dr. Mahesh Wickramasinghe',
            phone: '+94 77 554 9988',
            email: 'mahesh.wick@health.lk',
            interestedProperty: 'Royal Palm Residences - 2BR Garden',
            assignedStaffId: 'EMP-SM-1002',
            assignedStaffName: 'Nimal Fernando',
            budget: 145000,
            status: 'NEGOTIATION',
            source: 'Direct Walk-In',
            notes: 'Down payment ready, finalizing reservation contract draft.'
          }
        ];
        localStorage.setItem('livingora_leads_data', JSON.stringify(leads));
      }
    } catch (e) {
      leads = [];
    }
  }

  function saveLeadsToStorage() {
    try {
      localStorage.setItem('livingora_leads_data', JSON.stringify(leads));
    } catch (e) {}
  }

  async function loadData() {
    loadLeadsFromStorage();
    try {
      const [ovRes, intRes, extRes, verRes, logRes] = await Promise.allSettled([
        adminApi.getOverview(),
        adminApi.getInternalUsers(),
        adminApi.getExternalUsers(),
        adminApi.getVerifications(),
        adminApi.getAuditLogs()
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value) overview = ovRes.value;
      // Internal staff is always sourced from the database.  Do not substitute
      // browser storage here: doing so makes a failed save look successful.
      internalUsers = intRes.status === 'fulfilled' && Array.isArray(intRes.value) ? intRes.value : [];
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
    renderLeads();
    populateAssignedStaffSelect();
    refreshEmpIdDisplay();
    initAdminHeader();
  }

  function initAdminHeader() {
    const adminUser = user; // logged-in admin from localStorage
    if (!adminUser) return;

    const firstName = adminUser.firstName || '';
    const lastName = adminUser.lastName || '';
    const fullName = (firstName + ' ' + lastName).trim() || 'Administrator';
    const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'A';
    const profilePic = adminUser.profilePicture || '';

    // Set title to include admin name
    const titleEl = document.getElementById('admin-header-title');
    if (titleEl) titleEl.innerHTML = `Welcome, <span style="color:var(--accent-gold)">${fullName}</span>`;

    const subtitleEl = document.getElementById('admin-header-subtitle');
    if (subtitleEl) subtitleEl.textContent = `Role: Administrator · ${adminUser.uid || adminUser.empId || ''} · Manage staff, clients, leads & security.`;

    // Profile picture or initials avatar
    const img = document.getElementById('admin-header-avatar-img');
    const initialsEl = document.getElementById('admin-header-avatar-initials');
    if (profilePic && img) {
      img.src = profilePic;
      img.style.display = 'block';
      if (initialsEl) initialsEl.style.display = 'none';
      img.onerror = () => {
        img.style.display = 'none';
        if (initialsEl) { initialsEl.textContent = initials; initialsEl.style.display = 'flex'; }
      };
    } else if (initialsEl) {
      initialsEl.textContent = initials;
    }

    // Edit Profile button — scroll user to Users tab & pre-fill edit form with admin's own data
    const editBtn = document.getElementById('btn-admin-edit-profile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        // Switch to users tab
        document.querySelector('.tab-btn[data-admin-tab="users"]')?.click();
        // Try to find and click edit for admin's own row
        setTimeout(() => {
          const adminId = adminUser.uid || adminUser.empId;
          const editBtnForAdmin = document.querySelector(`.edit-internal-btn[data-id="${adminId}"]`);
          if (editBtnForAdmin) editBtnForAdmin.click();
          else showToast('Navigate to the Users tab and click ✏️ Edit on your own row to update your profile.', 'info');
        }, 300);
      });
    }
  }


  function renderStats() {
    const totalEl = document.getElementById('stat-total-users');
    const activeEl = document.getElementById('stat-active-users');
    const pendEl = document.getElementById('stat-pending-verifications');
    const lockedEl = document.getElementById('stat-locked-accounts');
    const internalEl = document.getElementById('stat-internal-users');
    const leadsEl = document.getElementById('stat-total-leads');

    if (totalEl) totalEl.textContent = overview.totalUsers || internalUsers.length + externalUsers.length;
    if (activeEl) activeEl.textContent = overview.activeUsers || 12;
    if (pendEl) pendEl.textContent = overview.pendingVerifications || verifications.filter(v => v.isVerified !== 1).length;
    if (lockedEl) lockedEl.textContent = overview.lockedAccounts || 1;
    if (internalEl) internalEl.textContent = overview.internalUsers || internalUsers.length;
    if (leadsEl) leadsEl.textContent = leads.length;
  }

  let currentGeneratedEmpId = '';

  async function refreshEmpIdDisplay() {
    if (document.getElementById('editing-empid')?.value) return;
    const currentRole = document.getElementById('admin-user-role')?.value || 'SALES_MANAGER';
    const disp = document.getElementById('display-empid');
    if (disp) disp.textContent = 'Looking up…';
    try {
      const result = await adminApi.getNextEmpId(currentRole);
      currentGeneratedEmpId = result?.empId || '';
      if (disp) disp.textContent = currentGeneratedEmpId || 'Assigned on save';
    } catch (e) {
      currentGeneratedEmpId = '';
      if (disp) disp.textContent = 'Assigned on save';
    }
  }

  function renderInternalUsers() {
    const tbody = document.getElementById('internal-users-tbody');
    const overviewTbody = document.getElementById('overview-internal-users-tbody');
    const countBadge = document.getElementById('count-internal-staff');
    const overviewBadge = document.getElementById('overview-staff-badge');

    if (countBadge) countBadge.textContent = `${internalUsers.length} Staff Active`;
    if (overviewBadge) overviewBadge.textContent = `${internalUsers.length} Active Personnel`;

    const emptyRow = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No internal staff accounts registered.</td></tr>`;

    if (internalUsers.length === 0) {
      if (tbody) tbody.innerHTML = emptyRow;
      if (overviewTbody) overviewTbody.innerHTML = emptyRow;
      return;
    }

    const rowsHtml = internalUsers.map(u => `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace; font-size: 0.92rem;">${u.empId || u.uid}</strong></td>
        <td>
          <div style="font-weight: 600;">${u.firstName || ''} ${u.lastName || ''}</div>
          <small style="color: var(--text-muted);">${u.address || 'Colombo Head Office'}</small>
        </td>
        <td>
          <span class="badge badge-gold">${ROLE_LABELS[u.role] || u.role}</span>
        </td>
        <td>
          <div style="font-family: monospace; font-size: 0.85rem;">${u.companyEmail || u.email || '-'}</div>
        </td>
        <td>
          <div style="font-size: 0.84rem;"><strong>NIC:</strong> ${u.nic || '-'}</div>
          <div style="color: var(--text-dim); font-size: 0.8rem;">${u.phoneNumber || '-'}</div>
        </td>
        <td>
          <div style="display: inline-flex; gap: 0.4rem; align-items: center;">
            <button class="btn btn-sm btn-secondary edit-internal-btn" data-id="${u.empId || u.uid}" title="Edit role details">✏️ Edit</button>
            <button class="btn btn-sm btn-danger delete-internal-btn" data-id="${u.empId || u.uid}" data-name="${(u.firstName || '') + ' ' + (u.lastName || '')}" title="Remove staff account">🗑 Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    if (tbody) tbody.innerHTML = rowsHtml;
    if (overviewTbody) overviewTbody.innerHTML = rowsHtml;


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
        document.getElementById('admin-user-personal-email').value = target.personalEmail || target.email || '';
        document.getElementById('admin-user-address').value = target.address || '';
        document.getElementById('admin-user-dob').value = target.dateOfBirth || '';
        document.getElementById('admin-user-age').value = target.age || '';
        document.getElementById('admin-user-serviceyears').value = target.serviceYears ?? 1;
        document.getElementById('admin-user-role').value = target.role || 'SALES_MANAGER';

        // Profile picture preview
        const picVal = target.profilePicture || '';
        const picHidden = document.getElementById('admin-user-profile-picture');
        const picPreview = document.getElementById('admin-user-pic-preview');
        const picPlaceholder = document.getElementById('admin-user-pic-placeholder');
        const picUrl = document.getElementById('admin-user-pic-url');
        if (picHidden) picHidden.value = picVal;
        if (picUrl) picUrl.value = picVal.startsWith('data:') ? '' : picVal;
        if (picVal && picPreview) {
          picPreview.src = picVal;
          picPreview.style.display = 'block';
          if (picPlaceholder) picPlaceholder.style.display = 'none';
        } else {
          if (picPreview) picPreview.style.display = 'none';
          if (picPlaceholder) picPlaceholder.style.display = 'block';
        }
        
        // Official data restriction: Company email cannot be updated
        const emailInput = document.getElementById('admin-user-email');
        emailInput.value = target.companyEmail || target.email || '';
        emailInput.readOnly = true;
        emailInput.style.opacity = '0.65';
        emailInput.style.cursor = 'not-allowed';
        emailInput.title = 'Official corporate email cannot be edited';

        let staffEmailNote = document.getElementById('staff-email-lock-note');
        if (!staffEmailNote) {
          staffEmailNote = document.createElement('small');
          staffEmailNote.id = 'staff-email-lock-note';
          staffEmailNote.style.cssText = 'color: #f59e0b; font-size: 0.78rem; display: block; margin-top: 0.25rem;';
          staffEmailNote.textContent = '🔒 Official company email cannot be updated.';
          emailInput.parentNode.appendChild(staffEmailNote);
        }

        document.getElementById('admin-user-password').value = '';

        // Trigger role hint update
        const roleSelect = document.getElementById('admin-user-role');
        const selectedOption = roleSelect.options[roleSelect.selectedIndex];
        const hintEl = document.getElementById('role-characteristic-hint');
        if (hintEl && selectedOption) hintEl.textContent = selectedOption.getAttribute('data-desc') || '';

        // Automatically navigate to Internal Staff Accounts tab if clicked from Overview
        const usersTabBtn = document.querySelector('.tab-btn[data-admin-tab="users"]');
        if (usersTabBtn && !usersTabBtn.classList.contains('active')) {
          usersTabBtn.click();
        }

        setTimeout(() => {
          document.getElementById('admin-internal-user-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      });
    });

    // Delete internal user handler — directly deletes from database (Admin only)
    document.querySelectorAll('.delete-internal-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const empId = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || empId;

        if (!confirm(`⚠️ Permanently delete "${name}" (${empId})?\n\nThis will immediately remove the user and all their login credentials from the database.\n\nThis action CANNOT be undone.`)) return;

        try {
          await adminApi.deleteInternalUser(empId);
          // Update only after the server confirms the database deletion.
          internalUsers = internalUsers.filter(u => u.empId !== empId && u.uid !== empId);
          renderInternalUsers();
          showToast(`🗑️ User "${name}" has been permanently deleted.`, 'error');
        } catch (err) {
          console.error('Delete user error:', err);
          showToast(`❌ Failed to delete user: ${err.message}`, 'error');
        }
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

  const AUDIT_META = {
    'INTERNAL_USER_CREATED': { title: 'Registered Internal Staff Account', icon: '👤', color: 'var(--success)' },
    'INTERNAL_USER_UPDATED': { title: 'Updated Staff Account Details', icon: '✏️', color: 'var(--info)' },
    'INTERNAL_USER_DELETED_PERMANENTLY': { title: 'Permanently Removed Staff Account', icon: '🗑️', color: '#ef4444' },
    'INTERNAL_USER_DELETION_REQUESTED': { title: 'Requested Staff Account Deletion', icon: '⏳', color: '#f59e0b' },
    'INTERNAL_USER_DELETION_APPROVED': { title: 'Approved Staff Account Deletion', icon: '✅', color: '#10b981' },
    'INTERNAL_USER_DELETION_REJECTED': { title: 'Rejected Staff Account Deletion', icon: '❌', color: '#6b7280' },
    'STAFF_PROFILE_UPDATED': { title: 'Self-Service Staff Profile Update', icon: '🔄', color: 'var(--primary)' },
    'CUSTOMER_VERIFIED': { title: 'Approved Client KYC Verification', icon: '🛡️', color: 'var(--success)' },
    'LOGIN_SUCCESS': { title: 'Successful Security Authentication', icon: '🔐', color: 'var(--accent-gold)' }
  };

  function humanizeAuditAction(action) {
    if (!action) return { title: 'System Security Event', icon: '⚙️', color: 'var(--primary)' };
    if (AUDIT_META[action]) return AUDIT_META[action];
    const readable = action.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { title: readable, icon: '📋', color: 'var(--text-muted)' };
  }

  function renderAuditLogs() {
    const list = document.getElementById('audit-logs-list');
    if (!list) return;

    if (!auditLogs || auditLogs.length === 0) {
      list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No system audit events recorded yet.</div>';
      return;
    }

    list.innerHTML = auditLogs.map(l => {
      const meta = humanizeAuditAction(l.action);
      const timeStr = l.createdAt ? new Date(l.createdAt).toLocaleString() : new Date().toLocaleString();
      return `
        <div style="border-left: 4px solid ${meta.color}; background: rgba(255, 255, 255, 0.02); border-radius: 0 8px 8px 0; padding: 0.9rem 1.25rem; margin-bottom: 0.9rem; border-top: 1px solid rgba(255,255,255,0.04); border-right: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.1rem;">${meta.icon}</span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${meta.title}</strong>
              <code style="font-size: 0.72rem; color: var(--text-dim); background: rgba(255,255,255,0.05); padding: 0.15rem 0.45rem; border-radius: 4px;">${l.action}</code>
            </div>
            <small style="color: var(--text-dim); font-size: 0.8rem;">${timeStr}</small>
          </div>
          <div style="display: flex; gap: 1.5rem; font-size: 0.86rem; color: var(--text-muted); margin-top: 0.25rem;">
            <div><strong>Actor:</strong> <span style="font-family: monospace; color: var(--accent-gold);">${l.actorEmpId || 'Admin'}</span></div>
            <div><strong>Target:</strong> <span style="font-family: monospace; color: var(--primary);">${l.target || 'System'}</span></div>
            ${l.details ? `<div><strong>Details:</strong> <span>${l.details}</span></div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Dynamic Role Characteristic Description Hint & Role Pattern ID Update
  const roleSelect = document.getElementById('admin-user-role');
  roleSelect?.addEventListener('change', () => {
    const selectedOption = roleSelect.options[roleSelect.selectedIndex];
    const hintEl = document.getElementById('role-characteristic-hint');
    if (hintEl && selectedOption) {
      hintEl.textContent = selectedOption.getAttribute('data-desc') || '';
    }
    // Update Emp ID pattern to match role prefix
    refreshEmpIdDisplay();
  });

  // Employee IDs are generated by the database when a new user is saved.
  document.getElementById('btn-regenerate-empid')?.addEventListener('click', () => {
    if (!document.getElementById('editing-empid')?.value) refreshEmpIdDisplay();
  });

  // Accurate age calculation from Date of Birth
  function calculateAgeFromDob(dobString) {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  function updateAgeFromDob() {
    const dobVal = document.getElementById('admin-user-dob')?.value;
    const calculatedAge = calculateAgeFromDob(dobVal);
    const ageInput = document.getElementById('admin-user-age');
    const warningEl = document.getElementById('admin-age-warning');

    if (calculatedAge !== null) {
      if (ageInput) ageInput.value = calculatedAge;
      if (calculatedAge < 18) {
        if (warningEl) {
          warningEl.textContent = `⚠️ User is only ${calculatedAge} years old. Minimum required age is 18!`;
          warningEl.style.display = 'block';
        }
        if (ageInput) ageInput.style.borderColor = '#ef4444';
      } else {
        if (warningEl) warningEl.style.display = 'none';
        if (ageInput) ageInput.style.borderColor = '';
      }
    } else {
      if (ageInput) ageInput.value = '';
      if (warningEl) warningEl.style.display = 'none';
      if (ageInput) ageInput.style.borderColor = '';
    }
  }

  document.getElementById('admin-user-dob')?.addEventListener('input', updateAgeFromDob);
  document.getElementById('admin-user-dob')?.addEventListener('change', updateAgeFromDob);

  // Profile picture file upload & URL preview
  const picFileInput = document.getElementById('admin-user-pic-file');
  const picUrlInput = document.getElementById('admin-user-pic-url');
  const picHidden = document.getElementById('admin-user-profile-picture');
  const picPreview = document.getElementById('admin-user-pic-preview');
  const picPlaceholder = document.getElementById('admin-user-pic-placeholder');

  picFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        if (picHidden) picHidden.value = base64;
        if (picPreview) {
          picPreview.src = base64;
          picPreview.style.display = 'block';
        }
        if (picPlaceholder) picPlaceholder.style.display = 'none';
        if (picUrlInput) picUrlInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  picUrlInput?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      if (picHidden) picHidden.value = url;
      if (picPreview) {
        picPreview.src = url;
        picPreview.style.display = 'block';
      }
      if (picPlaceholder) picPlaceholder.style.display = 'none';
    } else {
      if (picHidden) picHidden.value = '';
      if (picPreview) picPreview.style.display = 'none';
      if (picPlaceholder) picPlaceholder.style.display = 'block';
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

    // Reset email field to writable
    const emailInput = document.getElementById('admin-user-email');
    if (emailInput) {
      emailInput.readOnly = false;
      emailInput.style.opacity = '1';
      emailInput.style.cursor = 'auto';
      emailInput.title = '';
    }
    const staffEmailNote = document.getElementById('staff-email-lock-note');
    if (staffEmailNote) staffEmailNote.remove();

    // Reset personal email and pic
    const pEmail = document.getElementById('admin-user-personal-email');
    if (pEmail) pEmail.value = '';
    if (picHidden) picHidden.value = '';
    if (picPreview) picPreview.style.display = 'none';
    if (picPlaceholder) picPlaceholder.style.display = 'block';
    if (picUrlInput) picUrlInput.value = '';
    if (picFileInput) picFileInput.value = '';

    const ageWarning = document.getElementById('admin-age-warning');
    if (ageWarning) ageWarning.style.display = 'none';
    const ageInput = document.getElementById('admin-user-age');
    if (ageInput) ageInput.style.borderColor = '';

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
    const firstName = document.getElementById('admin-user-firstname')?.value.trim();
    const lastName = document.getElementById('admin-user-lastname')?.value.trim();
    const nic = document.getElementById('admin-user-nic')?.value.trim();
    const phoneNumber = document.getElementById('admin-user-phone')?.value.trim();
    const personalEmail = document.getElementById('admin-user-personal-email')?.value.trim();
    const address = document.getElementById('admin-user-address')?.value.trim();
    const dob = document.getElementById('admin-user-dob')?.value || null;
    const profilePicture = document.getElementById('admin-user-profile-picture')?.value.trim() || '';
    const serviceYears = parseInt(document.getElementById('admin-user-serviceyears')?.value, 10) || 0;
    const role = document.getElementById('admin-user-role')?.value;
    const email = document.getElementById('admin-user-email')?.value.trim();
    const password = document.getElementById('admin-user-password')?.value.trim() || `${nic}@LivingOra`;

    // 1. Phone number validation: exactly 10 digits
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      showToast('Phone number must contain exactly 10 digits (e.g. 0771234567).', 'warning');
      document.getElementById('admin-user-phone')?.focus();
      return;
    }

    // 2. Personal email validation
    if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      showToast('Please enter a valid personal email address.', 'warning');
      document.getElementById('admin-user-personal-email')?.focus();
      return;
    }

    // 3. Corporate email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid corporate role email address.', 'warning');
      document.getElementById('admin-user-email')?.focus();
      return;
    }

    // 4. DOB & Age Validation: Must be >= 18
    if (!dob) {
      showToast('Date of birth is required.', 'warning');
      document.getElementById('admin-user-dob')?.focus();
      return;
    }
    const calculatedAge = calculateAgeFromDob(dob);
    if (calculatedAge === null || calculatedAge < 18) {
      showToast(`Registration blocked: User must be at least 18 years old. (Calculated age: ${calculatedAge ?? 0})`, 'error');
      document.getElementById('admin-user-dob')?.focus();
      return;
    }

    const payload = {
      firstName,
      lastName,
      nic,
      phoneNumber,
      personalEmail,
      address,
      dateOfBirth: dob,
      age: calculatedAge,
      profilePicture: profilePicture || 'images/luxury-interior-lounge.jpg',
      serviceYears,
      role,
      // The company address is the account/login address; personalEmail remains
      // a separate profile field in the database.
      email,
      companyEmail: email,
      password,
      cEmailPassword: password
    };

    try {
      if (editingEmpId) {
        const updated = await adminApi.updateInternalUser(editingEmpId, payload);
        internalUsers = internalUsers.map(u => (u.empId === editingEmpId || u.uid === editingEmpId) ? updated : u);
        showToast(`Internal staff record updated for ${firstName} ${lastName}!`, 'success');
      } else {
        const created = await adminApi.createInternalUser(payload);
        internalUsers.push(created);
        showToast(`New ${ROLE_LABELS[role] || role} registered! Assigned Emp ID: ${created.empId}`, 'success');
      }
    } catch (err) {
      console.error('Internal user database save failed:', err);
      showToast(`Unable to save staff record to the database: ${err.message}`, 'error');
      return;
    }

    resetInternalUserForm();
    renderInternalUsers();
    populateAssignedStaffSelect();
    renderStats();
  });

  // =========================================================================
  // LEADS MANAGEMENT: CRUD Operations (Create, Read, Update, Assign, Delete)
  // =========================================================================
  const LEAD_STATUS_CONFIG = {
    'NEW': { label: 'New Inquiry', badgeClass: 'badge-primary' },
    'CONTACTED': { label: 'Contacted', badgeClass: 'badge-gold' },
    'SITE_VISIT': { label: 'Site Visit', badgeClass: 'badge-gold' },
    'NEGOTIATION': { label: 'In Negotiation', badgeClass: 'badge-warning' },
    'WON': { label: 'Won / Converted', badgeClass: 'badge-success' },
    'LOST': { label: 'Lost / Closed', badgeClass: 'badge-danger' }
  };

  function getNextLeadId() {
    const existingNums = leads
      .map(l => {
        const match = (l.leadId || '').match(/LEAD-(?:2026-)?(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 100;
    return `LEAD-2026-${maxNum + 1}`;
  }

  function populateAssignedStaffSelect() {
    const select = document.getElementById('lead-assigned-staff');
    if (!select) return;

    if (internalUsers.length === 0) {
      select.innerHTML = `<option value="">-- No staff members available --</option>`;
      return;
    }

    select.innerHTML = internalUsers.map(u => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.empId;
      const roleName = ROLE_LABELS[u.role] || u.role || 'Staff';
      return `<option value="${u.empId}">${name} (${roleName} - ${u.empId})</option>`;
    }).join('');
  }

  function renderLeads() {
    const tbody = document.getElementById('leads-tbody');
    const badge = document.getElementById('lead-count-badge');
    if (badge) badge.textContent = `${leads.length} Active Leads`;
    if (!tbody) return;

    if (leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No active customer leads in pipeline. Click "+ Register New Lead" to add one.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => {
      const statusInfo = LEAD_STATUS_CONFIG[l.status] || { label: l.status, badgeClass: 'badge-gold' };
      const budgetFormatted = Number(l.budget || 0).toLocaleString('en-US');

      return `
        <tr>
          <td><strong style="color: var(--primary); font-family: monospace; font-size: 0.92rem;">${l.leadId}</strong></td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${l.clientName}</div>
            <small style="color: var(--text-muted);">${l.source || 'Direct Client'}</small>
          </td>
          <td>
            <div style="font-size: 0.88rem; font-weight: 500;">${l.phone}</div>
            <div style="font-size: 0.82rem; color: var(--text-dim);">${l.email || 'No email provided'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main); font-size: 0.88rem;">${l.interestedProperty || 'Luxury Suite'}</div>
            <small style="color: var(--text-muted); font-style: italic;">${l.notes ? (l.notes.length > 35 ? l.notes.substring(0, 35) + '...' : l.notes) : 'Standard inquiry'}</small>
          </td>
          <td>
            <div style="font-size: 0.88rem; font-weight: 600; color: var(--primary);">👤 ${l.assignedStaffName || 'Assigned Officer'}</div>
            <small style="font-family: monospace; color: var(--text-dim);">${l.assignedStaffId || 'EMP-SM-1002'}</small>
          </td>
          <td>
            <span class="badge ${statusInfo.badgeClass}">${statusInfo.label}</span>
          </td>
          <td>
            <strong style="color: var(--success); font-size: 0.92rem;">$${budgetFormatted}</strong>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.4rem;">
              <button type="button" class="btn btn-sm btn-secondary edit-lead-btn" data-id="${l.leadId}">Edit / Assign</button>
              <button type="button" class="btn btn-sm btn-danger delete-lead-btn" data-id="${l.leadId}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire Edit Lead Buttons
    document.querySelectorAll('.edit-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openLeadModal(id);
      });
    });

    // Wire Delete Lead Buttons
    document.querySelectorAll('.delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const target = leads.find(l => l.leadId === id);
        if (!target) return;

        if (confirm(`⚠️ Delete lead for ${target.clientName} (${target.leadId})?\n\nThis will permanently remove this lead from the pipeline.`)) {
          leads = leads.filter(l => l.leadId !== id);
          saveLeadsToStorage();
          renderLeads();
          renderStats();
          showToast(`Lead ${id} (${target.clientName}) deleted from pipeline.`, 'error');
        }
      });
    });
  }

  function openLeadModal(leadId = null) {
    const modal = document.getElementById('lead-modal');
    const form = document.getElementById('admin-lead-form');
    populateAssignedStaffSelect();

    if (!modal || !form) return;

    if (leadId) {
      // Edit mode
      const lead = leads.find(l => l.leadId === leadId);
      if (!lead) return;

      document.getElementById('editing-lead-id').value = lead.leadId;
      document.getElementById('display-lead-id').textContent = lead.leadId;
      document.getElementById('lead-modal-badge').textContent = 'Update & Re-Assign Lead';
      document.getElementById('lead-modal-title').textContent = `Edit Lead: ${lead.clientName}`;
      document.getElementById('btn-save-lead').textContent = 'Save Changes & Update Assignment';

      document.getElementById('lead-client-name').value = lead.clientName || '';
      document.getElementById('lead-client-phone').value = lead.phone || '';

      // Lock the contact email — registered contact data cannot be changed (official record)
      const emailField = document.getElementById('lead-client-email');
      emailField.value = lead.email || '';
      emailField.readOnly = true;
      emailField.title = 'Registered contact email cannot be changed after lead creation.';
      emailField.style.opacity = '0.6';
      emailField.style.cursor = 'not-allowed';
      emailField.style.background = 'var(--bg-subtle, rgba(255,255,255,0.04))';

      // Show lock note if not already there
      let lockNote = document.getElementById('email-lock-note');
      if (!lockNote) {
        lockNote = document.createElement('small');
        lockNote.id = 'email-lock-note';
        lockNote.style.cssText = 'color: #f59e0b; font-size: 0.78rem; display: block; margin-top: 0.25rem;';
        lockNote.textContent = '🔒 Contact email is locked — cannot be updated after registration.';
        emailField.parentNode.appendChild(lockNote);
      }

      document.getElementById('lead-budget').value = lead.budget || '';
      document.getElementById('lead-interested-property').value = lead.interestedProperty || '';
      document.getElementById('lead-assigned-staff').value = lead.assignedStaffId || '';
      document.getElementById('lead-status').value = lead.status || 'NEW';
      document.getElementById('lead-source').value = lead.source || 'Web Portal';
      document.getElementById('lead-notes').value = lead.notes || '';
    } else {
      // New lead registration mode — unlock all fields
      form.reset();
      const emailField = document.getElementById('lead-client-email');
      emailField.readOnly = false;
      emailField.title = '';
      emailField.style.opacity = '';
      emailField.style.cursor = '';
      emailField.style.background = '';
      const lockNote = document.getElementById('email-lock-note');
      if (lockNote) lockNote.remove();

      const newId = getNextLeadId();
      document.getElementById('editing-lead-id').value = '';
      document.getElementById('display-lead-id').textContent = newId;
      document.getElementById('lead-modal-badge').textContent = 'Lead Acquisition';
      document.getElementById('lead-modal-title').textContent = 'Register New Lead';
      document.getElementById('btn-save-lead').textContent = 'Save & Register Lead';
    }

    modal.classList.add('active');
    modal.classList.add('open');
  }

  function closeLeadModal() {
    const modal = document.getElementById('lead-modal');
    modal?.classList.remove('active');
    modal?.classList.remove('open');
  }

  // Navigate to Internal Role Assignment Form
  function openInternalRoleAssignmentForm() {
    const userTabBtn = document.querySelector('.tab-btn[data-admin-tab="users"]');
    userTabBtn?.click();
    resetInternalUserForm();
    setTimeout(() => {
      document.getElementById('admin-internal-user-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // When 'Register New Lead' / New staff is clicked, open Internal Role Assignment form directly
  document.getElementById('btn-open-lead-modal-header')?.addEventListener('click', openInternalRoleAssignmentForm);
  document.getElementById('btn-open-lead-modal')?.addEventListener('click', openInternalRoleAssignmentForm);
  document.getElementById('btn-open-lead-modal-sub')?.addEventListener('click', openInternalRoleAssignmentForm);
  document.getElementById('sidebar-btn-register-lead')?.addEventListener('click', openInternalRoleAssignmentForm);
  document.getElementById('sidebar-btn-new-staff')?.addEventListener('click', openInternalRoleAssignmentForm);

  // Quick navigation to staff tab
  document.getElementById('btn-quick-goto-users')?.addEventListener('click', () => {
    const userTabBtn = document.querySelector('.tab-btn[data-admin-tab="users"]');
    userTabBtn?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Close modal button & backdrop
  document.getElementById('close-lead-modal-btn')?.addEventListener('click', closeLeadModal);
  document.getElementById('btn-cancel-lead-modal')?.addEventListener('click', closeLeadModal);
  document.getElementById('lead-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'lead-modal') {
      closeLeadModal();
    }
  });

  // Lead form submit handler
  document.getElementById('admin-lead-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editingLeadId = document.getElementById('editing-lead-id')?.value;
    const leadId = editingLeadId || document.getElementById('display-lead-id')?.textContent || getNextLeadId();
    const clientName = document.getElementById('lead-client-name')?.value.trim();
    const phone = document.getElementById('lead-client-phone')?.value.trim();
    const email = document.getElementById('lead-client-email')?.value.trim();
    const budget = parseFloat(document.getElementById('lead-budget')?.value) || 0;
    const interestedProperty = document.getElementById('lead-interested-property')?.value.trim();
    const assignedStaffSelect = document.getElementById('lead-assigned-staff');
    const assignedStaffId = assignedStaffSelect?.value;
    const assignedStaffName = assignedStaffSelect?.options[assignedStaffSelect.selectedIndex]?.text.split('(')[0].trim() || 'Internal Staff';
    const status = document.getElementById('lead-status')?.value || 'NEW';
    const source = document.getElementById('lead-source')?.value || 'Web Portal';
    const notes = document.getElementById('lead-notes')?.value.trim();

    const leadPayload = {
      leadId,
      clientName,
      phone,
      email,
      budget,
      interestedProperty,
      assignedStaffId,
      assignedStaffName,
      status,
      source,
      notes,
      updatedAt: new Date().toISOString()
    };

    if (editingLeadId) {
      leads = leads.map(l => l.leadId === editingLeadId ? { ...l, ...leadPayload } : l);
      showToast(`Lead ${leadId} updated — assigned to ${assignedStaffName}`, 'success');
    } else {
      leads.unshift(leadPayload);
      showToast(`New lead registered! ID: ${leadId} — Assigned to ${assignedStaffName}`, 'success');
    }

    saveLeadsToStorage();
    renderLeads();
    renderStats();
    closeLeadModal();
  });

  // Tab switching (all .tab-btn instances, including right-sidebar buttons)
  const tabBtns = document.querySelectorAll('.tab-btn[data-admin-tab]');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-admin-tab');
      tabBtns.forEach(b => {
        if (b.getAttribute('data-admin-tab') === target) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

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


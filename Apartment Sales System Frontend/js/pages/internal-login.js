import { login, getDashboardUrlForRole, getCurrentUser } from '../auth.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  const user = getCurrentUser();
  if (user && user.role !== 'CUSTOMER') {
    window.location.href = getDashboardUrlForRole(user.role);
    return;
  }

  const form = document.getElementById('internal-login-form');
  const alertBox = document.getElementById('internal-alert');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertBox) alertBox.style.display = 'none';

    const email = document.getElementById('staff-email')?.value;
    const password = document.getElementById('staff-password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying staff credentials...';
    }

    try {
      const loggedUser = await login(email, password);
      if (alertBox) {
        alertBox.textContent = `Access granted: ${loggedUser.role}. Opening workspace...`;
        alertBox.className = 'alert alert-success';
        alertBox.style.display = 'block';
      }
      setTimeout(() => {
        window.location.href = getDashboardUrlForRole(loggedUser.role);
      }, 700);
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Staff verification failed.';
        alertBox.className = 'alert alert-danger';
        alertBox.style.display = 'block';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enter Staff Portal';
      }
    }
  });
});

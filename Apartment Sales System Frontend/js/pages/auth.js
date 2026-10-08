import { login, signup, getDashboardUrlForRole, getCurrentUser } from '../auth.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();

  // If already logged in, redirect to respective dashboard
  const user = getCurrentUser();
  if (user) {
    window.location.href = getDashboardUrlForRole(user.role);
    return;
  }

  const tabLogin = document.getElementById('tab-login-btn');
  const tabSignup = document.getElementById('tab-signup-btn');
  const loginForm = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');
  const alertBox = document.getElementById('auth-alert');

  function showAlert(msg, isError = true) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  function activateTab(tab) {
    if (tab === 'signup') {
      tabSignup?.classList.add('active');
      tabLogin?.classList.remove('active');
      if (signupForm) signupForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    } else {
      tabLogin?.classList.add('active');
      tabSignup?.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
    }
    hideAlert();
  }

  tabLogin?.addEventListener('click', () => activateTab('login'));
  tabSignup?.addEventListener('click', () => activateTab('signup'));

  // Parse mode parameter (?mode=signup or ?mode=login)
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'signup') {
    activateTab('signup');
  } else {
    activateTab('login');
  }

  // Unified Sign In Form Handler (Works for Customers, Sales Agents, and All Internal Staff)
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying credentials & access...';
    }

    try {
      const loggedUser = await login(email, password);
      const targetUrl = getDashboardUrlForRole(loggedUser.role);
      showAlert(`Authentication successful (${loggedUser.role}). Redirecting to your workspace...`, false);
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 700);
    } catch (err) {
      showAlert(err.message || 'Invalid email or password.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Living-Ora';
      }
    }
  });

  // Client / Sales Agent Registration Form
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const role = document.getElementById('signup-role')?.value || 'CUSTOMER';
    const firstName = document.getElementById('signup-firstname')?.value;
    const lastName = document.getElementById('signup-lastname')?.value;
    const nic = document.getElementById('signup-nic')?.value;
    const age = Number(document.getElementById('signup-age')?.value) || 25;
    const phoneNumber = document.getElementById('signup-phone')?.value;
    const address = document.getElementById('signup-address')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;

    const submitBtn = signupForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering account...';
    }

    try {
      const loggedUser = await signup({
        role,
        firstName,
        lastName,
        nic,
        age,
        phoneNumber,
        address,
        email,
        password
      });

      showAlert('Account registered and verified! Redirecting...', false);
      setTimeout(() => {
        window.location.href = getDashboardUrlForRole(loggedUser.role);
      }, 700);
    } catch (err) {
      showAlert(err.message || 'Registration failed. Please check your details.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    }
  });
});

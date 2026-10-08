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
    const icon = isError ? '⚠️' : '✅';
    alertBox.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    alertBox.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    alertBox.style.display = 'flex';
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  function clearFieldErrors() {
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    });
  }

  function setFieldError(fieldId, errorMessage) {
    clearFieldErrors();
    const el = document.getElementById(fieldId);
    if (el) {
      el.style.borderColor = '#ef4444';
      el.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
      el.focus();
    }
    showAlert(errorMessage, true);
  }

  // Clear red borders on user typing and enforce strict numeric formats
  const signupPhone = document.getElementById('signup-phone');
  signupPhone?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
  });

  const signupNic = document.getElementById('signup-nic');
  signupNic?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
  });

  [loginForm, signupForm].forEach(form => {
    form?.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        hideAlert();
      });
    });
  });

  function activateTab(tab) {
    clearFieldErrors();
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
    clearFieldErrors();

    const email = document.getElementById('login-email')?.value?.trim() || '';
    const password = document.getElementById('login-password')?.value || '';

    // Login validation
    if (!email) {
      setFieldError('login-email', 'Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('login-email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFieldError('login-password', 'Please enter your password.');
      return;
    }

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
    clearFieldErrors();

    const role = document.getElementById('signup-role')?.value?.trim() || 'CUSTOMER';
    const firstName = document.getElementById('signup-firstname')?.value?.trim() || '';
    const lastName = document.getElementById('signup-lastname')?.value?.trim() || '';
    const nic = document.getElementById('signup-nic')?.value?.trim() || '';
    const ageRaw = document.getElementById('signup-age')?.value?.trim() || '';
    const phoneNumber = document.getElementById('signup-phone')?.value?.trim() || '';
    const address = document.getElementById('signup-address')?.value?.trim() || '';
    const email = document.getElementById('signup-email')?.value?.trim() || '';
    const password = document.getElementById('signup-password')?.value || '';
    const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';

    // 1. Role Validation
    if (!['CUSTOMER', 'SALES_AGENT'].includes(role)) {
      setFieldError('signup-role', 'Please select a valid account type.');
      return;
    }

    // 2. First Name Validation
    if (!firstName) {
      setFieldError('signup-firstname', 'First name is required.');
      return;
    }
    if (firstName.length < 2) {
      setFieldError('signup-firstname', 'First name must contain at least 2 characters.');
      return;
    }
    if (!/^[A-Za-z\s.'-]+$/.test(firstName)) {
      setFieldError('signup-firstname', 'First name should contain only letters.');
      return;
    }

    // 3. Last Name Validation
    if (!lastName) {
      setFieldError('signup-lastname', 'Last name is required.');
      return;
    }
    if (lastName.length < 2) {
      setFieldError('signup-lastname', 'Last name must contain at least 2 characters.');
      return;
    }
    if (!/^[A-Za-z\s.'-]+$/.test(lastName)) {
      setFieldError('signup-lastname', 'Last name should contain only letters.');
      return;
    }

    // 4. NIC Validation: Exactly 12 digits
    if (!nic) {
      setFieldError('signup-nic', 'NIC / National ID number is required.');
      return;
    }
    if (!/^[0-9]{12}$/.test(nic)) {
      setFieldError('signup-nic', 'NIC must contain exactly 12 numbers (e.g. 199412345678).');
      return;
    }

    // 5. Age Validation: Between 18 and 100
    if (!ageRaw || isNaN(Number(ageRaw))) {
      setFieldError('signup-age', 'Please enter a valid age.');
      return;
    }
    const age = parseInt(ageRaw, 10);
    if (age < 18) {
      setFieldError('signup-age', 'Registration blocked: You must be at least 18 years old to create an account.');
      return;
    }
    if (age > 100) {
      setFieldError('signup-age', 'Please enter a valid age (maximum 100).');
      return;
    }

    // 6. Phone Number Validation: Exactly 10 numbers
    if (!phoneNumber) {
      setFieldError('signup-phone', 'Phone number is required.');
      return;
    }
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setFieldError('signup-phone', 'Phone number must contain exactly 10 numbers (e.g. 0771234567).');
      return;
    }

    // 7. Permanent Address Validation
    if (!address) {
      setFieldError('signup-address', 'Permanent address is required.');
      return;
    }
    if (address.length < 5) {
      setFieldError('signup-address', 'Please enter a complete permanent address (at least 5 characters).');
      return;
    }

    // 8. Email Address Validation
    if (!email) {
      setFieldError('signup-email', 'Email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('signup-email', 'Please enter a valid email address (e.g. client@example.com).');
      return;
    }

    // 9. Password Validation
    if (!password) {
      setFieldError('signup-password', 'Password is required.');
      return;
    }
    if (password.length < 8) {
      setFieldError('signup-password', 'Password must contain at least 8 characters.');
      return;
    }

    // 10. Confirm Password Validation
    if (!confirmPassword) {
      setFieldError('signup-confirm-password', 'Please re-enter your password to confirm.');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('signup-confirm-password', 'Passwords do not match. Please re-enter identical passwords.');
      return;
    }

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

      showAlert('Account registered and verified! Redirecting to your workspace...', false);
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

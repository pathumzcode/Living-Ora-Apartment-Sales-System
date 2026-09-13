/**
 * Authentication & Session Management for Living-Ora
 * Supports unified login for Customers, External Sales Agents, Internal Staff, and Administrators.
 * All roles are verified against the userVerification status before gaining access.
 */

import { authApi } from './api.js';

// Clear any stale locally-seeded data from previous versions of the app.
// All user/verification data must come from the database, not from hardcoded seeds.
const STORE_VERSION = 'livingora_v2';
if (localStorage.getItem('livingora_store_version') !== STORE_VERSION) {
  ['livingora_verifications', 'livingora_bookings', 'livingora_payments'].forEach(k => localStorage.removeItem(k));
  localStorage.setItem('livingora_store_version', STORE_VERSION);
}

export const ROLES = {
  ADMIN: 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  CUSTOMER_RELATIONS_OFFICER: 'CUSTOMER_RELATIONS_OFFICER',
  FINANCE_PAYMENTS_OFFICER: 'FINANCE_PAYMENTS_OFFICER',
  PROPERTY_DEVELOPMENT_MANAGER: 'PROPERTY_DEVELOPMENT_MANAGER',
  OPERATIONS_DIRECTOR: 'OPERATIONS_DIRECTOR',
  SALES_AGENT: 'SALES_AGENT',
  CUSTOMER: 'CUSTOMER'
};

export const ROLE_LABELS = {
  ADMIN: 'System Administrator',
  SALES_MANAGER: 'Sales Manager',
  MARKETING_MANAGER: 'Marketing Manager',
  CUSTOMER_RELATIONS_OFFICER: 'Customer Relations Officer',
  FINANCE_PAYMENTS_OFFICER: 'Finance & Payments Officer',
  PROPERTY_DEVELOPMENT_MANAGER: 'Property Development Manager',
  OPERATIONS_DIRECTOR: 'Operations Director',
  SALES_AGENT: 'External Sales Agent',
  CUSTOMER: 'Registered Customer'
};

/**
 * Returns the cached userVerification table fetched from the database.
 * This cache is only populated by successful backend responses — never seeded
 * with hardcoded credentials. Returns an empty array when no cache exists.
 */
export function getVerificationsTable() {
  try {
    const raw = localStorage.getItem('livingora_verifications');
    if (raw) return JSON.parse(raw);
  } catch (e) { /* silent */ }
  return [];
}

export function saveVerificationsTable(list) {
  try {
    localStorage.setItem('livingora_verifications', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save verifications table:', e);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('livingora_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('livingora_token') || null;
}

export function isAuthenticated() {
  return !!getCurrentUser() && !!getToken();
}

export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || 'GUEST';
}

export function completeAuth(response) {
  if (!response?.token) {
    throw new Error('The server did not return a valid login token');
  }

  const loggedUser = {
    uid: response.uid || response.empId,
    empId: response.uid || response.empId,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    role: response.role,
    externalUser: response.externalUser,
    isCustomer: response.customer,
    isSalesAgent: response.salesAgent,
    status: response.status || 'Verified',
    profilePicture: response.profilePicture || 'images/luxury-interior-lounge.jpg',
    name: `${response.firstName || ''} ${response.lastName || ''}`.trim()
  };

  localStorage.setItem('livingora_token', response.token);
  localStorage.setItem('livingora_user', JSON.stringify(loggedUser));
  return loggedUser;
}

export async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    // Always authenticate against the live backend which checks the userVerification table in the database
    const result = await authApi.login({ email: normalizedEmail, password });
    return completeAuth(result);
  } catch (err) {
    // Re-throw backend error responses directly (e.g. unverified, inactive, wrong password)
    if (
      err.message &&
      !err.message.includes('Failed to fetch') &&
      !err.message.includes('NetworkError') &&
      !err.message.includes('ERR_CONNECTION_REFUSED')
    ) {
      throw err;
    }

    // Backend is unreachable — do NOT allow offline login with hardcoded credentials.
    // All authentication and verification must come from the database.
    console.warn('Backend server is unreachable. Login requires a live database connection.');
    throw new Error(
      'Unable to reach the server. Please ensure the backend is running and try again. ' +
      'Authentication requires a live connection to verify your account in the database.'
    );
  }
}

export async function signup(details) {
  try {
    // Always register via the live backend — this creates a proper record in
    // the userVerification table in the database and returns a real JWT token.
    const result = await authApi.signup(details);
    return completeAuth(result);
  } catch (err) {
    // Re-throw meaningful backend errors (e.g. email already exists, role not allowed)
    if (
      err.message &&
      !err.message.includes('Failed to fetch') &&
      !err.message.includes('NetworkError') &&
      !err.message.includes('ERR_CONNECTION_REFUSED')
    ) {
      throw err;
    }

    // Backend is unreachable — registration cannot proceed without a database connection
    console.warn('Backend server is unreachable. Registration requires a live database connection.');
    throw new Error(
      'Unable to reach the server. Please ensure the backend is running and try again. ' +
      'Registration requires a live connection to create your account in the database.'
    );
  }
}

export function logout() {
  localStorage.removeItem('livingora_user');
  localStorage.removeItem('livingora_token');
  window.location.href = 'index.html';
}

export function getDashboardUrlForRole(role) {
  if (role === ROLES.ADMIN) {
    return 'admin-dashboard.html';
  }
  if ([
    ROLES.SALES_MANAGER,
    ROLES.MARKETING_MANAGER,
    ROLES.CUSTOMER_RELATIONS_OFFICER,
    ROLES.FINANCE_PAYMENTS_OFFICER,
    ROLES.PROPERTY_DEVELOPMENT_MANAGER,
    ROLES.OPERATIONS_DIRECTOR
  ].includes(role)) {
    return 'staff-dashboard.html';
  }
  if (role === ROLES.SALES_AGENT) {
    return 'external-apartments.html';
  }
  return 'customer-dashboard.html';
}

export function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html?mode=login';
    return false;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert('Access restricted for your current account role.');
    window.location.href = getDashboardUrlForRole(user.role);
    return false;
  }
  return true;
}

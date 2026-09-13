/**
 * API Service Client for Living-Ora Backend
 * Connects to Spring Boot REST API at http://localhost:8080/api
 */

const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('livingora_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const authApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    return handleResponse(response);
  },
  signup: async (details) => {
    const response = await fetch(`${API_BASE_URL}/auth/external/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
    return handleResponse(response);
  }
};

export const adminApi = {
  getOverview: async () => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/overview`, {
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' }
    });
    return handleResponse(response);
  },
  getInternalUsers: async () => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/internal-users`, {
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' }
    });
    return handleResponse(response);
  },
  getExternalUsers: async () => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/external-users`, {
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' }
    });
    return handleResponse(response);
  },
  getVerifications: async () => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/verifications`, {
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' }
    });
    return handleResponse(response);
  },
  getAuditLogs: async () => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' }
    });
    return handleResponse(response);
  },
  updateInternalAccess: async (empId, data) => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/internal-users/${encodeURIComponent(empId)}/access`, {
      method: 'PATCH',
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateExternalAccess: async (uid, data) => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/external-users/${encodeURIComponent(uid)}/access`, {
      method: 'PATCH',
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  createInternalUser: async (data) => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/internal-users`, {
      method: 'POST',
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateInternalUser: async (empId, data) => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/admin/internal-users/${encodeURIComponent(empId)}`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'X-Admin-Emp-Id': user?.uid || user?.empId || '' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const apartmentsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/apartments`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/apartments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const unitsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/units`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getByApartmentId: async (apartmentId) => {
    const response = await fetch(`${API_BASE_URL}/units/apartment/${apartmentId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/units/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/units`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/units/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const bookingsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (bookingPayload) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingPayload)
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const paymentsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/payments`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const user = JSON.parse(localStorage.getItem('livingora_user') || 'null');
    const response = await fetch(`${API_BASE_URL}/payments/${id}/status`, {
      method: 'PATCH',
      headers: { ...getHeaders(), 'X-Staff-Emp-Id': user?.uid || user?.empId || '' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

export const promotionsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/promotions`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (promoData) => {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promoData)
    });
    return handleResponse(response);
  }
};

export const externalApartmentsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/external-apartments`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (exData) => {
    const response = await fetch(`${API_BASE_URL}/external-apartments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(exData)
    });
    return handleResponse(response);
  }
};

const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('livingora_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
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
  login: async (credentials: { email: string; password: string; isStaff?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        isStaff: Boolean(credentials.isStaff)
      })
    });
    return handleResponse(response);
  }
};

export const apartmentsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/apartments`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data: any) => {
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
  getByApartmentId: async (apartmentId: string) => {
    const response = await fetch(`${API_BASE_URL}/units/apartment/${apartmentId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/units/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/units`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateStatus: async (id: string, status: string) => {
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
  create: async (bookingPayload: any) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingPayload)
    });
    return handleResponse(response);
  },
  updateStatus: async (id: string | number, status: string) => {
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
  create: async (paymentData: any) => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return handleResponse(response);
  }
};

export const promotionsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/promotions`, { headers: getHeaders() });
    return handleResponse(response);
  },
  create: async (promoData: any) => {
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
  create: async (exData: any) => {
    const response = await fetch(`${API_BASE_URL}/external-apartments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(exData)
    });
    return handleResponse(response);
  }
};

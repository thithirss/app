const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    auth = false,
  } = options;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (e) {
      // ignore JSON parse errors, keep statusText
    }
    throw new Error(msg || `Erro de requisição (${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

export const api = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getOrders(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/orders${qs}`, { auth: true });
  },

  createOrder(payload) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: true,
    });
  },

  updateOrderStatus(id, status) {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      auth: true,
    });
  },
};
import API_CONFIG, { buildUrl } from './config/api';
import { handleServiceError } from './utils/errorHandler';

/**
 * Simple token validation
 */
const validateToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token invalid');
    }

    return true;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

/**
 * Redirect to login if not authenticated
 */
const redirectToLogin = () => {
  const publicPaths = ['/login', '/register', '/'];
  const currentPath = window.location.pathname;
  
  if (!publicPaths.includes(currentPath)) {
    window.location.replace('/login');
  }
};

/**
 * Enhanced fetch with authentication
 */
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const isAuthEndpoint = url.includes('/login') || url.includes('/register');

  // Validate token for non-auth endpoints
  if (token && !isAuthEndpoint) {
    const isValid = await validateToken();
    if (!isValid) {
      redirectToLogin();
      throw new Error('Token expired');
    }
  }

  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers,
    timeout: options.timeout || API_CONFIG.TIMEOUT
  };

  try {
    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectToLogin();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => null);
      const message = errorData?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      if (window.location.pathname !== '/server-off') {
        window.location.href = '/server-off';
      }
    }

    throw error;
  }
}

/**
 * HTTP method helpers
 */
export async function get(endpoint, params = {}) {
  const url = endpoint.startsWith('http') ? endpoint : buildUrl(endpoint, params);
  return fetchWithAuth(url, { method: 'GET' });
}

export async function post(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function put(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function del(endpoint) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, { method: 'DELETE' });
}

export async function uploadFile(endpoint, formData) {
  const token = localStorage.getItem('token');
  const url = buildUrl(endpoint);

  // Validate token before upload
  if (token) {
    const isValid = await validateToken();
    if (!isValid) {
      redirectToLogin();
      throw new Error('Token expired');
    }
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
    // Don't set Content-Type for FormData
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectToLogin();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => null);
      const message = errorData?.message || `Upload failed (${response.status})`;
      throw new Error(message);
    }

    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Force token validation - exported for external use
 */
export const forceTokenValidation = validateToken;

// Initialize token check on load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const publicPaths = ['/login', '/register', '/'];
  
  if (token && !publicPaths.includes(window.location.pathname)) {
    validateToken().then(isValid => {
      if (!isValid) {
        redirectToLogin();
      }
    });
  }
}

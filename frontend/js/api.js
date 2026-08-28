import { CONFIG } from './config.js';
import { store } from './state.js';
import { Toast } from './components/toast.js';

export class ApiClient {
  static async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = { ...(options.headers || {}) };

    if (store.token) {
      headers['Authorization'] = `Bearer ${store.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body === 'object') {
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && store.token) {
          store.logout();
          Toast.warning('Session expired. Please log in again.', 'Unauthorized');
          window.location.hash = '#/login';
          throw new Error(data.message || 'Session expired');
        }

        const errorMessage = data.message || (data.errors && data.errors[0]?.message) || 'Request failed';
        if (!options.silent) {
          Toast.error(errorMessage, 'Request Failed');
        }
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (!options.silent && !error.message?.includes('Session expired')) {
        // Already shown or network error
      }
      throw error;
    }
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  static patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  static upload(endpoint, formData, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: formData });
  }
}

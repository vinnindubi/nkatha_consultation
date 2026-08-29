const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint, options = {}) => {
  const headers = options.headers || {};
  
  // If endpoint already starts with http, use it directly, otherwise prepend the base URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Check if the body is FormData so we don't overwrite the multipart boundary header
  const isFormData = options.body instanceof FormData;

  const finalHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  return fetch(url, {
    ...options,
    credentials: 'include', // cross-domain cookies
    headers: finalHeaders,
  });
};
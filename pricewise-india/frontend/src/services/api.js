const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  if (options.token) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${options.token}` };
  }
  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text() || res.statusText);
  return res.json();
};

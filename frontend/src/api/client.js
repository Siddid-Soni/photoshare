function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}

async function ensureCsrf() {
  if (getCookie('csrftoken')) return;
  await fetch('/api/csrf/', { credentials: 'include' });
}

async function request(path, options = {}) {
  const { raw, ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  const isForm = rest.body instanceof FormData;
  if (!isForm && rest.body && typeof rest.body === 'object') {
    headers['Content-Type'] = 'application/json';
    rest.body = JSON.stringify(rest.body);
  }
  if ((rest.method || 'GET').toUpperCase() !== 'GET') {
    await ensureCsrf();
    const token = getCookie('csrftoken');
    if (token) headers['X-CSRFToken'] = token;
  }
  const res = await fetch(path, { credentials: 'include', ...rest, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data?.detail || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return raw ? res : data;
}

function params(obj) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const api = {
  me: () => request('/api/me/').catch((e) => (e.status === 401 || e.status === 403 ? null : Promise.reject(e))),
  login: (username, password) => request('/api/auth/login/', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout/', { method: 'POST' }),
  register: (payload) => request('/api/auth/register/', { method: 'POST', body: payload }),
  profile: () => request('/api/profile/'),
  updateProfile: (formData) => request('/api/profile/', { method: 'PATCH', body: formData }),

  listPhotos: ({ page, search, tag, username } = {}) =>
    request(`/api/photos/${params({ page, search, tag, username })}`),
  getPhoto: (id) => request(`/api/photos/${id}/`),
  createPhoto: (formData) => request('/api/photos/', { method: 'POST', body: formData }),
  updatePhoto: (id, payload) => request(`/api/photos/${id}/`, { method: 'PATCH', body: payload }),
  deletePhoto: (id) => request(`/api/photos/${id}/`, { method: 'DELETE' }),
  listTags: () => request('/api/photos/tags/'),
};

export function fieldErrors(data) {
  if (!data || typeof data !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = Array.isArray(v) ? v.join(' ') : String(v);
  }
  return out;
}

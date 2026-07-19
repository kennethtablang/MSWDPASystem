import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

/**
 * Broadcast so AuthContext can pick up an identity that changed outside React —
 * currently the token-refresh path, which returns the user's *current* role and
 * module permissions. Without this, an admin revoking access has no effect on an
 * already-signed-in client until they manually log out.
 */
export const AUTH_USER_UPDATED = 'auth:user-updated';

export function storeAuthUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_USER_UPDATED, { detail: user }));
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          // The refresh response carries the user's current role and allowedModules —
          // persist them rather than keeping the stale copy from login time.
          storeAuthUser(data);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

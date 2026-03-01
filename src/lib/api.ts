import axios from 'axios';

const TOKENS_KEY = 'akash-crackers-tokens';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (raw) {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch {
    // ignore malformed JSON
  }
  return config;
});

// Track refresh promise to avoid concurrent refresh calls
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  // Unwrap ApiResponse wrapper: { statusCode, data, message, success } → data
  (response) => response.data?.data,

  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh on 401 (only once per request)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Only attempt refresh if we actually have stored tokens (user was logged in).
      // Without tokens, this is a login/register 401 — just propagate the error.
      const raw = localStorage.getItem(TOKENS_KEY);
      let refreshToken: string | undefined;
      try {
        refreshToken = JSON.parse(raw || '{}').refreshToken;
      } catch {
        // malformed JSON
      }

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = (async () => {
              const res = await axios.post(
                `${api.defaults.baseURL}/auth/refresh`,
                { refreshToken },
              );
              const tokens = res.data?.data;
              localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
              return tokens.accessToken;
            })();
          }

          const newAccessToken = await refreshPromise;
          refreshPromise = null;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          refreshPromise = null;
          localStorage.removeItem(TOKENS_KEY);
          localStorage.removeItem('akash-crackers-auth');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
    }

    // Extract backend error message for user-facing display
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

export default api;

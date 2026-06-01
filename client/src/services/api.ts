import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    const tokensStr = localStorage.getItem('hrms_tokens');
    if (tokensStr) {
      const tokens = JSON.parse(tokensStr);
      if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokensStr = localStorage.getItem('hrms_tokens');
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);
          const res = await axios.post('/api/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });
          if (res.data?.success) {
            const newTokens = res.data.data.tokens;
            localStorage.setItem('hrms_tokens', JSON.stringify(newTokens));
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('hrms_user');
        localStorage.removeItem('hrms_tenant');
        localStorage.removeItem('hrms_tokens');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

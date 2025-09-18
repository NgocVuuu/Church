const resolvedBase = (() => {
  const envBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '');
  if (envBase) return envBase;
  if (import.meta.env.DEV) return '/api'; // dev proxy in vite.config.js
  // Production fallback to Render API to prevent broken FE if env is missing
  const fallback = 'https://church-j9j1.onrender.com/api';
  if (typeof window !== 'undefined' && window?.console) {
    // eslint-disable-next-line no-console
    console.warn('[apiBase] VITE_API_BASE not set. Using fallback:', fallback);
  }
  return fallback.replace(/\/$/, '');
})();

export const API_BASE = resolvedBase;

export function apiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '')

export function apiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

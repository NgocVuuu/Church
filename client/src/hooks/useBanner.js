import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/apiBase'
import { useAuth } from '../auth/AuthContext'

const STORAGE_KEY = 'parish_banners'

export function useBanner(pageKey) {
  const [banners, setBanners] = useState({})
  const { token } = useAuth?.() || {}
  const url = banners?.[pageKey] || ''

  // Load from local cache immediately for fast paint
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setBanners(JSON.parse(raw))
    } catch {}
  }, [])

  // Then fetch from API for fresh data
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch(apiUrl('/banners'))
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (!aborted && data && typeof data === 'object') {
          setBanners(prev => {
            const next = { ...prev, ...data }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
            return next
          })
        }
      } catch {}
    })()
    return () => { aborted = true }
  }, [])

  const setBanner = async (key, value) => {
    // Optimistic local update + cache
    setBanners(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    // Persist to API if we have admin token
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(apiUrl(`/banners/${encodeURIComponent(key)}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ url: value })
      })
      if (!res.ok) {
        // Revert on failure? Keep optimistic but log.
        // eslint-disable-next-line no-console
        console.warn('Failed to save banner to server')
      }
    } catch {}
  }

  return { url, setBanner }
}

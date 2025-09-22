import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

const STORAGE_KEY = 'parish_contact_content_v2'

const defaults = {
  address: '198 West 21th Street, Suite 721\nNew York, NY 10016',
  phone: '+1235235598',
  email: 'info@yoursite.com',
  website: 'yoursite.com',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502743256744!2d106.700!3d10.773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9c6f4d1f%3A0x27f0b9b8b8627a1a!2zQ2F0aG9saWMgQ2h1cmNo!5e0!3m2!1svi!2s!4v1680000000000',
  banner: '',
}

function normalize(src) {
  const s = src || {}
  return {
    address: (s.address ?? defaults.address).toString(),
    phone: (s.phone ?? defaults.phone).toString(),
    email: (s.email ?? defaults.email).toString(),
    website: (s.website ?? defaults.website).toString(),
    mapEmbedUrl: (s.mapEmbedUrl ?? defaults.mapEmbedUrl).toString(),
    banner: (s.banner ?? defaults.banner).toString(),
  }
}

export function useContactContent() {
  const [content, setContent] = useState(defaults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load from local cache first for instant paint
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setContent(normalize(JSON.parse(raw)))
    } catch {}
    // Then fetch from API
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl('/contact'))
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data && Object.keys(data).length) {
            const n = normalize(data)
            setContent(n)
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)) } catch {}
          }
        }
      } catch (e) {
        setError(e?.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    })()

    const reload = () => {
      try { const raw2 = localStorage.getItem(STORAGE_KEY); if (raw2) setContent(normalize(JSON.parse(raw2))) } catch {}
    }
    const onStorage = (e) => { if (e.key === STORAGE_KEY) reload() }
    window.addEventListener('contactContentUpdated', reload)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reload() })
    return () => {
      window.removeEventListener('contactContentUpdated', reload)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const getAuthToken = () => { try { return localStorage.getItem('auth_token') } catch { return null } }

  const save = async (next) => {
    // sanitize phone to improve server-side validation pass rate
    const sanitized = { ...next, phone: (next?.phone || '').replace(/\s+/g, '') }
    const n = normalize(sanitized)
    const token = getAuthToken()
    if (token) {
      const res = await fetch(apiUrl('/contact'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(n)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        const details = errorData.details?.map?.(d=>`${d.path?.join?.('.')||d.param||''}: ${d.msg||d.message||''}`).join('; ')
        const msg = errorData.error === 'Validation failed' && details ? `${errorData.error}: ${details}` : (errorData.error || `Server error: ${res.status}`)
        throw new Error(msg)
      }
      const saved = await res.json().catch(()=> n)
      const merged = normalize(saved)
      setContent(merged)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch {}
      try { window.dispatchEvent(new CustomEvent('contactContentUpdated')) } catch {}
      return merged
    }
    // If not logged in, we still allow local draft save for convenience
    setContent(n)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)) } catch {}
    try { window.dispatchEvent(new CustomEvent('contactContentUpdated')) } catch {}
    return n
  }

  return { content, save, loading, error }
}

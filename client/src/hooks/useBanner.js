import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/apiBase'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/Toast'

const STORAGE_KEY = 'parish_banners'

export function useBanner(pageKey) {
  const [banners, setBanners] = useState({})
  const { token } = useAuth?.() || {}
  const toast = useToast()
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
    const prev = banners
    // Optimistic update
    setBanners(p => {
      const next = { ...p, [key]: value }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    // Require admin token to persist
    if (!token) {
      // Revert optimistic update because server will reject without token
      setBanners(prev)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prev)) } catch {}
      const msg = 'Cần đăng nhập (Admin) để lưu banner lên máy chủ'
      toast?.error?.(msg)
      throw new Error(msg)
    }
    try {
      const res = await fetch(apiUrl(`/banners/${encodeURIComponent(key)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: value })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        // Revert on failure
        setBanners(prev)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prev)) } catch {}
        const msg = data?.error ? `Lưu banner thất bại: ${data.error}` : 'Lưu banner thất bại'
        toast?.error?.(msg)
        throw new Error(msg)
      }
      const saved = await res.json().catch(() => null)
      if (saved?.url) {
        toast?.success?.('Đã lưu banner')
      } else {
        toast?.success?.('Đã cập nhật banner')
      }
    } catch (e) {
      // Ensure we reverted above on non-ok; here handle network-level failure
      setBanners(prev)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prev)) } catch {}
      const msg = e?.message || 'Không thể lưu banner (mạng?)'
      toast?.error?.(msg)
      throw e
    }
  }

  return { url, setBanner }
}

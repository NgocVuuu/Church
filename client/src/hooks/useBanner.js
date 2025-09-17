import { useEffect, useState } from 'react'

const STORAGE_KEY = 'parish_banners'

export function useBanner(pageKey) {
  const [banners, setBanners] = useState({})
  const url = banners?.[pageKey] || ''

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setBanners(JSON.parse(raw))
    } catch {}
  }, [])

  const setBanner = (key, value) => {
    setBanners(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { url, setBanner }
}

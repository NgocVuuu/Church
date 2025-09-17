import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    // If navigating to a hash anchor on same page, let the browser handle it (html has smooth behavior)
    if (hash) return
    try { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) } catch { window.scrollTo(0,0) }
  }, [pathname, search, hash])
  return null
}

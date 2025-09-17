import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const LoadingContext = createContext({ isLoading: false })

function computeAdaptiveDuration() {
  // Heuristic based on Network Information API if available
  try {
    const c = navigator.connection || navigator.webkitConnection || navigator.mozConnection
    const save = c?.saveData
    const eff = c?.effectiveType || ''
    const down = c?.downlink || 0
    if (save || /2g|slow-2g/i.test(eff)) return 1800
    if (/3g/i.test(eff)) return 1300
    if (/4g|wifi/i.test(eff)) {
      if (down >= 10) return 600
      if (down >= 3) return 800
      return 1000
    }
  } catch {}
  // Fallback default
  return 900
}

export function LoadingProvider({ children }) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [animSpeed, setAnimSpeed] = useState('normal') // 'fast' | 'normal' | 'slow'
  const timerRef = useRef(null)

  useEffect(() => {
    // On route change: start loading and end after an adaptive duration
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    const duration = computeAdaptiveDuration()
    setAnimSpeed(duration <= 700 ? 'fast' : duration >= 1500 ? 'slow' : 'normal')
    setIsLoading(true)
    timerRef.current = setTimeout(() => {
      setIsLoading(false)
      timerRef.current = null
    }, duration)
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    }
    // Trigger on every path or search change
  }, [location.pathname, location.search])

  const value = useMemo(() => ({ isLoading, animSpeed }), [isLoading, animSpeed])
  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}

export function useLoading() {
  return useContext(LoadingContext)
}

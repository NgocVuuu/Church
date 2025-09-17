import { useEffect, useRef, useState } from 'react'

export function useReveal(options = { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      })
    }, options)
    obs.observe(el)
    return () => obs.disconnect()
  }, [options, visible])
  return { ref, visible }
}

import { useEffect, useState } from 'react'
import { useLoading } from '../contexts/LoadingContext'
import CrossIcon from './icons/CrossIcon'

export default function PageTransition() {
  const { isLoading, animSpeed } = useLoading()
  const [render, setRender] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // Start showing immediately
      setRender(true)
      // Next tick to allow transition
      const t = setTimeout(() => setShow(true), 0)
      return () => clearTimeout(t)
    } else {
      // Fade out then unmount after transition
      setShow(false)
      const t = setTimeout(() => setRender(false), 220)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  if (!render) return null

  const ringClass = animSpeed === 'fast' ? 'spin-fast' : animSpeed === 'slow' ? 'spin-slow' : 'spin'

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!show}
    >
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
      <div className="relative h-full w-full grid place-items-center">
        <div className="relative w-24 h-24 grid place-items-center">
          {/* Spinning ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary ${ringClass}`} />
          {/* Center icon */}
          <CrossIcon className="w-10 h-10 text-primary" />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery'

export default function RecentPhotos({ limit = 12, showViewAll = true }) {
  const { sorted } = useGallery()
  const images = (sorted.slice(0, limit).map(i => i.url))
  // index is the starting item of the current viewport (we slide by 1)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(4) // responsive: 2 on small, 4 on md+
  const [dragDx, setDragDx] = useState(0)
  const timerRef = useRef(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const containerRef = useRef(null)
  const containerWidthRef = useRef(1)

  // Responsive items per view
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)') // md breakpoint
    const apply = () => setPerView(mql.matches ? 4 : 2)
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])

  // Ensure index is always valid for current perView
  useEffect(() => {
    const maxIndex = Math.max(0, images.length - perView)
    setIndex(i => Math.min(i, maxIndex))
  }, [perView, images.length])

  // Auto-rotate
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex(i => {
        const maxIndex = Math.max(0, images.length - perView)
        return i >= maxIndex ? 0 : i + 1
      })
    }, 4000)
    return () => clearInterval(timerRef.current)
  }, [images.length, perView])

  const pause = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  const resume = () => { if (!timerRef.current) {
    timerRef.current = setInterval(() => {
      setIndex(i => {
        const maxIndex = Math.max(0, images.length - perView)
        return i >= maxIndex ? 0 : i + 1
      })
    }, 4000)
  } }

  const onDown = (x) => {
    dragging.current = true
    startX.current = x
    setDragDx(0)
    containerWidthRef.current = Math.max(1, containerRef.current?.offsetWidth || 1)
    pause()
  }
  const onMove = (x) => {
    if (!dragging.current) return
    setDragDx(x - startX.current)
  }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    const threshold = 50
    if (dragDx > threshold) {
      setIndex(i => {
        const maxIndex = Math.max(0, images.length - perView)
        return i <= 0 ? maxIndex : i - 1
      })
    } else if (dragDx < -threshold) {
      setIndex(i => {
        const maxIndex = Math.max(0, images.length - perView)
        return i >= maxIndex ? 0 : i + 1
      })
    }
    setDragDx(0)
    resume()
  }

  const slidePercent = 100 / perView
  const maxIndex = Math.max(0, images.length - perView)
  const pages = Math.max(1, Math.ceil(images.length / perView))
  const activePage = Math.min(pages - 1, Math.floor(index / perView))
  const dragPercent = (dragDx / containerWidthRef.current) * 100

  return (
  <section className="py-8 md:py-9 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex items-end justify-between">
          <div className="text-left">
            <div className="uppercase tracking-[0.35em] text-neutral-500 text-xs">Hình ảnh</div>
            <h3 className="font-display text-3xl mt-3">Ảnh gần đây</h3>
          </div>
          {showViewAll && (
            <Link to="/thu-vien-anh" className="text-sm text-primary hover:underline">Xem tất cả →</Link>
          )}
        </div>
        <div
          className="relative"
        >
          <div
            ref={containerRef}
            className="overflow-hidden rounded-lg select-none"
            onMouseDown={(e) => onDown(e.clientX)}
            onMouseMove={(e) => onMove(e.clientX)}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={(e) => onDown(e.touches[0].clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
            onTouchEnd={onUp}
          >
            <div className="-mx-2">
              <div
                className="flex will-change-transform transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${-(index * slidePercent) + (dragPercent || 0)}%)` }}
              >
                {images.map((src, i) => (
                  <div key={src} className="flex-none px-2" style={{ width: `calc(${100 / perView}% )` }}>
                    <div className="h-56 md:h-64 w-full overflow-hidden rounded-md">
                      <img
                        src={src}
                        alt={`Ảnh ${i + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button
            aria-label="Trước"
            onClick={() => {
              pause()
              setIndex(i => (i <= 0 ? maxIndex : i - 1))
              resume()
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 grid place-items-center shadow"
          >‹</button>
          <button
            aria-label="Sau"
            onClick={() => {
              pause()
              setIndex(i => (i >= maxIndex ? 0 : i + 1))
              resume()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 grid place-items-center shadow"
          >›</button>

          {/* Dots (pages) */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, p) => (
              <button
                key={p}
                onClick={() => { pause(); setIndex(Math.min(p * perView, maxIndex)); resume() }}
                className={`w-2.5 h-2.5 rounded-full ${p === activePage ? 'bg-primary' : 'bg-neutral-300 hover:bg-neutral-400'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

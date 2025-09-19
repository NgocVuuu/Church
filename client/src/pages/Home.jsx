import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import UpcomingEvent from '../components/UpcomingEvent'
import PapalQuotes from '../components/PapalQuotes'
import MassSchedule from '../components/MassSchedule'
import SermonsList from '../components/SermonsList'
import BlogList from '../components/BlogList'
import RecentPhotos from '../components/RecentPhotos'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import { Link } from 'react-router-dom'
import { useHomeContent } from '../hooks/useHome'
import Announcements from '../components/Announcements'

export default function Home() {
  const { content } = useHomeContent()
  const slides = content.slides || []
  const [index, setIndex] = useState(0)
  const active = useMemo(() => slides[index] || {}, [index, slides])
  const dragging = useRef(false)
  const startX = useRef(0)
  const deltaX = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!slides.length) return
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 6000)
    return () => clearInterval(timerRef.current)
  }, [])

  const pause = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  const resume = () => { if (!timerRef.current && slides.length) { timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 6000) } }

  const onDown = (clientX) => { dragging.current = true; startX.current = clientX; deltaX.current = 0; pause() }
  const onMove = (clientX) => { if (!dragging.current) return; deltaX.current = clientX - startX.current }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    const threshold = 50
    if (!slides.length) return
    if (deltaX.current > threshold) setIndex(i => (i - 1 + slides.length) % slides.length)
    else if (deltaX.current < -threshold) setIndex(i => (i + 1) % slides.length)
    resume()
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <section
        id="home"
        className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center text-center select-none"
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        {/* Background with zoom-in animation per slide */}
        <div key={active?.img || 'no-slide'} className="absolute inset-0 overflow-hidden">
          <img
            src={active?.img}
            alt="Hình nền"
            className="absolute inset-0 w-full h-full object-cover animate-zoomIn"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 mt-24">
          {/* Decorative centered heading */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="hidden sm:block h-px w-24 bg-white/70" />
            <div className="uppercase tracking-[0.5em] text-white/80 text-xs sm:text-sm">
              GIÁO XỨ ĐÔNG VINH
            </div>
            <span className="hidden sm:block h-px w-24 bg-white/70" />
          </div>

          {/* Title */}
          <h1 key={active?.titleEm || 'no-title'} className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight animate-fadeUp">
            <span className="text-white/90">{active?.titlePre} </span>
            <span className="text-primary">{active?.titleEm}</span>
            <span className="text-white/90">{active?.titlePost}</span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-base sm:text-lg text-white/85 font-sans max-w-2xl mx-auto animate-fadeUp delay-150">
            {active?.desc}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center justify-center gap-3 animate-fadeUp delay-200">
            <Link to="/bai-viet/luoc-su-hinh-thanh-giao-xu-dong-vinh" className="border border-primary text-primary px-5 py-2.5 rounded-full hover:bg-primary/10 text-sm">Đọc thêm</Link>
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.img}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? 'bg-primary scale-110' : 'bg-white/50 hover:bg-white/70'}`}
                aria-label={`Chuyển đến slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
  <section className="py-6 md:py-8">
    <Reveal>
      <MassSchedule weekly={content.mass.weekly} specials={content.mass.specials} note={content.mass.note} />
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={50}>
      <Announcements items={content.announcements} />
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={100}>
      <UpcomingEvent title={content.event.title} timeLabel={content.event.timeLabel} pastor={content.event.pastor} address={content.event.address} date={content.event.date} image={content.event.image} />
    </Reveal>
    {/* View all link moved below featured event */}
    <Reveal delay={120}>
      <div className="max-w-7xl mx-auto px-6 mt-4">
        <div className="flex items-center justify-end">
          <Link to="/su-kien" className="text-sm text-primary">Xem tất cả</Link>
        </div>
      </div>
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={150}>
      <PapalQuotes quotes={content.quotes} />
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={200}>
      <SermonsList />
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={250}>
      <BlogList />
    </Reveal>
  </section>
  <section className="py-6 md:py-8">
    <Reveal delay={300}>
      <RecentPhotos showViewAll={true} />
    </Reveal>
  </section>
  <Footer />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

function useCountdown(targetDate) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate])
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const delta = Math.max(0, target - now)
  const days = Math.floor(delta / (1000 * 60 * 60 * 24))
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((delta / (1000 * 60)) % 60)
  const seconds = Math.floor((delta / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export default function UpcomingEvent({
  title = 'Chia sẻ Đức Tin & Tin Mừng',
  timeLabel = '8:30 sáng - 11:30 sáng',
  pastor = 'Lm. Giuse',
  address = '203 Đường Mẫu, Phường ABC, Thành phố XYZ',
  date = '2026-01-01T08:30:00',
  image = 'https://images.unsplash.com/photo-1543306730-efd0a3fa3a83?q=80&w=1600&auto=format&fit=crop'
}) {
  const { days, hours, minutes, seconds } = useCountdown(date)

  return (
    <section id="su-kien" className="relative py-6 md:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-0 overflow-hidden rounded-md">
        {/* Left: text card (mobile: smaller fonts, more top padding) */}
        <div className="relative bg-[#cdb79e]/80 text-black p-4 pt-6 md:p-10 flex flex-col justify-center">
          <div className="uppercase tracking-[0.3em] text-black/80 text-[10px] md:text-xs mb-1.5 md:mb-4">Sự kiện sắp tới</div>
          <h2 className="font-display text-base md:text-4xl text-black/90 leading-snug line-clamp-2">{title}</h2>

          <div className="mt-2 md:mt-6 text-black/80 space-y-1.5 md:space-y-3 text-[12px] md:text-base">
            <div className="inline-flex items-center bg-primary text-black font-medium px-2.5 py-1 rounded text-[11px] md:text-base">{timeLabel}</div>
            <div className="flex items-center gap-2"><span>👤</span><span className="clamp-2"> bởi linh mục: <span className="text-black font-medium">{pastor}</span></span></div>
            <div className="flex items-start gap-2"><span>📍</span><span className="clamp-2">{address}</span></div>
          </div>

          <div className="mt-3 md:mt-8">
            <a href="#" className="inline-flex items-center bg-primary text-black px-3 md:px-5 py-2 md:py-3 rounded-full font-medium shadow hover:brightness-110 text-xs md:text-sm">Tham gia</a>
          </div>
        </div>

        {/* Right: image with countdown overlay and taller white panel overlay on mobile */}
        <div className="relative min-h-[200px] md:min-h-[280px]">
          <img src={image} alt="Sự kiện" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          {/* Make white block extend higher above image on mobile to mimic desktop stagger */}
          <div className="absolute -top-4 left-0 right-0 h-4 bg-white md:hidden" />

          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-6 md:p-8">
            <div className="grid grid-cols-4 gap-2 md:gap-6 text-white/95">
              <div className="text-center">
                <div className="text-xl md:text-5xl font-light">{days}</div>
                <div className="mt-1 text-[10px] md:text-sm uppercase tracking-widest">Ngày</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-light">{hours}</div>
                <div className="mt-1 text-[10px] md:text-sm uppercase tracking-widest">Giờ</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-light">{minutes}</div>
                <div className="mt-1 text-[10px] md:text-sm uppercase tracking-widest">Phút</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-light">{seconds}</div>
                <div className="mt-1 text-[10px] md:text-sm uppercase tracking-widest">Giây</div>
              </div>
            </div>

            <a href="#" className="mt-3 md:mt-6 inline-flex items-center bg-[#cdb79e] text-black px-3 md:px-5 py-2 md:py-3 rounded shadow hover:brightness-110 text-xs md:text-sm">Tham gia sự kiện</a>
          </div>
        </div>
      </div>
    </section>
  )
}

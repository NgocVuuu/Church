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
    <section id="su-kien" className="relative py-8 md:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-0 overflow-hidden rounded-md">
        {/* Left: text card */}
  <div className="relative bg-[#cdb79e]/80 text-black p-5 md:p-10 flex flex-col justify-center">
          <div className="uppercase tracking-[0.35em] text-black/80 text-xs mb-4">Sự kiện sắp tới</div>
          <h2 className="font-display text-2xl md:text-4xl text-black/90 leading-snug">{title}</h2>

          <div className="mt-6 text-black/80 space-y-3">
            <div className="inline-flex items-center bg-primary text-black font-medium px-4 py-2 rounded">{timeLabel}</div>
            <div className="flex items-center gap-2"><span>👤</span><span> bởi linh mục: <span className="text-black font-medium">{pastor}</span></span></div>
            <div className="flex items-start gap-2"><span>📍</span><span>{address}</span></div>
          </div>

          <div className="mt-6 md:mt-8">
            <a href="#" className="inline-flex items-center bg-primary text-black px-4 md:px-5 py-2.5 md:py-3 rounded-full font-medium shadow hover:brightness-110">Tham gia</a>
          </div>
        </div>

        {/* Right: image with countdown overlay */}
  <div className="relative min-h-[220px] md:min-h-[280px]">
          <img src={image} alt="Sự kiện" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-8">
            <div className="grid grid-cols-4 gap-3 md:gap-6 text-white/95">
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-light">{days}</div>
                <div className="mt-1 text-sm uppercase tracking-widest">Ngày</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-light">{hours}</div>
                <div className="mt-1 text-sm uppercase tracking-widest">Giờ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-light">{minutes}</div>
                <div className="mt-1 text-sm uppercase tracking-widest">Phút</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-light">{seconds}</div>
                <div className="mt-1 text-sm uppercase tracking-widest">Giây</div>
              </div>
            </div>

            <a href="#" className="mt-4 md:mt-6 inline-flex items-center bg-[#cdb79e] text-black px-4 md:px-5 py-2.5 md:py-3 rounded shadow hover:brightness-110">Tham gia sự kiện</a>
          </div>
        </div>
      </div>
    </section>
  )
}

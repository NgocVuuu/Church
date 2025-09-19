import { useEffect, useMemo, useRef, useState } from 'react'

const defaultQuotes = [
  {
    title: 'Đức ái là trái tim của Giáo Hội',
    text: 'Hãy để tình yêu hướng dẫn mọi hành động của chúng ta, đặc biệt với những người bé nhỏ và yếu thế.',
    source: 'Đức Giáo hoàng Phanxicô',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Hy vọng không làm thất vọng',
    text: 'Trong Chúa Kitô, hy vọng trở nên chắc chắn vì Người luôn đồng hành trong mọi thử thách.',
    source: 'Đức Giáo hoàng Phanxicô',
    image: 'https://images.unsplash.com/photo-1489619243109-4e0ea66d2e93?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: 'Cầu nguyện là hơi thở của linh hồn',
    text: 'Không có cầu nguyện, đức tin khô cạn; với cầu nguyện, mọi điều đều trở nên có thể.',
    source: 'Đức Giáo hoàng Phanxicô',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'
  }
]

export default function PapalQuotes({ quotes = defaultQuotes }) {
  const [index, setIndex] = useState(0)
  const active = useMemo(() => quotes[index], [quotes, index])
  const timerRef = useRef(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const deltaX = useRef(0)

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % quotes.length), 7000)
    return () => clearInterval(timerRef.current)
  }, [quotes.length])

  const pause = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  const resume = () => { if (!timerRef.current) { timerRef.current = setInterval(() => setIndex(i => (i + 1) % quotes.length), 7000) } }

  const onDown = (clientX) => { dragging.current = true; startX.current = clientX; deltaX.current = 0; pause() }
  const onMove = (clientX) => { if (!dragging.current) return; deltaX.current = clientX - startX.current }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    const threshold = 50
    if (deltaX.current > threshold) setIndex(i => (i - 1 + quotes.length) % quotes.length)
    else if (deltaX.current < -threshold) setIndex(i => (i + 1) % quotes.length)
    resume()
  }

  return (
  <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="uppercase tracking-[0.35em] text-neutral-500 text-xs">Huấn từ Đức Giáo hoàng</div>
          <h3 className="font-display text-3xl mt-3">Lời khích lệ cho chúng ta</h3>
        </div>

        <div
          className="relative border rounded-xl bg-white shadow-sm select-none overflow-hidden md:min-h-[18rem]"
          onMouseDown={(e) => onDown(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={(e) => onDown(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onUp}
        >
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative h-56 md:h-[22rem]">
              {active?.image && (
                <img src={active.image} alt="Ảnh minh họa" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 md:hidden bg-black/20"/>
            </div>
            {/* Text */}
            <figure key={active.title} className="p-6 md:p-10 lg:p-12 animate-fadeUp">
              <div className="uppercase tracking-[0.25em] text-xs text-neutral-500">Huấn từ</div>
              <h4 className="font-display text-2xl mt-2 clamp-2">{active.title}</h4>
              <blockquote className="mt-4 text-neutral-700 leading-relaxed">
                “{active.text}”
              </blockquote>
              <figcaption className="mt-5 text-neutral-500">
                — <span className="font-medium">{active.source}</span>
              </figcaption>
            </figure>
          </div>

          {/* Arrows */}
          <button
            aria-label="Trước"
            onClick={() => { pause(); setIndex(i => (i - 1 + quotes.length) % quotes.length); resume() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 grid place-items-center shadow"
          >
            ‹
          </button>
          <button
            aria-label="Sau"
            onClick={() => { pause(); setIndex(i => (i + 1) % quotes.length); resume() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700 grid place-items-center shadow"
          >
            ›
          </button>

          {/* Dots */}
          <div className="mt-6 mb-2 flex items-center justify-center gap-2">
            {quotes.map((q, i) => (
              <button
                key={q.title}
                onClick={() => { pause(); setIndex(i); resume() }}
                className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-primary' : 'bg-neutral-300 hover:bg-neutral-400'}`}
                aria-label={`Chuyển câu ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

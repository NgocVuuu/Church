import { Link } from 'react-router-dom'
import { useSermons } from '../hooks/useSermons'

export default function SermonsList({ items }) {
  const { sermons } = useSermons()
  const parseVNDate = (str='') => {
    const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(str)
    if (!m) return NaN
    const dd = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10) - 1
    const yyyy = parseInt(m[3], 10)
    return new Date(yyyy, mm, dd).getTime()
  }
  const effectiveTs = (s) => {
    const ts = parseVNDate(s.date)
    return Number.isFinite(ts) ? ts : (s.createdAt || 0)
  }
  const list = items && items.length ? items : [...sermons].sort((a,b) => effectiveTs(b) - effectiveTs(a)).slice(0,3)
  return (
  <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="uppercase tracking-[0.35em] text-neutral-500 text-xs">Bài giảng</div>
          <h3 className="font-display text-3xl mt-3">3 bài giảng mới nhất</h3>
        </div>
        {/* Mobile slider */}
        <div className="md:hidden -mx-6">
          <div
            className="pl-3 pr-6 flex gap-4 overflow-x-auto pb-2 no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {list.map((s) => (
              <article
                key={s.id}
                className="flex-none w-72 border rounded-lg overflow-hidden bg-white shadow-sm h-full flex flex-col"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="relative h-40">
                  <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
                </div>
                <div className="p-4 flex-1 flex flex-col min-h-0 gap-2">
                  <h4 className="font-display text-lg clamp-2">{s.title}</h4>
                  <div className="text-sm text-neutral-600">
                    {s.date} · bởi <span className="font-medium">{s.pastor}</span>
                    {typeof s.views === 'number' ? ` · ${s.views} lượt đọc` : null}
                  </div>
                  <Link to={`/bai-giang/${s.slug || s.id}`} className="inline-flex items-center text-primary font-medium hover:underline mt-auto">Nghe bài giảng →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((s) => (
            <article key={s.id} className="border rounded-lg overflow-hidden bg-white shadow-sm h-full flex flex-col">
              <div className="relative h-44">
                <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
              </div>
              <div className="p-4 flex-1 flex flex-col min-h-0 gap-2">
                <h4 className="font-display text-xl clamp-2">{s.title}</h4>
                <div className="text-sm text-neutral-600">
                  {s.date} · bởi <span className="font-medium">{s.pastor}</span>
                  {typeof s.views === 'number' ? ` · ${s.views} lượt đọc` : null}
                </div>
                <Link to={`/bai-giang/${s.slug || s.id}`} className="inline-flex items-center text-primary font-medium hover:underline mt-auto">Nghe bài giảng →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

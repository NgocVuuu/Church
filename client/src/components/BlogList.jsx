import { Link } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'

export default function BlogList({ items }) {
  const { posts } = usePosts()
  const parseVNDate = (str='') => {
    const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(str)
    if (!m) return NaN
    const dd = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10) - 1
    const yyyy = parseInt(m[3], 10)
    return new Date(yyyy, mm, dd).getTime()
  }
  const effectiveTs = (p) => {
    const ts = parseVNDate(p.date)
    return Number.isFinite(ts) ? ts : (p.createdAt || 0)
  }
  const list = items && items.length ? items : [...posts].sort((a,b) => effectiveTs(b) - effectiveTs(a)).slice(0,3)
  return (
  <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="uppercase tracking-[0.35em] text-neutral-500 text-xs">Bài viết</div>
          <h3 className="font-display text-3xl mt-3">Tin & bài viết mới</h3>
        </div>
        {/* Mobile slider */}
        <div className="md:hidden -mx-6">
          <div className="pl-3 pr-6 flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {list.map((b) => (
              <article key={b.id} className="flex-none w-72 border rounded-lg overflow-hidden bg-white shadow-sm h-full flex flex-col" style={{ scrollSnapAlign: 'start' }}>
                <div className="relative h-40">
                  <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
                </div>
                <div className="p-4 flex-1 flex flex-col min-h-0 gap-2">
                  <h4 className="font-display text-lg clamp-2">{b.title}</h4>
                  <div className="text-sm text-neutral-600">{b.date} · bởi <span className="font-medium">{b.author}</span></div>
                    <div className="text-sm text-neutral-600">{b.date} · bởi <span className="font-medium">{b.author}</span> · {typeof b.views === 'number' ? `${b.views} lượt đọc` : null}</div>
                  <Link to={`/bai-viet/${b.slug || b.id}`} className="inline-flex items-center text-primary font-medium hover:underline mt-auto">Đọc thêm →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b) => (
            <article key={b.id} className="border rounded-lg overflow-hidden bg-white shadow-sm h-full flex flex-col">
              <div className="relative h-44">
                <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
              </div>
              <div className="p-4 flex-1 flex flex-col min-h-0 gap-2">
                <h4 className="font-display text-xl clamp-2">{b.title}</h4>
                <div className="text-sm text-neutral-600">{b.date} · bởi <span className="font-medium">{b.author}</span></div>
                  <div className="text-sm text-neutral-600">{b.date} · bởi <span className="font-medium">{b.author}</span> · {typeof b.views === 'number' ? `${b.views} lượt đọc` : null}</div>
                <Link to={`/bai-viet/${b.slug || b.id}`} className="inline-flex items-center text-primary font-medium hover:underline mt-auto">Đọc thêm →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

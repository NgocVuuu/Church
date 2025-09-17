import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { useMemo, useState } from 'react'
import { useGallery } from '../hooks/useGallery'
import Reveal from '../components/Reveal'

export default function Gallery() {
  const { sorted, eventsMeta } = useGallery()
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const normalize = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()

  const list = useMemo(() => {
    const n = normalize(q)
    return sorted.filter(i => {
      const okText = !n || normalize(i.event).includes(n)
      const okFrom = !from || (i.date && i.date >= from)
      const okTo = !to || (i.date && i.date <= to)
      return okText && okFrom && okTo
    })
  }, [sorted, q, from, to])

  // Build event-level view with a primary thumbnail for search suggestions
  const eventSummaries = useMemo(() => {
    const map = new Map()
    for (const it of list) {
      const key = (it.event || '').trim() || 'Sự kiện'
      if (!map.has(key)) map.set(key, { name: key, count: 0, thumb: it.url, latestTs: 0 })
      const s = map.get(key)
      s.count += 1
      const t = it.date ? Date.parse(it.date) : (it.uploadedAt || 0)
      if (t > s.latestTs) { s.latestTs = t; s.thumb = it.url }
    }
    return Array.from(map.values()).sort((a,b)=> b.latestTs - a.latestTs)
  }, [list])

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="gallery" title="Thư viện ảnh" subtitle="Xem lại khoảnh khắc của cộng đoàn" vAlign="center" focus="center" />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <Reveal>
          <div className="mt-6 grid md:grid-cols-4 gap-3">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo tên sự kiện..." className="border rounded px-3 py-2" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600 w-10">Từ</label>
              <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded px-3 py-2 flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600 w-10">Đến</label>
              <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border rounded px-3 py-2 flex-1" />
            </div>
            <div className="text-sm text-neutral-500 self-center">Tổng: {list.length} ảnh</div>
          </div>
        </Reveal>

        {/* Search suggestions: event thumbnails */}
        {!!q && eventSummaries.length > 0 && (
          <Reveal>
            <div className="mt-4">
              <div className="text-sm text-neutral-600 mb-2">Sự kiện phù hợp</div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {eventSummaries.map((ev, idx) => (
                  <Reveal key={ev.name} delay={idx*60}>
                    <a
                       href={`#event-${encodeURIComponent(ev.name)}`}
                       className="flex items-center gap-3 p-2 border rounded-lg hover:shadow-sm bg-white">
                      <div className="h-12 w-16 bg-neutral-100 rounded overflow-hidden border">
                        <img src={ev.thumb} alt={ev.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <div className="font-medium">{ev.name}</div>
                        <div className="text-xs text-neutral-500">{new Date(ev.latestTs).toISOString().slice(0,10)} • {ev.count} ảnh</div>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Timeline grouped by event */}
        {(() => {
          const groupsMap = new Map()
          list.forEach((it) => {
            const key = (it.event || '').trim() || 'Sự kiện'
            if (!groupsMap.has(key)) groupsMap.set(key, [])
            groupsMap.get(key).push(it)
          })
          const groups = Array.from(groupsMap.entries()).map(([eventName, arr]) => {
            const ts = (it) => {
              if (it.date) {
                const t = Date.parse(it.date)
                if (Number.isFinite(t)) return t
              }
              return it.uploadedAt || 0
            }
            const latestItemTs = Math.max(...arr.map(ts))
            const meta = eventsMeta[eventName] || {}
            const groupTs = meta.date ? Date.parse(meta.date) : latestItemTs
            const sortedItems = arr.slice().sort((a,b)=> ts(b) - ts(a))
            return { eventName, items: sortedItems, latestTs: groupTs, meta }
          }).sort((a, b) => b.latestTs - a.latestTs)

          return (
            <div className="relative mt-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-200" />
              <div className="space-y-8">
                {groups.map((g, idx) => (
                  <Reveal key={g.eventName + idx} delay={idx*80}>
                    <section id={`event-${encodeURIComponent(g.eventName)}`} className="relative pl-8 scroll-mt-24">
                      <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary shadow" />
                      <div className="flex items-baseline gap-3">
                        <h2 className="font-display text-lg">{g.eventName}</h2>
                        <div className="text-xs text-neutral-500">{new Date(g.latestTs).toISOString().slice(0,10)}</div>
                      </div>
                      <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {g.items.map((i, j) => (
                          <Reveal key={i.id} delay={j*40}>
                            <div className="rounded-lg overflow-hidden border bg-white">
                              <div className="aspect-[4/3] bg-neutral-100">
                                <img src={i.url} alt={g.eventName} className="w-full h-full object-cover" loading="lazy" />
                              </div>
                            </div>
                          </Reveal>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
      <Footer />
    </div>
  )
}

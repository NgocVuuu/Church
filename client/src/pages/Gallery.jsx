import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { useMemo, useState } from 'react'
import { useGallery } from '../hooks/useGallery'
import Reveal from '../components/Reveal'

export default function Gallery() {
  const { groups } = useGallery()
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const normalize = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()

  function safeFormat(dateLike) {
    try {
      if (!dateLike) return ''
      const t = typeof dateLike === 'number' ? dateLike : Date.parse(dateLike)
      if (!Number.isFinite(t)) return ''
      return new Date(t).toISOString().slice(0,10)
    } catch { return '' }
  }

  const timelineGroups = useMemo(() => {
    const n = normalize(q)
    const list = Array.isArray(groups) ? groups : []
    const filtered = list.filter(g => {
      const okText = !n || normalize(g.title).includes(n)
      const okFrom = !from || (g.date && g.date >= from)
      const okTo = !to || (g.date && g.date <= to)
      return okText && okFrom && okTo
    })
    return filtered
      .map(g => ({
        id: g.id,
        title: g.title || 'Sự kiện',
        date: g.date || '',
        latestTs: (g.date && Number.isFinite(Date.parse(g.date))) ? Date.parse(g.date) : 0,
        coverUrl: g.coverUrl || g.photos?.[0]?.url || '',
        photos: (g.photos||[]).slice()
      }))
      .sort((a, b) => b.latestTs - a.latestTs)
  }, [groups, q, from, to])

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
            <div className="text-sm text-neutral-500 self-center">Tổng: {timelineGroups.length} sự kiện</div>
          </div>
        </Reveal>

        {/* Timeline grouped by event */}
        <div className="relative mt-6">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-200" />
          <div className="space-y-8">
            {timelineGroups.map((g, idx) => (
              <Reveal key={g.id || g.title + idx} delay={idx*80}>
                <section id={`event-${encodeURIComponent(g.title)}`} className="relative pl-8 scroll-mt-24">
                  <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary shadow" />
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-display text-lg">{g.title}</h2>
                    <div className="text-xs text-neutral-500">{safeFormat(g.date)}</div>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {g.photos.map((p, j) => (
                      <Reveal key={p.url + j} delay={j*40}>
                        <div className="rounded-lg overflow-hidden border bg-white">
                          <div className="aspect-[4/3] bg-neutral-100">
                            <img src={p.url} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
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
      </div>
      <Footer />
    </div>
  )
}

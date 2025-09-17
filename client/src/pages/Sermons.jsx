import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useSermons } from '../hooks/useSermons'
import Reveal from '../components/Reveal'

export default function Sermons() {
  const { sermons } = useSermons()
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const normalize = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()
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
  const filtered = useMemo(() => {
    const n = normalize(q)
    const base = [...sermons].sort((a,b) => effectiveTs(b) - effectiveTs(a))
    if (!n) return base
    return base.filter(s => [s.title, s.summary, s.pastor, s.date].some(v => normalize(v).includes(n)))
  }, [q, sermons])
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="sermons" title="Bài giảng" subtitle="Các bài giảng mới nhất của quý cha trong giáo xứ" vAlign="center" focus="center" />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        <Reveal>
          <div className="mt-6 relative w-full md:w-1/2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm kiếm bài giảng..." className="w-full border rounded px-3 py-2" />
            {q && filtered.slice(0,6).length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow">
                {filtered.slice(0,6).map(s => (
                  <button key={s.id} onClick={()=>navigate(`/bai-giang/${s.slug || s.id}`)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-neutral-50">
                    <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100 flex-none">
                      {s.image ? <img src={s.image} alt="thumb" className="w-full h-full object-cover" loading="lazy"/> : null}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-neutral-500">{s.pastor} • {s.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {filtered.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 60}>
              <Link to={`/bai-giang/${s.slug || s.id}`} className="h-full border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 bg-neutral-100">
                  {s.image ? <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy"/> : null}
                </div>
                <div className="p-5 flex flex-col flex-1 min-h-0 gap-2">
                  <div className="text-xs uppercase tracking-widest text-neutral-500">{s.date} • {s.pastor || s.preacher}</div>
                  <h3 className="font-display text-xl mt-2 clamp-2">{s.title}</h3>
                  <p className="text-neutral-600 text-sm mt-auto">Nghe/đọc bài giảng →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

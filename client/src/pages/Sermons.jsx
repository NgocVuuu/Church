import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useSermons } from '../hooks/useSermons'
import Reveal from '../components/Reveal'

export default function Sermons() {
  const { sermons } = useSermons()
  const [q, setQ] = useState('')
  const [author, setAuthor] = useState('')
  const [sp, setSp] = useSearchParams()
  const aFromQs = sp.get('author') || ''
  if (aFromQs && author !== aFromQs) setAuthor(aFromQs)
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
  const SERMON_AUTHORS = [
    'Linh mục',
    'Đức Giám Mục',
    'Đức Thánh Cha',
  ]
  const filtered = useMemo(() => {
    const n = normalize(q)
    const base = [...sermons].sort((a,b) => effectiveTs(b) - effectiveTs(a))
    const byText = !n ? base : base.filter(s => [s.title, s.summary, s.pastor, s.date].some(v => normalize(v).includes(n)))
    const byAuthor = author ? byText.filter(s => (s.pastor||'') === author) : byText
    return byAuthor
  }, [q, author, sermons])
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="sermons" title="Bài giảng" subtitle="Các bài giảng mới nhất của quý cha trong giáo xứ" vAlign="center" focus="center" />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        <Reveal>
          <div className="mt-6 relative w-full md:w-2/3 flex flex-col md:flex-row gap-3">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm kiếm bài giảng..." className="w-full border rounded px-3 py-2" />
            <div className="flex items-center gap-2">
              <select value={author} onChange={e=>{ setAuthor(e.target.value); if (e.target.value) setSp({ author: e.target.value }); else setSp({}) }} className="border rounded px-3 py-2 min-w-[220px]">
                <option value="">Lọc theo tác giả</option>
                {SERMON_AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {author && <button className="text-sm text-neutral-600" onClick={()=>{ setAuthor(''); setSp({}) }}>Xóa lọc</button>}
            </div>
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

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {filtered.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 60}>
              <Link to={`/bai-giang/${s.slug || s.id}`} className="h-full border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="h-24 sm:h-28 md:h-40 bg-neutral-100">
                  {s.image ? <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy"/> : null}
                </div>
                <div className="p-3 md:p-5 flex flex-col flex-1 min-h-0 gap-2">
                  <div className="text-[11px] md:text-xs uppercase tracking-widest text-neutral-500">{s.date}  {s.pastor || s.preacher}</div>
                  <h3 className="font-display text-sm md:text-xl mt-1 md:mt-2 clamp-2 leading-snug">{s.title}</h3>
                  <p className="text-neutral-600 text-xs md:text-sm mt-auto">Nghe/đọc bài giảng →</p>
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

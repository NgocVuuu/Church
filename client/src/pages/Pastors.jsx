import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { usePriests } from '../hooks/usePriests'
import Reveal from '../components/Reveal'

export default function Pastors() {
  const { priests } = usePriests()
  function normalizeVN(s='') {
    try { return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim() } catch { return (s||'').toString().toLowerCase().trim() }
  }
  const isChanhXu = (r='') => normalizeVN(r).includes('chanh xu')
  const sortedPriests = [...priests].sort((a,b) => {
    const aCX = isChanhXu(a.role)
    const bCX = isChanhXu(b.role)
    if (aCX && !bCX) return -1
    if (!aCX && bCX) return 1
    return normalizeVN(a.name).localeCompare(normalizeVN(b.name))
  })
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="pastors" title="Quý cha mục vụ" subtitle="Thông tin các cha đang phục vụ tại giáo xứ" vAlign="center" focus="center" />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <Reveal>
          <div className="mt-6 text-sm text-neutral-600">Tổng số: {priests.length}</div>
        </Reveal>
        {sortedPriests.length === 0 ? (
          <Reveal delay={120}>
            <div className="mt-8 text-neutral-500">Chưa có dữ liệu linh mục. Vui lòng thêm trong trang quản trị.</div>
          </Reveal>
        ) : (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {sortedPriests.map((p, idx) => (
              <Reveal key={p.id} delay={idx * 80}>
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-56 bg-neutral-100">
                    {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" loading="lazy"/> : null}
                  </div>
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-widest text-neutral-500">{p.role}</div>
                    <h3 className="font-display text-xl mt-1">{p.name}</h3>
                    <div className="mt-3 text-sm text-neutral-600 space-y-1">
                      {p.email && (<div>Email: <a className="text-primary" href={`mailto:${p.email}`}>{p.email}</a></div>)}
                      {p.phone && (<div>Điện thoại: <a className="text-primary" href={`tel:${p.phone}`}>{p.phone}</a></div>)}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

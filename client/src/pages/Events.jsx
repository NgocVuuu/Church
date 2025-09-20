import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import PageBanner from '../components/PageBanner'
import { useHomeContent } from '../hooks/useHome'

export default function EventsPage() {
  const { content } = useHomeContent()
  const events = Array.isArray(content.events) ? content.events : []
  const upcoming = events
    .filter(e => e?.date)
    .sort((a,b)=> new Date(a.date) - new Date(b.date))

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <PageBanner title="Sự kiện" subtitle="Danh sách sự kiện sắp tới" />
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {upcoming.map((e, idx) => (
              <Reveal key={idx}>
                {/* Mobile compact card: image left (vertical), white panel right */}
                <div className="md:hidden">
                  <div className="flex items-stretch bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-100 relative shrink-0">
                      {e.image ? (
                        <img src={e.image} alt={e.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 h-24 sm:h-28 p-3 flex flex-col min-w-0">
                      <h3 className="font-display text-sm font-medium clamp-2 leading-snug">{e.title}</h3>
                      {e.timeLabel ? (
                        <div className="text-[11px] text-neutral-600 mt-0.5 clamp-2">{e.timeLabel}</div>
                      ) : null}
                      {e.address ? (
                        <div className="text-[11px] text-neutral-600 mt-0.5 clamp-2">{e.address}</div>
                      ) : null}
                      <div className="mt-auto text-[11px] text-neutral-500">
                        {(() => { try { return e.date ? new Date(e.date).toLocaleDateString('vi-VN') : '' } catch { return e.date || '' } })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop/tablet original layout */}
                <div className="hidden md:grid md:grid-cols-2 gap-0 items-stretch">
                  {/* Left: Image (fills half) */}
                  <div className="relative">
                    {e.image ? (
                      <img src={e.image} alt={e.title} className="w-full h-64 md:h-72 object-cover rounded-l-lg border md:border-r-0 border-neutral-200" />
                    ) : (
                      <div className="w-full h-64 md:h-72 bg-neutral-100 rounded-l-lg border md:border-r-0 border-neutral-200" />
                    )}
                  </div>
                  {/* Right: White panel slightly taller than image (staggered) */}
                  <div className="relative">
                    {/* Create the taller staggering effect (taller than before) */}
                    <div className="absolute -top-6 left-0 right-0 bottom-0 rounded-r-lg bg-white border border-neutral-200 shadow-sm" />
                    {/* Date ribbon occupying 2/3 width */}
                    <div className="absolute left-0 top-0 w-2/3 z-20 -ml-3">
                      <div className="relative bg-primary text-black font-medium text-sm px-4 py-2 rounded-br shadow">
                        {(() => {
                          try {
                            return e.date ? new Date(e.date).toLocaleDateString('vi-VN') : ''
                          } catch { return e.date || '' }
                        })()}
                        {/* Triangular wedge for folded effect */}
                        <span
                          className="absolute -right-3 top-0 h-0 w-0"
                          style={{
                            borderTop: '18px solid transparent',
                            borderBottom: '18px solid transparent',
                            borderLeft: '12px solid #f9d342',
                          }}
                        />
                        {/* Darker small triangle notch at left-bottom (perpendicular to bottom and panel edge) */}
                        <span
                          className="absolute left-0 h-0 w-0"
                          style={{
                            top: '100%',
                            borderTop: '12px solid #f1c937',
                            borderLeft: '12px solid transparent',
                          }}
                        />
                      </div>
                    </div>
                    {/* Content layer */}
                    <div className="relative p-6 md:p-7 pt-10 md:pt-12 z-10">
                      <h3 className="font-display text-xl leading-snug mb-2">{e.title}</h3>
                      {e.timeLabel && (
                        <div className="text-xs text-neutral-600 mb-1">{e.timeLabel}</div>
                      )}
                      {e.pastor && (
                        <div className="text-sm text-neutral-700 mb-1">
                          <span className="opacity-70">bởi pastor:</span> <span className="text-primary font-medium">{e.pastor}</span>
                        </div>
                      )}
                      {e.address && (
                        <div className="text-sm text-neutral-700 mb-2">{e.address}</div>
                      )}
                      {e.date && (
                        <div className="text-xs text-neutral-500 mb-3">{new Date(e.date).toLocaleString()}</div>
                      )}
                      <div className="pt-1">
                        <a href="#" className="inline-flex items-center bg-primary text-black px-5 py-2.5 rounded-full font-medium shadow hover:brightness-110">Tham gia</a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            {upcoming.length === 0 && (
              <div className="text-center text-neutral-500 md:col-span-2 lg:col-span-3">Chưa có sự kiện nào.</div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

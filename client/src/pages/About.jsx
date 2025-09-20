import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import RecentPhotos from '../components/RecentPhotos'
import Footer from '../components/Footer'
import { useContactContent } from '../hooks/useContact'
import { useAboutContent } from '../hooks/useAbout'
import Reveal from '../components/Reveal'

export default function About() {
  const { content } = useContactContent()
  const { content: about } = useAboutContent()
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="about" title="Giới thiệu giáo xứ" subtitle="Thông tin tổng quan và sứ mạng" vAlign="center" focus="center" />

  <section className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-3 md:gap-6">
          {[{
            label:'Giáo dân', value:`~ ${about.stats.parishioners}`, note:'Số giáo dân sinh hoạt thường xuyên'
          },{
            label:'Linh mục', value:about.stats.priests, note:'Đang mục vụ tại giáo xứ'
          },{
            label:'Giáo họ/giáo khu', value:about.stats.zones, note:'Tổ chức sinh hoạt theo giáo khu'
          }].map((it, idx)=> (
            <Reveal key={it.label} delay={idx*80}>
              <div className="rounded-lg bg-neutral-50 p-3 md:p-6 border">
                <div className="text-neutral-500 uppercase text-[10px] md:text-xs tracking-widest">{it.label}</div>
                <div className="mt-1 md:mt-2 font-display text-xl md:text-3xl">{it.value}</div>
                <p className="mt-1 text-neutral-600 text-xs md:text-sm">{it.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

  <section className="py-6 md:py-8">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
              {/* Left: Rich intro */}
              <Reveal>
              <div>
                <h2 className="font-display text-2xl">{about.intro.title}</h2>
                {about.intro.paragraphs.map((p, i) => (
                  <p key={i} className="mt-4 leading-7 text-neutral-700">{p}</p>
                ))}
                {!!about.intro.bullets.length && (
                  <ul className="mt-4 list-disc pl-5 text-neutral-700 space-y-1">
                    {about.intro.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}

                {/* Highlights (dynamic) */}
                {about.highlights?.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">
                    {about.highlights.slice(0,3).map((h, i) => (
                      <Reveal key={i} delay={i*70}>
                        <div className="rounded-lg border p-3 md:p-4 bg-neutral-50">
                          <div className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-500">{h.tag}</div>
                          <div className="font-display text-base md:text-xl mt-1">{h.title}</div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
              </Reveal>

              {/* Right: Image collage + Map link */}
              <div className="grid gap-4">
                <Reveal>
                  <div className="grid grid-cols-3 gap-4">
                    {about.collage.map((u, i) => (
                      <img key={i} className="rounded-md h-28 w-full object-cover border" src={u} alt={`parish${i+1}`} loading="lazy" />
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div className="rounded-lg overflow-hidden border">
                    <iframe
                      title="Bản đồ đến giáo xứ"
                      src={content.mapEmbedUrl}
                      width="100%"
                      height="240"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
      </section>

  <section className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <RecentPhotos showViewAll={true} />
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  )
}

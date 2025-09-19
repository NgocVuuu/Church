import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { useContactContent } from '../hooks/useContact'
import Reveal from '../components/Reveal'

export default function Contact() {
  const { content } = useContactContent()
  return (
    <div className="bg-neutral-50 min-h-screen">
      <Navbar />
  <PageBanner pageKey="contact" title="Liên hệ" subtitle="Kết nối với giáo xứ" vAlign="center" focus="center" />
  <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 grid md:grid-cols-2 gap-10">
        {/* Left info cards */}
        <div className="space-y-5">
          {[{
            label:'Địa chỉ', node: <div className="mt-3 text-neutral-700 whitespace-pre-line">{content.address}</div>
          },{
            label:'Điện thoại', node: <a href={`tel:${content.phone?.replace(/\s/g,'')}`} className="mt-3 block text-primary">{content.phone}</a>
          },{
            label:'Email', node: <a href={`mailto:${content.email}`} className="mt-3 block text-primary">{content.email}</a>
          },{
            label:'Website', node: <a href={content.website?.startsWith('http') ? content.website : `https://${content.website}`} className="mt-3 block text-primary" target="_blank" rel="noreferrer">{content.website}</a>
          }].map((it, idx)=> (
            <Reveal key={it.label} delay={idx*70}>
              <div className="bg-white border rounded-lg p-6">
                <div className="uppercase tracking-widest text-xs text-neutral-500">{it.label}</div>
                {it.node}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Right form */}
  <div className="bg-neutral-50">
          <Reveal>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
              <input type="email" placeholder="Your Email" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" placeholder="Subject" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
              <textarea placeholder="Message" rows="7" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-full bg-primary text-white px-8 py-4 shadow-[0_20px_40px_-10px_rgba(249,211,66,0.6)]">Send Message</button>
            </form>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 rounded-lg overflow-hidden border">
              <iframe
                title="Google Map"
                src={content.mapEmbedUrl}
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
      <Footer />
    </div>
  )
}

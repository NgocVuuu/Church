import { useEffect, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useHomeContent } from '../../hooks/useHomeContent'
import { useToast } from '../../components/Toast'

export default function AdminHome() {
  const { content, save } = useHomeContent()
  const toast = useToast()
  const [draft, setDraft] = useState(content)

  // Keep local draft in sync when persisted content loads/updates
  useEffect(() => {
    setDraft(content)
  }, [content])

  const setMass = (next) => setDraft(prev => ({ ...prev, mass: { ...prev.mass, ...next }}))
  const setEvent = (next) => setDraft(prev => ({ ...prev, event: { ...prev.event, ...next }}))
  const setQuotes = (next) => setDraft(prev => ({ ...prev, quotes: next }))
  const setSlides = (next) => setDraft(prev => ({ ...prev, slides: next }))
  const setAnnouncements = (next) => setDraft(prev => ({ ...prev, announcements: next }))

  const addWeekly = () => setMass({ weekly: [...draft.mass.weekly, { day: 'Thứ Hai', times: ['05:30'] }] })
  const addSpecial = () => setMass({ specials: [...draft.mass.specials, { date: '01/01', label: 'Sự kiện', times: ['08:00'] }] })
  const addQuote = () => setQuotes([...draft.quotes, { title: 'Tiêu đề', text: 'Nội dung', source: 'ĐGH Phanxicô', image: '' }])
  const addSlide = () => setSlides([...(draft.slides || []), { img: '', titlePre: 'Chúng tôi', titleEm: 'YÊU THIÊN CHÚA', titlePost: '', desc: '' }])
  const addAnnouncement = () => setAnnouncements([...(draft.announcements || []), { title: 'Thông báo', text: '', date: '' }])

  const onSave = () => { save(draft); toast.success('Đã lưu nội dung trang Home') }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl mb-3">Banner trang Home (Slides)</h2>
        <div className="space-y-3">
          {(draft.slides || []).map((s, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                <CloudinaryUpload onUploaded={(u)=>{
                  const slides=[...(draft.slides||[])]; slides[idx] = { ...s, img: u }; setSlides(slides)
                }} folder="church/home/slides" />
                {s.img && <img src={s.img} alt="slide" className="h-16 rounded border" />}
              </div>
              <input value={s.img} onChange={(e)=>{ const slides=[...(draft.slides||[])]; slides[idx] = { ...s, img: e.target.value }; setSlides(slides) }} placeholder="Hoặc dán URL ảnh slide" className="border rounded px-3 py-2 text-sm w-full" />
              <div className="grid md:grid-cols-3 gap-2">
                <input value={s.titlePre} onChange={(e)=>{ const slides=[...(draft.slides||[])]; slides[idx] = { ...s, titlePre: e.target.value }; setSlides(slides) }} placeholder="Tiền tố tiêu đề" className="border rounded px-3 py-2" />
                <input value={s.titleEm} onChange={(e)=>{ const slides=[...(draft.slides||[])]; slides[idx] = { ...s, titleEm: e.target.value }; setSlides(slides) }} placeholder="Nhấn mạnh" className="border rounded px-3 py-2" />
                <input value={s.titlePost} onChange={(e)=>{ const slides=[...(draft.slides||[])]; slides[idx] = { ...s, titlePost: e.target.value }; setSlides(slides) }} placeholder="Hậu tố tiêu đề" className="border rounded px-3 py-2" />
              </div>
              <textarea value={s.desc} onChange={(e)=>{ const slides=[...(draft.slides||[])]; slides[idx] = { ...s, desc: e.target.value }; setSlides(slides) }} placeholder="Mô tả" rows={3} className="w-full border rounded px-3 py-2" />
              <div className="text-right">
                <button onClick={()=>{ const slides=[...(draft.slides||[])]; slides.splice(idx,1); setSlides(slides) }} className="text-sm text-red-600">Xóa slide</button>
              </div>
            </div>
          ))}
          <button onClick={addSlide} className="text-sm text-primary">+ Thêm slide</button>
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl mb-3">Giờ lễ</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">Hằng tuần</div>
            <div className="space-y-2">
              {draft.mass.weekly.map((w, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input value={w.day} onChange={(e)=>{
                    const weekly=[...draft.mass.weekly]; weekly[idx]={...w, day:e.target.value}; setMass({weekly})
                  }} className="border rounded px-2 py-1 w-28" />
                  <input value={w.times.join(', ')} onChange={(e)=>{
                    const weekly=[...draft.mass.weekly]; weekly[idx]={...w, times:e.target.value.split(',').map(s=>s.trim())}; setMass({weekly})
                  }} className="border rounded px-2 py-1 flex-1" />
                </div>
              ))}
              <button onClick={addWeekly} className="text-sm text-primary">+ Thêm</button>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">Đặc biệt</div>
            <div className="space-y-2">
              {draft.mass.specials.map((s, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <input value={s.date} onChange={(e)=>{
                    const specials=[...draft.mass.specials]; specials[idx]={...s, date:e.target.value}; setMass({specials})
                  }} className="border rounded px-2 py-1" />
                  <input value={s.label} onChange={(e)=>{
                    const specials=[...draft.mass.specials]; specials[idx]={...s, label:e.target.value}; setMass({specials})
                  }} className="border rounded px-2 py-1" />
                  <input value={s.times.join(', ')} onChange={(e)=>{
                    const specials=[...draft.mass.specials]; specials[idx]={...s, times:e.target.value.split(',').map(v=>v.trim())}; setMass({specials})
                  }} className="border rounded px-2 py-1" />
                </div>
              ))}
              <div className="flex items-center gap-4">
                <button onClick={addSpecial} className="text-sm text-primary">+ Thêm</button>
                {draft.mass.specials.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Xóa tất cả mục đặc biệt?')) {
                        setMass({ specials: [] })
                        toast.info('Đã xóa tất cả giờ lễ đặc biệt')
                      }
                    }}
                    className="text-sm text-red-600"
                  >
                    Xóa hết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Thông báo</h2>
        <div className="border rounded-lg p-4 space-y-3">
          {(draft.announcements || []).map((a, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-2 items-start">
              <input
                value={a.date}
                onChange={(e)=>{
                  const v = e.target.value; const list=[...(draft.announcements||[])]; list[idx] = { ...a, date: v }; setAnnouncements(list)
                }}
                type="date"
                className="border rounded px-3 py-2 md:col-span-1"
                placeholder="YYYY-MM-DD"
              />
              <input
                value={a.title}
                onChange={(e)=>{
                  const v = e.target.value; const list=[...(draft.announcements||[])]; list[idx] = { ...a, title: v }; setAnnouncements(list)
                }}
                className="border rounded px-3 py-2 md:col-span-1"
                placeholder="Tiêu đề"
              />
              <textarea
                value={a.text}
                onChange={(e)=>{
                  const v = e.target.value; const list=[...(draft.announcements||[])]; list[idx] = { ...a, text: v }; setAnnouncements(list)
                }}
                rows={2}
                className="border rounded px-3 py-2 md:col-span-2"
                placeholder="Nội dung"
              />
              <div className="md:col-span-4 text-right -mt-1">
                <button onClick={()=>{ const list=[...(draft.announcements||[])]; list.splice(idx,1); setAnnouncements(list) }} className="text-sm text-red-600">Xóa</button>
              </div>
            </div>
          ))}
          <button onClick={addAnnouncement} className="text-sm text-primary">+ Thêm thông báo</button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Sự kiện sắp tới</h2>
        <div className="border rounded-lg p-4 space-y-3">
          <input value={draft.event.title} onChange={(e)=>setEvent({title:e.target.value})} placeholder="Tiêu đề" className="w-full border rounded px-3 py-2" />
          <input value={draft.event.timeLabel} onChange={(e)=>setEvent({timeLabel:e.target.value})} placeholder="Khung giờ" className="w-full border rounded px-3 py-2" />
          <input value={draft.event.pastor} onChange={(e)=>setEvent({pastor:e.target.value})} placeholder="Linh mục" className="w-full border rounded px-3 py-2" />
          <input value={draft.event.address} onChange={(e)=>setEvent({address:e.target.value})} placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
          <input value={draft.event.date} onChange={(e)=>setEvent({date:e.target.value})} placeholder="Ngày (ISO)" className="w-full border rounded px-3 py-2" />
          <div className="flex items-center gap-4">
            <CloudinaryUpload onUploaded={(u)=>setEvent({image:u})} folder="church/events" />
            {draft.event.image && <img src={draft.event.image} alt="event" className="h-16 rounded border" />}
          </div>
          <input value={draft.event.image} onChange={(e)=>setEvent({image:e.target.value})} placeholder="Hoặc dán URL ảnh sự kiện" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Huấn từ Đức Giáo hoàng</h2>
        <div className="border rounded-lg p-4 space-y-4">
          {draft.quotes.map((q, idx) => (
            <div key={idx} className="grid md:grid-cols-2 gap-3 border rounded p-3">
              <div className="space-y-2">
                <input value={q.title} onChange={(e)=>{
                  const quotes=[...draft.quotes]; quotes[idx]={...q, title:e.target.value}; setQuotes(quotes)
                }} placeholder="Tiêu đề" className="w-full border rounded px-3 py-2" />
                <textarea value={q.text} onChange={(e)=>{
                  const quotes=[...draft.quotes]; quotes[idx]={...q, text:e.target.value}; setQuotes(quotes)
                }} placeholder="Nội dung" rows={3} className="w-full border rounded px-3 py-2" />
                <input value={q.source} onChange={(e)=>{
                  const quotes=[...draft.quotes]; quotes[idx]={...q, source:e.target.value}; setQuotes(quotes)
                }} placeholder="Nguồn" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex items-center gap-4">
                <CloudinaryUpload onUploaded={(u)=>{
                  const quotes=[...draft.quotes]; quotes[idx]={...q, image:u}; setQuotes(quotes)
                }} folder="church/quotes" />
                {q.image && <img src={q.image} alt="quote" className="h-16 rounded border" />}
              </div>
              <input value={q.image} onChange={(e)=>{ const quotes=[...draft.quotes]; quotes[idx]={...q, image:e.target.value}; setQuotes(quotes) }} placeholder="Hoặc dán URL ảnh huấn từ" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          ))}
          <button onClick={addQuote} className="text-sm text-primary">+ Thêm huấn từ</button>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={onSave} className="bg-primary text-white rounded px-5 py-2">Lưu nội dung</button>
      </div>
    </div>
  )
}

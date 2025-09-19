import { useEffect, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useHomeContent } from '../../hooks/useHome'
import { useToast } from '../../components/Toast'

export default function AdminHome() {
  const { content, save } = useHomeContent()
  const toast = useToast()
  const [draft, setDraft] = useState(content)
  const [showEventsList, setShowEventsList] = useState(false)
  const [openEvents, setOpenEvents] = useState({}) // { [idx]: true }
  const [showSlides, setShowSlides] = useState(false)
  const [openSlides, setOpenSlides] = useState({})
  const [showQuotes, setShowQuotes] = useState(false)
  const [openQuotes, setOpenQuotes] = useState({})

  // Keep local draft in sync when persisted content loads/updates
  useEffect(() => {
    setDraft(content)
  }, [content])

  const setMass = (next) => setDraft(prev => ({ ...prev, mass: { ...prev.mass, ...next }}))
  const setEvent = (next) => setDraft(prev => ({ ...prev, event: { ...prev.event, ...next }}))
  const setEvents = (next) => setDraft(prev => ({ ...prev, events: next }))
  const setQuotes = (next) => setDraft(prev => ({ ...prev, quotes: next }))
  const setSlides = (next) => setDraft(prev => ({ ...prev, slides: next }))
  const setAnnouncements = (next) => setDraft(prev => ({ ...prev, announcements: next }))

  const addWeekly = () => setMass({ weekly: [...draft.mass.weekly, { day: 'Thứ Hai', times: ['05:30'] }] })
  const addSpecial = () => setMass({ specials: [...draft.mass.specials, { date: '01/01', label: 'Sự kiện', times: ['08:00'] }] })
  const addQuote = () => setQuotes([...draft.quotes, { title: 'Tiêu đề', text: 'Nội dung', source: 'ĐGH Phanxicô', image: '' }])
  const addSlide = () => setSlides([...(draft.slides || []), { img: '', titlePre: 'Chúng tôi', titleEm: 'YÊU THIÊN CHÚA', titlePost: '', desc: '' }])
  const addAnnouncement = () => setAnnouncements([...(draft.announcements || []), { title: 'Thông báo', text: '', date: '' }])

  const onSave = async () => {
    try {
      await save(draft)
      toast.success('Đã lưu nội dung trang Home')
    } catch (e) {
      toast.error(`Lưu thất bại: ${e?.message || 'Lỗi không xác định'}`)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl mb-3">Banner trang Home (Slides)</h2>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-600">Tổng số: {(draft.slides||[]).length}</div>
          <button type="button" onClick={()=>setShowSlides(v=>!v)} className="text-sm text-primary">{showSlides ? 'Ẩn' : 'Hiển thị'}</button>
        </div>
        {showSlides && (
          <div className="space-y-3">
            {(draft.slides || []).map((s, idx) => {
              const open = !!openSlides[idx]
              const toggle = () => setOpenSlides(prev => ({ ...prev, [idx]: !prev[idx] }))
              const title = `${s.titlePre||''} ${s.titleEm||''} ${s.titlePost||''}`.trim() || 'Slide'
              return (
                <div key={idx} className="border rounded">
                  <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-neutral-50">
                    {s.img ? <img src={s.img} alt="thumb" className="h-8 w-12 object-cover rounded border" /> : <div className="h-8 w-12 bg-neutral-200 rounded" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{title}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={toggle} className="text-sm text-primary">{open ? 'Thu gọn' : 'Sửa'}</button>
                      <button onClick={()=>{ const slides=[...(draft.slides||[])]; slides.splice(idx,1); setSlides(slides) }} className="text-sm text-red-600">Xóa</button>
                    </div>
                  </div>
                  {open && (
                    <div className="p-4 space-y-3">
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
                    </div>
                  )}
                </div>
              )
            })}
            <button onClick={addSlide} className="text-sm text-primary">+ Thêm slide</button>
          </div>
        )}
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
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Danh sách sự kiện <span className="text-xs text-neutral-500">({(draft.events||[]).length})</span></div>
              <button
                type="button"
                onClick={()=> setShowEventsList(v=>!v)}
                className="text-sm text-primary"
              >{showEventsList ? 'Ẩn' : 'Hiển thị'}</button>
            </div>
            {showEventsList && (
              <div className="space-y-1.5 mt-2">
                {(draft.events || []).map((ev, idx) => {
                  const open = !!openEvents[idx]
                  const toggle = () => setOpenEvents(prev => ({ ...prev, [idx]: !prev[idx] }))
                  const summaryDate = ev.date ? new Date(ev.date).toLocaleDateString() : ''
                  return (
                    <div key={idx} className="border rounded">
                      {/* Summary row */}
                      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-neutral-50">
                        {ev.image ? (
                          <img src={ev.image} alt="thumb" className="h-8 w-12 object-cover rounded border" />
                        ) : (
                          <div className="h-8 w-12 bg-neutral-200 rounded" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-sm">{ev.title || 'Sự kiện'}</div>
                          <div className="text-xs text-neutral-600 truncate">{summaryDate || ''}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEvent({
                                title: ev.title || '',
                                timeLabel: ev.timeLabel || '',
                                pastor: ev.pastor || '',
                                address: ev.address || '',
                                date: ev.date || '',
                                image: ev.image || ''
                              })
                              toast?.success?.('Đã đặt sự kiện này làm nổi bật')
                            }}
                            className="text-sm px-2 py-1 rounded border hover:bg-neutral-50"
                          >Đặt làm nổi bật</button>
                          <button type="button" onClick={toggle} className="text-sm text-primary">{open ? 'Thu gọn' : 'Sửa'}</button>
                          <button
                            type="button"
                            onClick={()=>{ const list=[...(draft.events||[])]; list.splice(idx,1); setEvents(list) }}
                            className="text-sm text-red-600"
                          >Xóa</button>
                        </div>
                      </div>
                      {/* Expanded editor */}
                      {open && (
                        <div className="grid md:grid-cols-2 gap-2 p-3">
                          <input value={ev.title} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, title: e.target.value }; setEvents(list) }} placeholder="Tiêu đề" className="border rounded px-3 py-2" />
                          <input value={ev.timeLabel} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, timeLabel: e.target.value }; setEvents(list) }} placeholder="Khung giờ" className="border rounded px-3 py-2" />
                          <input value={ev.pastor} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, pastor: e.target.value }; setEvents(list) }} placeholder="Linh mục" className="border rounded px-3 py-2" />
                          <input value={ev.address} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, address: e.target.value }; setEvents(list) }} placeholder="Địa chỉ" className="border rounded px-3 py-2" />
                          <input value={ev.date} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, date: e.target.value }; setEvents(list) }} placeholder="Ngày (ISO)" className="border rounded px-3 py-2" />
                          <div className="flex items-center gap-3">
                            <CloudinaryUpload onUploaded={(u)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, image: u }; setEvents(list) }} folder="church/events" />
                            {ev.image && <img src={ev.image} alt="event" className="h-14 rounded border" />}
                          </div>
                          <input value={ev.image} onChange={(e)=>{ const list=[...(draft.events||[])]; list[idx] = { ...ev, image: e.target.value }; setEvents(list) }} placeholder="Hoặc dán URL ảnh sự kiện" className="border rounded px-3 py-2 md:col-span-2 text-sm" />
                        </div>
                      )}
                    </div>
                  )
                })}
                <button onClick={()=> setEvents([...(draft.events||[]), { title:'Sự kiện', timeLabel:'', pastor:'', address:'', date:'', image:'' }])} className="text-sm text-primary">+ Thêm sự kiện</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Huấn từ Đức Giáo hoàng</h2>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-600">Tổng số: {draft.quotes.length}</div>
          <button type="button" onClick={()=>setShowQuotes(v=>!v)} className="text-sm text-primary">{showQuotes ? 'Ẩn' : 'Hiển thị'}</button>
        </div>
        {showQuotes && (
          <div className="space-y-3">
            {draft.quotes.map((q, idx) => {
              const open = !!openQuotes[idx]
              const toggle = () => setOpenQuotes(prev => ({ ...prev, [idx]: !prev[idx] }))
              return (
                <div key={idx} className="border rounded">
                  <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-neutral-50">
                    {q.image ? <img src={q.image} alt="thumb" className="h-8 w-12 object-cover rounded border" /> : <div className="h-8 w-12 bg-neutral-200 rounded" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{q.title || 'Huấn từ'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={toggle} className="text-sm text-primary">{open ? 'Thu gọn' : 'Sửa'}</button>
                      <button onClick={()=>{ const quotes=[...draft.quotes]; quotes.splice(idx,1); setQuotes(quotes) }} className="text-sm text-red-600">Xóa</button>
                    </div>
                  </div>
                  {open && (
                    <div className="grid md:grid-cols-2 gap-3 p-3">
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
                      <input value={q.image} onChange={(e)=>{ const quotes=[...draft.quotes]; quotes[idx]={...q, image:e.target.value}; setQuotes(quotes) }} placeholder="Hoặc dán URL ảnh huấn từ" className="w-full border rounded px-3 py-2 text-sm md:col-span-2" />
                    </div>
                  )}
                </div>
              )
            })}
            <button onClick={addQuote} className="text-sm text-primary">+ Thêm huấn từ</button>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button onClick={onSave} className="bg-primary text-white rounded px-5 py-2">Lưu nội dung</button>
      </div>
    </div>
  )
}

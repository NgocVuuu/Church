import { useEffect, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'
import { useAboutContent } from '../../hooks/useAboutContent'

export default function AdminAbout() {
  const banner = useBanner('about')
  const { content, save } = useAboutContent()
  const [local, setLocal] = useState(content)
  // Sync local state when content updates
  useEffect(() => { setLocal(content) }, [content])
  return (
    <div>
      <h2 className="font-display text-xl mb-4">Giới thiệu</h2>
      <div className="mb-6 border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Banner trang Giới thiệu</div>
        <div className="flex items-center gap-4">
          <CloudinaryUpload onUploaded={(u)=>banner.setBanner('about', u)} folder="church/banners/about" />
          {banner.url && <img src={banner.url} alt="banner" className="h-16 rounded border" />}
        </div>
      </div>
      <form className="space-y-4 max-w-3xl" onSubmit={(e)=>{ e.preventDefault(); save(local) }}>
        <div>
          <label className="text-sm text-neutral-700">Tiêu đề mục giới thiệu</label>
          <input
            value={local.intro.title}
            onChange={(e)=>setLocal(v=>({ ...v, intro: { ...v.intro, title: e.target.value } }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Đoạn giới thiệu</label>
          <textarea
            rows={10}
            value={local.intro.paragraphs.join('\n\n')}
            onChange={(e)=>setLocal(v=>({ ...v, intro: { ...v.intro, paragraphs: e.target.value.split(/\n\n+/).map(s=>s.trim()).filter(Boolean) } }))}
            className="w-full border rounded px-3 py-2 resize-y min-h-[200px]"
            placeholder="Mỗi đoạn cách nhau 1 dòng trống"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Các ý chính (gạch đầu dòng)</label>
          <textarea
            rows={4}
            value={local.intro.bullets.join('\n')}
            onChange={(e)=>setLocal(v=>({ ...v, intro: { ...v.intro, bullets: e.target.value.split(/\n+/).map(s=>s.trim()).filter(Boolean) } }))}
            className="w-full border rounded px-3 py-2"
            placeholder="Mỗi dòng là một ý"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-neutral-700">Giáo dân</label>
            <input value={local.stats.parishioners} onChange={(e)=>setLocal(v=>({ ...v, stats: { ...v.stats, parishioners: e.target.value } }))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-neutral-700">Linh mục</label>
            <input value={local.stats.priests} onChange={(e)=>setLocal(v=>({ ...v, stats: { ...v.stats, priests: e.target.value } }))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-neutral-700">Giáo khu</label>
            <input value={local.stats.zones} onChange={(e)=>setLocal(v=>({ ...v, stats: { ...v.stats, zones: e.target.value } }))} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-700">Mục nổi bật (3 mục)</label>
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 bg-neutral-50 space-y-2">
                <input
                  value={local.highlights[i]?.tag || ''}
                  onChange={(e)=>setLocal(v=>{ const arr=[...v.highlights]; arr[i] = { ...(arr[i]||{}), tag: e.target.value }; return { ...v, highlights: arr } })}
                  placeholder="Nhãn (ví dụ: Sinh hoạt nổi bật)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <input
                  value={local.highlights[i]?.title || ''}
                  onChange={(e)=>setLocal(v=>{ const arr=[...v.highlights]; arr[i] = { ...(arr[i]||{}), title: e.target.value }; return { ...v, highlights: arr } })}
                  placeholder="Tiêu đề (ví dụ: Ca đoàn 3 ban)"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-700">Ảnh collage (3 ảnh)</label>
          <div className="grid sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_,i)=> (
              <div key={i} className="space-y-2">
                <CloudinaryUpload onUploaded={(u)=>setLocal(v=>{ const arr=[...v.collage]; arr[i]=u; return { ...v, collage: arr } })} folder="church/about" label="Chọn ảnh" />
                <input value={local.collage[i] || ''} onChange={(e)=>setLocal(v=>{ const arr=[...v.collage]; arr[i]=e.target.value; return { ...v, collage: arr } })} className="w-full border rounded px-3 py-2 text-sm" placeholder={`URL ảnh ${i+1}`} />
                {local.collage[i] && <img src={local.collage[i]} alt={`collage-${i+1}`} className="h-24 w-full object-cover rounded border" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-primary text-white rounded px-4 py-2" type="submit">Lưu</button>
          <div className="text-sm text-neutral-600">Nội dung sẽ được hiển thị ở trang Giới thiệu.</div>
        </div>
      </form>
    </div>
  )
}

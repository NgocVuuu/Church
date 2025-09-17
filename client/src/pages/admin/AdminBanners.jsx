import { useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'

const pages = [
  { key: 'about', label: 'Giới thiệu' },
  { key: 'blog', label: 'Bài viết' },
  { key: 'sermons', label: 'Bài giảng' },
  { key: 'pastors', label: 'Mục tử' },
  { key: 'contact', label: 'Liên hệ' },
  { key: 'gallery', label: 'Thư viện ảnh' },
]

export default function AdminBanners() {
  const [selected, setSelected] = useState(pages[0].key)
  const { url, setBanner } = useBanner(selected)

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Ảnh banner các trang</h2>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Chọn trang:</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)} className="border rounded px-3 py-2 text-sm">
          {pages.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
      <div className="space-y-3">
  <CloudinaryUpload onUploaded={(u)=>setBanner(selected, u)} folder={`church/banners/${selected}`} />
        {url && (
          <div>
            <div className="text-sm text-neutral-600 mb-1">Xem trước:</div>
            <img src={url} alt="banner" className="h-40 w-full object-cover rounded border" />
          </div>
        )}
      </div>
    </div>
  )
}

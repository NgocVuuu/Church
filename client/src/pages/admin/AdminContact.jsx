import { useEffect, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'
import { useContactContent } from '../../hooks/useContactContent'
import { useToast } from '../../components/Toast'

export default function AdminContact() {
  const banner = useBanner('contact')
  const { content, save } = useContactContent()
  const toast = useToast()
  const [draft, setDraft] = useState(content)

  useEffect(() => { setDraft(content) }, [content])

  const onSave = () => { save(draft); toast.success('Đã lưu nội dung trang Liên hệ') }

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="font-display text-xl mb-3">Banner trang Liên hệ</h2>
        <div className="flex items-center gap-4 border rounded-lg p-4">
          <CloudinaryUpload onUploaded={(u)=>banner.setBanner('contact', u)} folder="church/banners/contact" />
          {banner.url && <img src={banner.url} alt="banner" className="h-16 rounded border" />}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Thông tin liên hệ</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 border rounded-lg p-4">
            <label className="text-sm text-neutral-600">Địa chỉ</label>
            <textarea
              rows={4}
              value={draft.address}
              onChange={(e)=>setDraft(prev=>({ ...prev, address: e.target.value }))}
              className="w-full border rounded px-3 py-2 whitespace-pre-wrap"
              placeholder={'198 West 21th Street, Suite 721\nNew York, NY 10016'}
            />
            <label className="text-sm text-neutral-600">Điện thoại</label>
            <input
              value={draft.phone}
              onChange={(e)=>setDraft(prev=>({ ...prev, phone: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="+ 1235 2355 98"
            />
            <label className="text-sm text-neutral-600">Email</label>
            <input
              value={draft.email}
              onChange={(e)=>setDraft(prev=>({ ...prev, email: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="info@yoursite.com"
            />
            <label className="text-sm text-neutral-600">Website</label>
            <input
              value={draft.website}
              onChange={(e)=>setDraft(prev=>({ ...prev, website: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="yoursite.com hoặc https://yoursite.com"
            />
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            <label className="text-sm text-neutral-600">Google Maps Embed URL</label>
            <input
              value={draft.mapEmbedUrl}
              onChange={(e)=>setDraft(prev=>({ ...prev, mapEmbedUrl: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="https://www.google.com/maps/embed?..."
            />
            <div className="rounded overflow-hidden border">
              <iframe title="Map preview" src={draft.mapEmbedUrl} width="100%" height="260" style={{border:0}} loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={onSave} className="bg-primary text-white rounded px-5 py-2">Lưu</button>
      </div>
    </div>
  )
}

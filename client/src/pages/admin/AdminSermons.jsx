import { useMemo, useRef, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'
import { useSermons } from '../../hooks/useSermons'
import { useToast } from '../../components/Toast'

export default function AdminSermons() {
  const [imageUrl, setImageUrl] = useState('')
  const banner = useBanner('sermons')
  const { sermons, addSermon, updateSermon, removeSermon, slugify, ensureUniqueSlug, refetch } = useSermons()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', pastor: '', date: '', summary: '', content: '' })
  const [editingId, setEditingId] = useState(null)
  const summaryRef = useRef(null)
  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!form.title?.trim()) {
        toast.error('Vui lòng nhập tiêu đề')
        return
      }
      // Tạo summary <= 500 ký tự từ nội dung textarea (đang dùng như content)
      const makeSummary = (text = '', max = 500) => {
        const clean = (text || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/__([^_]+)__/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/_([^_]+)_/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/https?:\/\/\S+/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
      }

      // Map và chuẩn hóa dữ liệu gửi lên server
      const base = {
        title: form.title?.trim(),
        pastor: form.pastor?.trim(),
        date: form.date?.trim(),
        image: imageUrl?.trim(),
        content: (form.content && form.content.trim()) || (form.summary || ''),
      }
      base.summary = makeSummary(base.content || base.summary || '')

      if (editingId) {
        await updateSermon(editingId, base)
        toast.success('Đã cập nhật bài giảng')
        setEditingId(null)
      } else {
        // Tạo slug duy nhất (best-effort) để hạn chế lỗi 409 từ server
        const rawSlug = slugify(base.title)
        const uniqueSlug = ensureUniqueSlug(rawSlug)
        await addSermon({ ...base, slug: uniqueSlug })
        toast.success('Đã thêm bài giảng')
      }
      // Xác nhận đã lưu ở DB bằng cách refetch (tránh chỉ thấy state cục bộ)
      try { await refetch() } catch {}

      // Reset form
      setForm({ title: '', pastor: '', date: '', summary: '', content: '' })
      setImageUrl('')
    } catch (err) {
      const msg = err?.message || 'Lỗi khi lưu bài giảng'
      if (/slug/i.test(msg)) toast.error('Slug đã tồn tại, vui lòng đổi tiêu đề')
      else if (/Authentication/i.test(msg) || /401/.test(msg)) toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại')
      else toast.error(msg)
    }
  }
  // List state
  const normalizeVN = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D')
  const parseVNDate = (s='') => {
    if (!s) return null
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (m) { const d=parseInt(m[1],10), mo=parseInt(m[2],10)-1, y=parseInt(m[3],10); const dt=new Date(y,mo,d); return isNaN(dt.getTime())?null:dt }
    const dt = new Date(s); return isNaN(dt.getTime())?null:dt
  }
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    const nq = normalizeVN(q).toLowerCase()
    const fromDt = parseVNDate(from)
    const toDt = parseVNDate(to)
    return sermons.filter(p => {
      const hay = `${normalizeVN(p.title)} ${normalizeVN(p.pastor)}`.toLowerCase()
      if (nq && !hay.includes(nq)) return false
      const d = parseVNDate(p.date)
      if (fromDt && (!d || d < fromDt)) return false
      if (toDt && (!d || d > toDt)) return false
      return true
    })
  }, [sermons, q, from, to])

  const sorted = useMemo(() => [...filtered].sort((a,b)=>{
    const da = parseVNDate(a.date)?.getTime() ?? 0
    const db = parseVNDate(b.date)?.getTime() ?? 0
    return db - da
  }), [filtered])

  const beginEdit = (p) => {
    setForm({ title: p.title || '', pastor: p.pastor || '', date: p.date || '', summary: p.summary || '', content: p.content || '' })
    setImageUrl(p.image || '')
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const onRemove = (id) => { if (confirm('Xóa bài giảng này?')) { removeSermon(id); toast.info('Đã xóa bài giảng') } }
  const applyBold = () => {
    const prevY = window.scrollY
    const ta = summaryRef.current
    if (!ta) return
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    const val = form.summary || ''
    const sel = val.slice(start, end)
    const before = val.slice(0, start)
    const after = val.slice(end)
    const inner = sel || 'văn bản đậm'
    const next = `${before}**${inner}**${after}`
    setForm(f => ({ ...f, summary: next }))
    setTimeout(() => {
      ta.focus(); const s = start + 2; const e = s + inner.length; ta.setSelectionRange(s, e)
      try { window.scrollTo({ top: prevY, left: 0 }) } catch {}
    }, 0)
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Bài giảng</h2>
      <div className="mb-6 border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Banner trang Bài giảng</div>
        <div className="flex items-center gap-4">
          <CloudinaryUpload onUploaded={(u)=>banner.setBanner('sermons', u)} folder="church/banners/sermons" />
          {banner.url && <img src={banner.url} alt="banner" className="h-16 rounded border" />}
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-5xl">
        <input value={form.title} onChange={(e)=>setForm(f=>({...f, title:e.target.value}))} placeholder="Tiêu đề" className="w-full border rounded px-4 py-3" />
        <input value={form.pastor} onChange={(e)=>setForm(f=>({...f, pastor:e.target.value}))} placeholder="Linh mục giảng" className="w-full border rounded px-4 py-3" />
        <input value={form.date} onChange={(e)=>setForm(f=>({...f, date:e.target.value}))} placeholder="Ngày" className="w-full border rounded px-4 py-3" />
        <div className="space-y-2">
          <CloudinaryUpload onUploaded={setImageUrl} folder="church/sermons" />
          <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="Hoặc dán URL ảnh thủ công" className="w-full border rounded px-4 py-3 text-sm" />
        </div>
        {imageUrl && <img src={imageUrl} alt="preview" className="h-48 rounded border" />}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={applyBold} className="px-2 py-1 border rounded text-sm font-medium" title="In đậm">B</button>
          </div>
          <textarea ref={summaryRef} value={form.summary} onChange={(e)=>setForm(f=>({...f, summary:e.target.value}))} placeholder="Tóm tắt (hỗ trợ in đậm với **văn bản** )" rows={10} className="w-full border rounded px-4 py-3 font-sans" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-primary text-black rounded px-5 py-2.5">{editingId ? 'Cập nhật' : 'Lưu'}</button>
          {editingId && (
            <button type="button" onClick={()=>{ setEditingId(null); setForm({ title:'', pastor:'', date:'', summary:'', content:'' }); setImageUrl('') }} className="border rounded px-4 py-2">Hủy sửa</button>
          )}
        </div>
      </form>

      {/* List, search, filters */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-neutral-600">Tìm kiếm</label>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Theo tiêu đề hoặc linh mục" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Từ ngày (dd/mm/yyyy)</label>
            <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="vd: 01/09/2025" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Đến ngày (dd/mm/yyyy)</label>
            <input value={to} onChange={e=>setTo(e.target.value)} placeholder="vd: 30/09/2025" className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Ảnh</th>
                <th className="py-2 pr-3 w-1/2">Tiêu đề</th>
                <th className="py-2 pr-3">Linh mục</th>
                <th className="py-2 pr-3">Ngày</th>
                <th className="py-2 pr-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.id} className="border-b align-top">
                  <td className="py-2 pr-3">
                    {p.image ? <img src={p.image} alt="thumb" className="h-12 w-20 object-cover rounded"/> : <span className="text-neutral-400">(Không có)</span>}
                  </td>
                  <td className="py-2 pr-3 w-full">
                    <div>
                      <div className="font-medium text-sm md:text-base line-clamp-2">{p.title}</div>
                      <div className="text-neutral-500 line-clamp-2 text-xs whitespace-pre-line">{p.summary || p.content}</div>
                    </div>
                  </td>
                  <td className="py-2 pr-3">{p.pastor}</td>
                  <td className="py-2 pr-3">{p.date}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>beginEdit(p)} className="px-2 py-1 border rounded">Sửa</button>
                      <button onClick={()=>onRemove(p.id)} className="px-2 py-1 border rounded text-red-600">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-neutral-500">Không có bài giảng nào phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

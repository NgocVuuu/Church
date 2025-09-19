import { useMemo, useRef, useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'
import { usePosts } from '../../hooks/usePosts'
import { useToast } from '../../components/Toast'

export default function AdminPosts() {
  const [imageUrl, setImageUrl] = useState('')
  const banner = useBanner('blog')
  const { posts, addPost, updatePost, removePost, slugify } = usePosts()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', slug: '', author: '', date: '', content: '' })
  const [editingId, setEditingId] = useState(null)
  const contentRef = useRef(null)
  const onSubmit = async (e) => {
    e.preventDefault()
    const raw = form.slug || slugify(form.title)
    if (editingId) {
      try {
        await updatePost(editingId, { ...form, slug: raw, image: imageUrl })
  toast.success('Đã cập nhật bài viết')
        setEditingId(null)
      } catch (err) {
        toast.error(`Cập nhật thất bại: ${err?.message || 'Lỗi không xác định'}`)
        return
      }
    } else {
      try {
        const date = form.date || new Date().toLocaleDateString('vi-VN')
        await addPost({ ...form, slug: raw, image: imageUrl, date })
  toast.success('Đã thêm bài viết')
      } catch (err) {
        toast.error(`Thêm thất bại: ${err?.message || 'Lỗi không xác định'}`)
        return
      }
    }
    setForm({ title: '', slug: '', author: '', date: '', content: '' })
    setImageUrl('')
  }
  // Helpers
  const normalizeVN = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D')
  const parseVNDate = (s='') => {
    if (!s) return null
    // dd/MM/yyyy
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (m) {
      const d = parseInt(m[1],10), mo = parseInt(m[2],10)-1, y = parseInt(m[3],10)
      const dt = new Date(y, mo, d)
      return isNaN(dt.getTime()) ? null : dt
    }
    const dt = new Date(s)
    return isNaN(dt.getTime()) ? null : dt
  }

  // List state
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    const nq = normalizeVN(q).toLowerCase()
    const fromDt = parseVNDate(from)
    const toDt = parseVNDate(to)
    return posts.filter(p => {
      const hay = `${normalizeVN(p.title)} ${normalizeVN(p.author)}`.toLowerCase()
      if (nq && !hay.includes(nq)) return false
      const d = parseVNDate(p.date)
      if (fromDt && (!d || d < fromDt)) return false
      if (toDt && (!d || d > toDt)) return false
      return true
    })
  }, [posts, q, from, to])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = parseVNDate(a.date)?.getTime() ?? 0
      const db = parseVNDate(b.date)?.getTime() ?? 0
      return db - da
    })
  }, [filtered])

  const beginEdit = (p) => {
    setForm({ title: p.title || '', slug: p.slug || '', author: p.author || '', date: p.date || '', content: p.content || '' })
    setImageUrl(p.image || '')
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const onRemove = async (id) => {
    if (!confirm('Xóa bài viết này?')) return
    try {
      await removePost(id)
  toast.info('Đã xóa bài viết')
    } catch (err) {
      toast.error(`Xóa thất bại: ${err?.message || 'Lỗi không xác định'}`)
    }
  }

  const applyBold = () => {
    const prevY = window.scrollY
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    const val = form.content || ''
    const sel = val.slice(start, end)
    const before = val.slice(0, start)
    const after = val.slice(end)
    const inner = sel || 'văn bản đậm'
    const next = `${before}**${inner}**${after}`
    setForm(f => ({ ...f, content: next }))
    setTimeout(() => {
      ta.focus()
      const s = start + 2
      const e = s + inner.length
      ta.setSelectionRange(s, e)
      try { window.scrollTo({ top: prevY, left: 0 }) } catch {}
    }, 0)
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Bài viết</h2>
      <div className="mb-6 border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Banner trang Bài viết</div>
        <div className="flex items-center gap-4">
          <CloudinaryUpload onUploaded={(u)=>banner.setBanner('blog', u)} folder="church/banners/blog" />
          {banner.url && <img src={banner.url} alt="banner" className="h-16 rounded border" />}
        </div>
      </div>
  <form onSubmit={onSubmit} className="space-y-4 max-w-5xl">
        <input value={form.title} onChange={(e)=>{
          const title = e.target.value
          setForm(f=>({ ...f, title, slug: f.slug ? f.slug : slugify(title) }))
        }} placeholder="Tiêu đề" className="w-full border rounded px-4 py-3" />
        <input value={form.author} onChange={(e)=>setForm(f=>({...f, author:e.target.value}))} placeholder="Tác giả" className="w-full border rounded px-4 py-3" />
        <input value={form.date} onChange={(e)=>setForm(f=>({...f, date:e.target.value}))} placeholder="Ngày (vd: 17/09/2025 hoặc 2025-09-17)" className="w-full border rounded px-4 py-3" />
        <div className="space-y-2">
          <CloudinaryUpload onUploaded={setImageUrl} folder="church/posts" />
          <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="Hoặc dán URL ảnh thủ công" className="w-full border rounded px-4 py-3 text-sm" />
        </div>
        {imageUrl && <img src={imageUrl} alt="preview" className="h-48 rounded border" />}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={applyBold} className="px-2 py-1 border rounded text-sm font-medium" title="In đậm">
              B
            </button>
          </div>
          <textarea ref={contentRef} value={form.content} onChange={(e)=>setForm(f=>({...f, content:e.target.value}))} placeholder="Nội dung (hỗ trợ in đậm với **văn bản** )" rows={12} className="w-full border rounded px-4 py-3 font-sans" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-primary text-black rounded px-5 py-2.5">
            {editingId ? 'Cập nhật' : 'Lưu'}
          </button>
          {editingId && (
            <button type="button" onClick={()=>{ setEditingId(null); setForm({ title:'', slug:'', author:'', date:'', content:'' }); setImageUrl('') }} className="border rounded px-4 py-2">Hủy sửa</button>
          )}
        </div>
      </form>

      {/* List, search, filters */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-neutral-600">Tìm kiếm</label>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Theo tiêu đề hoặc tác giả" className="w-full border rounded px-3 py-2" />
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
                <th className="py-2 pr-3">Tiêu đề</th>
                <th className="py-2 pr-3">Tác giả</th>
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
                      <div className="font-medium">{p.title}</div>
                      <div className="text-neutral-500 line-clamp-2 text-xs whitespace-pre-line">{p.content}</div>
                    </div>
                  </td>
                  <td className="py-2 pr-3">{p.author}</td>
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
                  <td colSpan="5" className="py-6 text-center text-neutral-500">Không có bài viết nào phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

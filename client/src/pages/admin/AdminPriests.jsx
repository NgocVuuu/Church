import { useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useBanner } from '../../hooks/useBanner'
import { usePriests } from '../../hooks/usePriests'

export default function AdminPriests() {
  const [avatarUrl, setAvatarUrl] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [editId, setEditId] = useState(null) // null = add mode; otherwise editing
  const banner = useBanner('pastors')
  const { priests, addPriest, removePriest, updatePriest } = usePriests()

  const onSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const payload = { name: name.trim(), role: role.trim(), email: email.trim(), phone: phone.trim(), avatar: avatarUrl.trim() }
    if (editId) {
      updatePriest(editId, payload)
    } else {
      addPriest(payload)
    }
    // reset form
    setEditId(null)
    setName('')
    setRole('')
    setEmail('')
    setPhone('')
    setAvatarUrl('')
  }
  const startEdit = (p) => {
    setEditId(p.id)
    setName(p.name || '')
    setRole(p.role || '')
    setEmail(p.email || '')
    setPhone(p.phone || '')
    setAvatarUrl(p.avatar || '')
  }
  const cancelEdit = () => {
    setEditId(null)
    setName('')
    setRole('')
    setEmail('')
    setPhone('')
    setAvatarUrl('')
  }
  // Sorting: "Chánh xứ" always first
  function normalizeVN(s='') {
    try { return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim() } catch { return (s||'').toString().toLowerCase().trim() }
  }
  const isChanhXu = (r='') => normalizeVN(r).includes('chanh xu')
  const sortedPriests = [...priests].sort((a,b) => {
    const aCX = isChanhXu(a.role)
    const bCX = isChanhXu(b.role)
    if (aCX && !bCX) return -1
    if (!aCX && bCX) return 1
    return normalizeVN(a.name).localeCompare(normalizeVN(b.name))
  })
  return (
    <div>
      <h2 className="font-display text-xl mb-4">Mục tử</h2>
      <div className="mb-6 border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Banner trang Mục tử</div>
        <div className="flex items-center gap-4">
          <CloudinaryUpload onUploaded={(u)=>banner.setBanner('pastors', u)} folder="church/banners/pastors" />
          {banner.url && <img src={banner.url} alt="banner" className="h-16 rounded border" />}
        </div>
      </div>
      <form className="space-y-3 max-w-2xl" onSubmit={onSubmit}>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Họ tên linh mục" className="w-full border rounded px-3 py-2" />
        <input value={role} onChange={(e)=>setRole(e.target.value)} placeholder="Chức vụ (Chánh xứ/Phó xứ)" className="w-full border rounded px-3 py-2" />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Điện thoại" className="w-full border rounded px-3 py-2" />
        <div className="space-y-2">
          <CloudinaryUpload onUploaded={setAvatarUrl} folder="church/priests" />
          <input value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} placeholder="Hoặc dán URL ảnh thủ công" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        {avatarUrl && <img src={avatarUrl} alt="avatar" className="h-24 w-24 rounded-full object-cover border" />}
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-primary text-white rounded px-4 py-2">{editId ? 'Cập nhật' : 'Thêm linh mục'}</button>
          {editId && <button type="button" className="rounded px-4 py-2 border" onClick={cancelEdit}>Hủy chỉnh sửa</button>}
        </div>
      </form>

      <div className="mt-8">
        <div className="text-sm text-neutral-600 mb-2">Danh sách hiện có: {priests.length}</div>
        <div className="grid md:grid-cols-3 gap-4">
          {sortedPriests.map(p => (
            <div key={p.id} className="border rounded-lg p-3 flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-neutral-100 overflow-hidden">
                {p.avatar ? <img src={p.avatar} alt={p.name} className="h-full w-full object-cover"/> : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-neutral-600 truncate">{p.role || '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-neutral-700 text-sm" onClick={()=>startEdit(p)}>Sửa</button>
                <button className="text-red-600 text-sm" onClick={()=>removePriest(p.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

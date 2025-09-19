import { useState } from 'react'
import CloudinaryUpload from '../../components/CloudinaryUpload'
import { useGallery } from '../../hooks/useGallery'
import { useBanner } from '../../hooks/useBanner'
import { useToast } from '../../components/Toast'

function Icon({ name, className = 'h-4 w-4' }) {
  // Simple inline icons: pencil, check, x, calendar
  if (name === 'pencil') return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793zM12.379 5.5 4 13.879V17h3.121L15.5 8.621l-3.121-3.121z"/></svg>
  )
  if (name === 'check') return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3-3A1 1 0 0 1 6.207 9.793L8.5 12.086l6.793-6.793a1 1 0 0 1 1.414 0z"/></svg>
  )
  if (name === 'x') return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.225 4.811a1 1 0 1 0-1.414 1.414L8.586 10l-3.775 3.775a1 1 0 1 0 1.414 1.414L10 11.414l3.775 3.775a1 1 0 0 0 1.414-1.414L11.414 10l3.775-3.775a1 1 0 0 0-1.414-1.414L10 8.586 6.225 4.811z"/></svg>
  )
  if (name === 'calendar') return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 2 0v1zm11 6H3v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/></svg>
  )
  return null
}

function InlineEditableText({ value, onSave, className = '', placeholder = 'Nhập...' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value || '')
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {editing ? (
        <>
          <input
            autoFocus
            className="border rounded px-2 py-1 min-w-[280px] sm:min-w-[360px]"
            value={val}
            placeholder={placeholder}
            onChange={(e)=>setVal(e.target.value)}
            onKeyDown={(e)=>{
              if (e.key === 'Enter') { setEditing(false); onSave?.(val) }
              if (e.key === 'Escape') { setEditing(false); setVal(value || '') }
            }}
          />
          <button type="button" className="text-primary" onClick={()=>{ setEditing(false); onSave?.(val) }} title="Lưu"><Icon name="check"/></button>
          <button type="button" className="text-neutral-500" onClick={()=>{ setEditing(false); setVal(value || '') }} title="Hủy"><Icon name="x"/></button>
        </>
      ) : (
        <>
          <span>{value || placeholder}</span>
          <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" onClick={()=>setEditing(true)} title="Sửa">
            <Icon name="pencil"/>
          </button>
        </>
      )}
    </div>
  )
}

function InlineEditableDate({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value || '')
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {editing ? (
        <>
          <input
            type="date"
            autoFocus
            className="border rounded px-2 py-1 text-sm"
            value={val}
            onChange={(e)=>setVal(e.target.value)}
            onKeyDown={(e)=>{
              if (e.key === 'Enter') { setEditing(false); onSave?.(val) }
              if (e.key === 'Escape') { setEditing(false); setVal(value || '') }
            }}
          />
          <button type="button" className="text-primary" onClick={()=>{ setEditing(false); onSave?.(val) }} title="Lưu"><Icon name="check"/></button>
          <button type="button" className="text-neutral-500" onClick={()=>{ setEditing(false); setVal(value || '') }} title="Hủy"><Icon name="x"/></button>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1 text-sm text-neutral-700"><Icon name="calendar"/><span>{value || 'Chọn ngày'}</span></span>
          <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" onClick={()=>setEditing(true)} title="Sửa">
            <Icon name="pencil"/>
          </button>
        </>
      )}
    </div>
  )
}

export default function AdminGallery() {
  const { items, groups: serverGroups, sorted, addItem, removeItem, deleteGroup, save, updateItem, renameEvent, setGroupDate } = useGallery()
  const toast = useToast()
  const [form, setForm] = useState({ event: '', date: '' })
  const [selectedIds, setSelectedIds] = useState(new Set())
  // Gallery page banner control
  const { url: bannerUrl, setBanner } = useBanner('gallery')

  const onUploaded = (url) => {
    addItem({ url, event: form.event, date: form.date })
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-4">Thư viện ảnh</h2>
      {/* Page banner section (separate, on top) */}
      <div className="mb-8 p-3 border rounded-lg bg-neutral-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-medium">Ảnh bìa cho trang thư viện ảnh</div>
            <div className="text-sm text-neutral-600">Ảnh này hiển thị ở phần tiêu đề của trang thư viện ảnh công khai.</div>
          </div>
          <div className="flex items-center gap-2">
            <CloudinaryUpload onUploaded={(u)=>setBanner('gallery', u)} folder="church/banners/gallery" label="Chọn ảnh bìa" />
            {bannerUrl && (
              <button type="button" className="text-sm px-3 py-1.5 rounded border hover:bg-white" onClick={()=>setBanner('gallery','')}>Gỡ ảnh</button>
            )}
          </div>
        </div>
        {bannerUrl && (
          <div className="mt-3">
            <img src={bannerUrl} alt="gallery banner" className="h-32 w-full object-cover rounded border" />
          </div>
        )}
      </div>
      <div className="space-y-3 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={form.event} onChange={e=>setForm(f=>({...f, event:e.target.value}))} placeholder="Tên sự kiện (khi thêm mới từ đây)" className="w-full border rounded px-3 py-2" />
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} placeholder="Ngày" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <CloudinaryUpload onUploaded={onUploaded} folder="church/gallery" multiple label="Thêm ảnh mới vào thư viện" />
          <div className="text-sm text-neutral-600">Có thể chỉ định tên sự kiện ở ô bên trái, hoặc thêm vào sự kiện cụ thể trong từng nhóm bên dưới.</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-600">Tổng {items.length} ảnh</div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm px-3 py-1.5 rounded border hover:bg-neutral-50 disabled:opacity-50"
              disabled={selectedIds.size === 0}
              onClick={() => {
                if (selectedIds.size === 0) return
                if (!confirm(`Xóa ${selectedIds.size} ảnh đã chọn?`)) return
                save(prev => prev.filter(i => !selectedIds.has(i.id)))
                setSelectedIds(new Set())
                toast.info('Đã xóa ảnh đã chọn')
              }}
            >Xóa ảnh đã chọn</button>
          </div>
        </div>
        {(() => {
          // Group by event
          const groupsMap = new Map()
          sorted.forEach((it) => {
            const key = (it.event || '').trim() || 'Sự kiện'
            if (!groupsMap.has(key)) groupsMap.set(key, [])
            groupsMap.get(key).push(it)
          })
          // Build group list with sorting by meta.date (if present) else latest item ts
          const groups = Array.from(groupsMap.entries()).map(([eventName, arr]) => {
            const dates = arr.map(a => a.date || '').filter(Boolean)
            const latestItemDate = dates.sort().reverse()[0] || ''
            const latestItemTs = Math.max(...arr.map(a => a.uploadedAt || 0))
            const effectiveTs = latestItemDate ? Date.parse(latestItemDate) : latestItemTs
            return { eventName, items: arr, effectiveTs, latestItemDate }
          }).sort((a, b) => b.effectiveTs - a.effectiveTs)
          const serverDateByTitle = new Map((serverGroups||[]).map(g => [g.title, g.date || '']))

          return (
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-200" />
              <div className="space-y-8">
                {groups.map((g, idx) => (
                  <div key={g.eventName + idx} className="relative pl-8">
                    <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary shadow" />
                    <div className="flex items-center gap-3 flex-wrap group">
                      <InlineEditableText
                        className="font-display text-lg"
                        value={g.eventName}
                        onSave={(val)=> { if (val !== g.eventName) renameEvent(g.eventName, val) }}
                        placeholder="Tên sự kiện"
                      />
                      {/* Date under title */}
                      <div className="w-full pl-6 -mt-2">
                        <InlineEditableDate
                          value={serverDateByTitle.get(g.eventName) || g.latestItemDate || ''}
                          onSave={async (val)=> {
                            try {
                              await setGroupDate(g.eventName, val)
                              toast.success('Đã cập nhật ngày cho sự kiện')
                            } catch (e) {
                              toast.error('Cập nhật ngày thất bại')
                            }
                          }}
                        />
                      </div>
                      <div className="ml-auto flex items-center gap-3 flex-wrap">
                        <button
                          className="text-xs px-2 py-1 rounded border hover:bg-neutral-50"
                          onClick={async () => {
                            if (!confirm(`Xóa toàn bộ ảnh của sự kiện "${g.eventName}"?`)) return
                            try {
                              await deleteGroup(g.eventName)
                              toast.info(`Đã xóa sự kiện "${g.eventName}"`)
                            } catch (e) {
                              toast.error('Xóa sự kiện thất bại')
                            }
                          }}
                        >Xóa sự kiện</button>
                        <div className="flex items-center gap-2">
                          <CloudinaryUpload
                            onUploaded={(url)=> {
                              const groupDate = serverDateByTitle.get(g.eventName) || g.latestItemDate || ''
                              addItem({ url, event: g.eventName, date: groupDate })
                            }}
                            folder={`church/gallery/${g.eventName.replace(/\s+/g,'-').toLowerCase()}`}
                            label="Thêm ảnh vào sự kiện"
                            size="sm"
                          />
                        </div>
                        <button
                          className="text-xs px-2 py-1 rounded border hover:bg-neutral-50"
                          onClick={() => {
                            const next = new Set(selectedIds)
                            const allSelected = g.items.every(x => next.has(x.id))
                            if (allSelected) { g.items.forEach(x => next.delete(x.id)) }
                            else { g.items.forEach(x => next.add(x.id)) }
                            setSelectedIds(next)
                          }}
                        >{g.items.every(x => selectedIds.has(x.id)) ? 'Bỏ chọn nhóm' : 'Chọn nhóm'}</button>
                      </div>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {g.items
                        .slice()
                        .sort((a,b)=>{
                          const ta = a.date ? Date.parse(a.date) : a.uploadedAt || 0
                          const tb = b.date ? Date.parse(b.date) : b.uploadedAt || 0
                          return tb - ta
                        })
                        .map(i => (
                        <label key={i.id} className="border rounded-lg overflow-hidden group cursor-pointer relative">
                          <div className="aspect-[4/3] bg-neutral-100 relative">
                            <img src={i.url} alt={g.eventName} className="w-full h-full object-cover" />
                            <input
                              type="checkbox"
                              className="absolute top-2 left-2 h-4 w-4 accent-primary"
                              checked={selectedIds.has(i.id)}
                              onChange={(e) => {
                                const next = new Set(selectedIds)
                                if (e.target.checked) next.add(i.id); else next.delete(i.id)
                                setSelectedIds(next)
                              }}
                            />
                            {(i.date || g.latestItemDate) && (
                              <span className="absolute bottom-2 left-2 text-[11px] px-1.5 py-0.5 rounded bg-white/90 border shadow text-neutral-800">
                                {i.date || g.latestItemDate}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!confirm('Xóa ảnh này?')) return
                                removeItem(i.id)
                                const next = new Set(selectedIds); next.delete(i.id); setSelectedIds(next)
                                toast.info('Đã xóa ảnh')
                              }}
                              className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-white/90 border shadow hover:bg-white"
                            >Xóa</button>
                          </div>
                          {/* no per-image edit UI; group-level controls above */}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

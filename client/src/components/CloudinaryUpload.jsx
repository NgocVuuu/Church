import { useRef, useState } from 'react'
import { useToast } from './Toast'

// Usage:
// <CloudinaryUpload onUploaded={(url)=>setImageUrl(url)} folder="church"/>
// Requires env:
//   VITE_CLOUDINARY_CLOUD
export default function CloudinaryUpload({ onUploaded, folder = 'church', multiple = false, label, size = 'md' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const inputRef = useRef(null)
  const toast = useToast()

  const uploadOne = async (file) => {
    if (!file) return
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD
  if (!cloud) { setError('Thiếu cấu hình Cloudinary: VITE_CLOUDINARY_CLOUD'); return }
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`
      // Lấy chữ ký từ server để upload signed
      const sigRes = await fetch('/api/cloudinary/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder }) })
      if (!sigRes.ok) throw new Error('Không lấy được chữ ký từ server')
      const { timestamp, folder: f, signature, apiKey } = await sigRes.json()
      form.append('timestamp', timestamp)
      if (f) form.append('folder', f)
      form.append('api_key', apiKey)
      form.append('signature', signature)
      const res = await fetch(uploadUrl, { method: 'POST', body: form })
      const data = await res.json()
      if (data.secure_url) {
        onUploaded?.(data.secure_url)
        toast.success('Tải ảnh thành công')
      } else {
        throw new Error(data.error?.message || 'Upload thất bại')
      }
    } catch (e) {
      const msg = e.message || 'Có lỗi khi tải ảnh'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleChange = async (filesList) => {
    const files = Array.from(filesList || [])
    if (files.length === 0) return
    setUploading(true)
    setProgress({ current: 0, total: files.length })
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length })
      // Sequential uploads to reduce signature calls overlapping
      await uploadOne(files[i])
    }
    setUploading(false)
    setProgress({ current: 0, total: 0 })
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple={multiple}
        onChange={(e)=>handleChange(e.target.files)}
      />
      <button
        type="button"
        onClick={()=>inputRef.current?.click()}
        className={`border rounded ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
      >
        {uploading
          ? (progress.total > 1 ? `Đang tải (${progress.current}/${progress.total})...` : 'Đang tải...')
          : (label || (multiple ? 'Chọn nhiều ảnh' : 'Chọn ảnh tải lên'))}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}

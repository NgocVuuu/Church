import { useRef, useState } from 'react'
import { useToast } from './Toast'
import { apiUrl } from '../lib/apiBase'

// Usage:
// <CloudinaryUpload onUploaded={(url)=>setImageUrl(url)} folder="church"/>
// No client env required; uses server signature endpoint to obtain cloudName/apiKey/signature.
export default function CloudinaryUpload({ onUploaded, folder = 'church', multiple = false, label, size = 'md' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const inputRef = useRef(null)
  const toast = useToast()

  const uploadOne = async (file) => {
    if (!file) return
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      // Lấy chữ ký từ server để upload signed (đồng thời nhận cloudName & apiKey)
      const sigRes = await fetch(apiUrl('/cloudinary/signature'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder }) })
      if (!sigRes.ok) throw new Error('Không lấy được chữ ký từ server')
      const { timestamp, folder: f, signature, apiKey, cloudName } = await sigRes.json()
      if (!cloudName || !apiKey || !signature) throw new Error('Thiếu thông tin ký Cloudinary (cloudName/apiKey/signature)')
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
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

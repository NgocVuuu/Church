import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/apiBase'

export default function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, sermons: 0, priests: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(apiUrl('/admin/summary'))
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setStats(data)
        }
      } catch {}
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Tổng quan</h1>
      <p className="text-neutral-600">Chọn một mục ở bên trái để chỉnh sửa nội dung các trang hiển thị cho người dùng.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">Bài viết: {loading ? '...' : stats.posts}</div>
        <div className="border rounded-lg p-4">Bài giảng: {loading ? '...' : stats.sermons}</div>
        <div className="border rounded-lg p-4">Mục tử: {loading ? '...' : stats.priests}</div>
      </div>
    </div>
  )
}

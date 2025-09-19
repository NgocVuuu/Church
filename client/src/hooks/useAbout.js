import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

const KEY = 'parish_about_content_v1'

const defaultContent = {
  intro: {
    title: 'Giới thiệu về giáo xứ',
    paragraphs: [
      'Giáo xứ hình thành từ đầu thế kỷ XX, với truyền thống đạo đức và tinh thần hiệp thông mạnh mẽ.',
      'Chúng tôi hướng đến xây dựng một cộng đoàn hiệp hành theo ba trụ cột: Hiệp thông – Tham gia – Sứ vụ.'
    ],
    bullets: [
      'Phụng vụ trang nghiêm, thánh nhạc phong phú',
      'Giáo lý và huấn giáo cho nhiều lứa tuổi',
      'Công tác bác ái xã hội và truyền giáo'
    ]
  },
  stats: { parishioners: '3.500', priests: '3', zones: '6' },
  collage: [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=800&auto=format&fit=crop'
  ],
  highlights: [
    { tag: 'Sinh hoạt nổi bật', title: 'Ca đoàn 3 ban' },
    { tag: 'Bác ái', title: 'Caritas giáo xứ' },
    { tag: 'Giới trẻ', title: 'Sinh hoạt thứ 7' },
  ],
}

function normalize(c) {
  const n = { ...defaultContent, ...c }
  n.intro = n.intro || {}
  n.intro.title = n.intro.title || ''
  n.intro.paragraphs = Array.isArray(n.intro.paragraphs) ? n.intro.paragraphs.filter(Boolean) : []
  n.intro.bullets = Array.isArray(n.intro.bullets) ? n.intro.bullets.filter(Boolean) : []
  n.stats = n.stats || { parishioners: '', priests: '', zones: '' }
  n.collage = Array.isArray(n.collage) ? n.collage.filter(Boolean) : []
  n.highlights = Array.isArray(n.highlights) ? n.highlights.map(h => ({ tag: h?.tag || '', title: h?.title || '' })) : []
  return n
}

export function useAboutContent() {
  const [content, setContent] = useState(defaultContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setContent(normalize(JSON.parse(raw)))
    } catch {}
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl('/about'))
        if (res.ok) {
          const data = await res.json().catch(()=> ({}))
          if (data && Object.keys(data).length) {
            const n = normalize(data)
            setContent(n)
            try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {}
          }
        }
      } catch (e) {
        setError(e?.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    })()
    const reload = () => {
      try { const raw2 = localStorage.getItem(KEY); if (raw2) setContent(normalize(JSON.parse(raw2))) } catch {}
    }
    const onStorage = (e) => { if (e.key === KEY) reload() }
    window.addEventListener('aboutContentUpdated', reload)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reload() })
    return () => {
      window.removeEventListener('aboutContentUpdated', reload)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const getAuthToken = () => { try { return localStorage.getItem('auth_token') } catch { return null } }
  const save = async (next) => {
    const n = normalize(next)
    const token = getAuthToken()
    if (token) {
      const res = await fetch(apiUrl('/about'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(n)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        const details = errorData.details?.map?.(d=>`${d.path?.join?.('.')||d.param||''}: ${d.msg||d.message||''}`).join('; ')
        const msg = errorData.error === 'Validation failed' && details ? `${errorData.error}: ${details}` : (errorData.error || `Server error: ${res.status}`)
        throw new Error(msg)
      }
      const saved = await res.json().catch(()=> n)
      const merged = normalize(saved)
      setContent(merged)
      try { localStorage.setItem(KEY, JSON.stringify(merged)) } catch {}
      try { window.dispatchEvent(new CustomEvent('aboutContentUpdated')) } catch {}
      return merged
    }
    setContent(n)
    try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {}
    try { window.dispatchEvent(new CustomEvent('aboutContentUpdated')) } catch {}
    return n
  }

  return { content, save, loading, error }
}

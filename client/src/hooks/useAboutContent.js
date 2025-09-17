import { useEffect, useState } from 'react'

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setContent(normalize(JSON.parse(raw)))
    } catch {}
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

  const save = (next) => {
    const n = normalize(next)
    setContent(n)
    localStorage.setItem(KEY, JSON.stringify(n))
    try { window.dispatchEvent(new CustomEvent('aboutContentUpdated')) } catch {}
  }

  return { content, save }
}

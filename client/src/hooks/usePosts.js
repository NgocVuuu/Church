import { useEffect, useState } from 'react'

const KEY = 'parish_posts_v1'
const defaults = [
  { id: '1', slug: 'niem-vui-tin-mung', title: 'Niềm vui Tin Mừng', date: '12/09/2025', author: 'Ban Truyền thông', image: '', content: 'Suy niệm về sứ điệp hiệp hành nơi cộng đoàn. Nội dung đầy đủ bài viết...' },
  { id: '2', slug: 'nhip-song-giao-xu', title: 'Nhịp sống giáo xứ', date: '05/09/2025', author: 'Giáo lý viên', image: '', content: 'Những hoạt động nổi bật trong tuần qua. Nội dung đầy đủ...' },
  { id: '3', slug: 'thong-bao-muc-vu', title: 'Thông báo mục vụ', date: '01/09/2025', author: 'Văn phòng Giáo xứ', image: '', content: 'Lịch sinh hoạt và các lưu ý dành cho cộng đoàn. Nội dung...' },
]

function normalizeVN(s='') {
  return s
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

function slugify(title='') {
  const base = normalizeVN(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || 'bai-viet'
}

function todayVN() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function parseVNDate(str='') {
  // dd/MM/YYYY -> timestamp
  const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(str)
  if (!m) return NaN
  const dd = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10) - 1
  const yyyy = parseInt(m[3], 10)
  return new Date(yyyy, mm, dd).getTime()
}

export function usePosts() {
  const [posts, setPosts] = useState(defaults)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        let loaded = JSON.parse(raw)
        // migrate missing slug/date/createdAt
        let changed = false
        const ensureUnique = (slug, idx) => {
          let s = slug
          let n = 2
          const exists = (val) => loaded.some((p, i) => i !== idx && p.slug === val)
          while (exists(s)) { s = `${slug}-${n++}` }
          return s
        }
        loaded = loaded.map((p, i) => {
          let next = { ...p }
          if (!next.slug) { changed = true; const s = ensureUnique(slugify(next.title), i); next.slug = s }
          if (!next.date) { changed = true; next.date = todayVN() }
          if (!next.createdAt) {
            const ts = parseVNDate(next.date)
            next.createdAt = Number.isFinite(ts) ? ts : Date.now() - i
            changed = true
          }
          return next
        })
        if (changed) { localStorage.setItem(KEY, JSON.stringify(loaded)) }
        setPosts(loaded)
      }
    } catch {}
  }, [])
  const savePosts = (next) => { setPosts(next); localStorage.setItem(KEY, JSON.stringify(next)) }
  const ensureUniqueSlug = (slug, excludeId) => {
    let s = slug
    let n = 2
    const exists = (val) => posts.some(p => p.slug === val && p.id !== excludeId)
    while (exists(s)) { s = `${slug}-${n++}` }
    return s
  }
  const addPost = (post) => {
    const id = Date.now().toString()
    const rawSlug = post.slug || slugify(post.title)
    const unique = ensureUniqueSlug(rawSlug)
    const date = post.date || todayVN()
    const createdAt = Date.now()
    const next = [{...post, id, slug: unique, date, createdAt}, ...posts]
    savePosts(next)
  }
  const updatePost = (id, patch) => { const next = posts.map(p => p.id === id ? { ...p, ...patch } : p); savePosts(next) }
  const removePost = (id) => { const next = posts.filter(p => p.id !== id); savePosts(next) }
  const getPost = (id) => posts.find(p => p.id === id)
  const getPostBySlug = (slug) => posts.find(p => p.slug === slug)
  return { posts, savePosts, addPost, updatePost, removePost, getPost, getPostBySlug, slugify, ensureUniqueSlug }
}

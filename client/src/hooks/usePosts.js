import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

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
  const [posts, setPosts] = useState([])
  const getAuthToken = () => { try { return localStorage.getItem('auth_token') } catch { return null } }

  // helper to normalize server doc shape
  const fromServer = (doc) => ({ id: doc._id || doc.id, title: doc.title, slug: doc.slug, author: doc.author || '', date: doc.date || todayVN(), image: doc.image || '', content: doc.content || '', views: typeof doc.views === 'number' ? doc.views : 0, createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now() })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(apiUrl('/posts'))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Invalid response')
        const mapped = data.map(fromServer)
        if (!cancelled) setPosts(mapped)
      } catch (e) {
        if (!cancelled) setPosts([])
      } finally {
        // One-time cleanup of old local cache if exists
        try { localStorage.removeItem('parish_posts_v1') } catch {}
      }
    }
    load()
    return () => { cancelled = true }
  }, [])
  const ensureUniqueSlug = (slug, excludeId) => {
    let s = slug
    let n = 2
    const exists = (val) => posts.some(p => p.slug === val && p.id !== excludeId)
    while (exists(s)) { s = `${slug}-${n++}` }
    return s
  }
  const addPost = async (post) => {
    const token = getAuthToken()
    if (!token) throw new Error('Cần đăng nhập')
    const body = { ...post, slug: post.slug || slugify(post.title), date: post.date || todayVN() }
    const res = await fetch(apiUrl('/posts'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) })
    const data = await res.json().catch(()=> ({}))
    if (!res.ok) throw new Error(data?.error || `Lỗi máy chủ (${res.status})`)
    const mapped = fromServer(data)
    setPosts([mapped, ...posts])
    return mapped
  }
  const updatePost = async (id, patch) => {
    const token = getAuthToken()
    if (!token) throw new Error('Cần đăng nhập')
    const res = await fetch(apiUrl(`/posts/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(patch) })
    const data = await res.json().catch(()=> ({}))
    if (!res.ok) throw new Error(data?.error || `Lỗi máy chủ (${res.status})`)
    const mapped = fromServer(data)
    setPosts(posts.map(p => p.id === id ? mapped : p))
    return mapped
  }
  const removePost = async (id) => {
    const token = getAuthToken()
    if (!token) throw new Error('Cần đăng nhập')
    const res = await fetch(apiUrl(`/posts/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    const data = await res.json().catch(()=> ({}))
    if (!res.ok) throw new Error(data?.error || `Lỗi máy chủ (${res.status})`)
    setPosts(posts.filter(p => p.id !== id))
    return true
  }
  const getPost = (id) => posts.find(p => p.id === id)
  const getPostBySlug = (slug) => posts.find(p => p.slug === slug)
  // View count semantics: The server increments on GET /posts/:slug.
  // We call this once on PostDetail mount/slug change.
  const fetchPostBySlug = async (slug) => {
    try {
      // Throttle: chỉ đếm 1 lần/slug trong 60 giây trên cùng 1 tab
      try {
        const key = `view_throttle_post_${slug}`
        const now = Date.now()
        const last = parseInt(sessionStorage.getItem(key) || '0', 10)
        if (last && now - last < 60_000) {
          // Không gọi server để tránh tăng views quá nhanh khi F5 liên tục
          const existing = posts.find(p => p.slug === slug)
          return existing || null
        }
        sessionStorage.setItem(key, String(now))
      } catch {}
      const res = await fetch(apiUrl(`/posts/${slug}`))
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      const mapped = fromServer(data)
      const next = (() => {
        const idx = posts.findIndex(p => p.slug === slug)
        if (idx === -1) return [mapped, ...posts]
        const copy = posts.slice(); copy[idx] = mapped; return copy
      })()
      setPosts(next)
      return mapped
    } catch (e) { return null }
  }
  return { posts, addPost, updatePost, removePost, getPost, getPostBySlug, fetchPostBySlug, slugify }
}

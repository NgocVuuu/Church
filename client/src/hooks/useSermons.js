import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

const KEY = 'parish_sermons_v1'

const normalizeVN = (s = '') => s
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')

export const slugify = (title = '') => {
  const base = normalizeVN(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || 'bai-giang'
}

const todayVN = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const parseVNDate = (str = '') => {
  const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(str)
  if (!m) return NaN
  const dd = +m[1]
  const mm = (+m[2]) - 1
  const yyyy = +m[3]
  return new Date(yyyy, mm, dd).getTime()
}

const fromServer = (doc) => ({
  id: doc._id || doc.id,
  title: doc.title || '',
  slug: doc.slug || '',
  pastor: doc.pastor || '',
  date: doc.date || todayVN(),
  image: doc.image || '',
  summary: doc.summary || '',
  content: doc.content || '',
  views: typeof doc.views === 'number' ? doc.views : 0,
  createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : (Number.isFinite(parseVNDate(doc.date)) ? parseVNDate(doc.date) : Date.now())
})

const useLocalCache = () => {
  const save = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {} }
  const load = () => {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
  }
  return { save, load }
}

export function useSermons() {
  const [sermons, setSermons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { save, load } = useLocalCache()

  const getAuthToken = () => {
    try { return localStorage.getItem('auth_token') } catch { return null }
  }

  const loadSermons = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl('/sermons'))
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      const mapped = Array.isArray(data) ? data.map(fromServer) : []
      setSermons(mapped)
      save(mapped)
    } catch (err) {
      console.error('Failed to load sermons:', err)
      setError(err.message)
      const cached = load()
      if (Array.isArray(cached) && cached.length) setSermons(cached)
      else setSermons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await loadSermons()
      if (cancelled) return
    })()
    return () => { cancelled = true }
  }, [])

  const ensureUniqueSlug = (slug, excludeId) => {
    let s = slug
    let n = 2
    const exists = (val) => sermons.some(p => p.slug === val && p.id !== excludeId)
    while (exists(s)) { s = `${slug}-${n++}` }
    return s
  }

  const saveState = (next) => { setSermons(next); save(next) }

  const addSermon = async (item) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Authentication required')
      const body = { ...item, slug: item.slug || slugify(item.title), date: item.date || todayVN() }
      const res = await fetch(apiUrl('/sermons'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        const details = errorData.details?.map?.(d=>`${d.path?.join?.('.')||d.param||''}: ${d.msg||d.message||''}`).join('; ')
        const msg = errorData.error === 'Validation failed' && details ? `${errorData.error}: ${details}` : (errorData.error || `Server error: ${res.status}`)
        throw new Error(msg)
      }
      const data = await res.json()
      const mapped = fromServer(data)
      saveState([mapped, ...sermons])
      return mapped
    } catch (err) {
      console.error('Failed to add sermon:', err)
      throw err
    }
  }

  const updateSermon = async (id, patch) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Authentication required')
      const res = await fetch(apiUrl(`/sermons/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(patch)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        const details = errorData.details?.map?.(d=>`${d.path?.join?.('.')||d.param||''}: ${d.msg||d.message||''}`).join('; ')
        const msg = errorData.error === 'Validation failed' && details ? `${errorData.error}: ${details}` : (errorData.error || `Server error: ${res.status}`)
        throw new Error(msg)
      }
      const data = await res.json()
      const mapped = fromServer(data)
      const next = sermons.map(s => s.id === id ? mapped : s)
      saveState(next)
      return mapped
    } catch (err) {
      console.error('Failed to update sermon:', err)
      throw err
    }
  }

  const removeSermon = async (id) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Authentication required')
      const res = await fetch(apiUrl(`/sermons/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${res.status}`)
      }
      saveState(sermons.filter(s => s.id !== id))
      return true
    } catch (err) {
      console.error('Failed to remove sermon:', err)
      throw err
    }
  }

  const getSermon = (id) => sermons.find(s => s.id === id)
  const getSermonBySlug = (s) => sermons.find(p => p.slug === s)
  const fetchSermonBySlug = async (slug) => {
    try {
      const res = await fetch(apiUrl(`/sermons/${slug}`))
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      const mapped = fromServer(data)
      const next = (() => {
        const idx = sermons.findIndex(p => p.slug === slug)
        if (idx === -1) return [mapped, ...sermons]
        const copy = sermons.slice(); copy[idx] = mapped; return copy
      })()
      saveState(next)
      return mapped
    } catch { return null }
  }

  return {
    sermons,
    loading,
    error,
    addSermon,
    updateSermon,
    removeSermon,
    getSermon,
    getSermonBySlug,
    fetchSermonBySlug,
    slugify,
    ensureUniqueSlug,
    refetch: loadSermons,
  }
}
import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

// Server-backed gallery
// item: { id, url, event: string, date: 'YYYY-MM-DD' | '', uploadedAt: string }
export function useGallery() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = (() => { try { return localStorage.getItem('auth_token') } catch { return null } })()

  const fetchGroups = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl('/gallery/groups'))
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  const addItem = async ({ url, event = '', date = '' }) => {
    try {
      let res = await fetch(apiUrl('/gallery/groups/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ url, title: event || '', date })
      })
      if (!res.ok) {
        // Fallback for older server: use legacy /gallery/items which mirrors to groups
        if (res.status === 404 || res.status === 405) {
          res = await fetch(apiUrl('/gallery/items'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ url, event: event || '', date })
          })
        }
      }
      if (!res.ok) throw new Error('Create failed')
      await fetchGroups()
    } catch (e) {
      console.error(e)
    }
  }

  const removeItem = async (id) => {
    try {
      // id is synthetic: `${title}||${url}`
      const [title, url] = id.split('||')
      const res = await fetch(apiUrl('/gallery/groups/items'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title, url })
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchGroups()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteGroup = async (title) => {
    try {
      const res = await fetch(apiUrl(`/gallery/groups/${encodeURIComponent(title)}`), {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (!res.ok) throw new Error('Delete group failed')
      await fetchGroups()
    } catch (e) {
      console.error(e)
    }
  }

  const save = async (updater) => {
    // For bulk delete via AdminGallery (synthetic ids)
    const prev = itemsFromGroups(groups)
    const next = typeof updater === 'function' ? updater(prev) : updater
    const prevIds = new Set(prev.map(i => i.id))
    const nextIds = new Set(next.map(i => i.id))
    const removed = [...prevIds].filter(id => !nextIds.has(id))
    for (const id of removed) { await removeItem(id) }
    await fetchGroups()
  }

  const updateItem = async (_id, _patch) => { /* Not implemented (no per-item fields to patch now) */ }

  const renameEvent = async (oldName, newName) => {
    try {
      const res = await fetch(apiUrl('/gallery/events/rename'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ oldName, newName })
      })
      if (!res.ok) throw new Error('Rename failed')
      await fetchGroups()
    } catch (e) {
      console.error(e)
    }
  }

  const setGroupDate = async (title, date) => {
    try {
      const res = await fetch(apiUrl('/gallery/events/set-date'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ event: title, date })
      })
      if (!res.ok) throw new Error('Set date failed')
      await fetchGroups()
    } catch (e) {
      console.error(e)
    }
  }

  const items = useMemo(() => itemsFromGroups(groups), [groups])
  const sorted = useMemo(() => {
    const ts = (it) => {
      if (it.date) {
        const t = Date.parse(it.date)
        if (Number.isFinite(t)) return t
      }
      return it.uploadedAt ? Date.parse(it.uploadedAt) : 0
    }
    return [...items].sort((a, b) => ts(b) - ts(a))
  }, [items])

  // Back-compat: no eventsMeta on server; keep an empty object
  const eventsMeta = {}
  const setEventMeta = () => {}

  return { items, groups, sorted, addItem, removeItem, deleteGroup, updateItem, save, renameEvent, setGroupDate, eventsMeta, loading, error }
}

function itemsFromGroups(groups) {
  const out = []
  for (const g of (groups||[])) {
    for (const p of (g.photos||[])) {
      out.push({
        id: `${g.title}||${p.url}`,
        url: p.url,
        event: g.title,
        date: p.date || '',
        uploadedAt: p.uploadedAt || null,
      })
    }
  }
  return out
}

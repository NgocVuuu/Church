import { useEffect, useMemo, useState } from 'react'

const KEY = 'parish_gallery_v1'

// item: { id, url, event: string, date: 'YYYY-MM-DD' | '', uploadedAt: number }
export function useGallery() {
  const [items, setItems] = useState([])
  const [eventsMeta, setEventsMeta] = useState({}) // { [eventName]: { date: 'YYYY-MM-DD', coverUrl: string } }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const data = JSON.parse(raw)
        let loadedItems = []
        let loadedMeta = {}
        if (Array.isArray(data)) {
          loadedItems = data
        } else if (data && typeof data === 'object') {
          loadedItems = Array.isArray(data.items) ? data.items : []
          loadedMeta = data.eventsMeta && typeof data.eventsMeta === 'object' ? data.eventsMeta : {}
        }
        let changed = false
        loadedItems = loadedItems.map((it, i) => {
          const next = { ...it }
          if (typeof next.uploadedAt !== 'number') { next.uploadedAt = Date.now() - i; changed = true }
          // legacy isCover is ignored in favor of eventsMeta.coverUrl
          return next
        })
        if (changed || !Array.isArray(data)) {
          try { localStorage.setItem(KEY, JSON.stringify({ items: loadedItems, eventsMeta: loadedMeta })) } catch {}
        }
        setItems(loadedItems)
        setEventsMeta(loadedMeta)
      }
    } catch {}
  }, [])

  const persist = (nextItems, nextMeta) => {
    try { localStorage.setItem(KEY, JSON.stringify({ items: nextItems, eventsMeta: nextMeta })) } catch {}
  }

  const save = (updater) => {
    setItems(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, eventsMeta)
      return next
    })
  }

  const saveMeta = (updater) => {
    setEventsMeta(prev => {
      const nextMeta = typeof updater === 'function' ? updater(prev) : updater
      persist(items, nextMeta)
      return nextMeta
    })
  }

  const addItem = ({ url, event = '', date = '' }) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    const uploadedAt = Date.now()
    save(prev => [{ id, url, event, date, uploadedAt }, ...prev])
  }

  const removeItem = (id) => save(prev => prev.filter(i => i.id !== id))

  const updateItem = (id, patch) => save(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

  const sorted = useMemo(() => {
    const ts = (it) => {
      if (it.date) {
        const t = Date.parse(it.date)
        if (Number.isFinite(t)) return t
      }
      return it.uploadedAt || 0
    }
    return [...items].sort((a, b) => ts(b) - ts(a))
  }, [items])

  const setEventMeta = (eventName, patch) => {
    const key = (eventName || '').trim() || 'Sự kiện'
    saveMeta(prev => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }))
  }

  const renameEvent = (oldName, newName) => {
    const src = (oldName || '').trim() || 'Sự kiện'
    const dst = (newName || '').trim() || 'Sự kiện'
    if (src === dst) return
    // move meta key
    saveMeta(prev => {
      const next = { ...prev }
      if (next[src]) {
        next[dst] = { ...(next[dst] || {}), ...next[src] }
        delete next[src]
      }
      return next
    })
    // update items' event name
    save(prev => prev.map(i => ((i.event || '').trim() || 'Sự kiện') === src ? { ...i, event: dst } : i))
  }

  return { items, eventsMeta, sorted, addItem, removeItem, updateItem, save, setEventMeta, renameEvent }
}

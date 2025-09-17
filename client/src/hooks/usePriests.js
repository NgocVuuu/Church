import { useEffect, useState } from 'react'

const KEY = 'parish_priests_v1'

// Defaults can be empty; keep structure documented
const defaults = []

export function usePriests() {
  const [priests, setPriests] = useState(defaults)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const loaded = JSON.parse(raw)
        if (Array.isArray(loaded)) setPriests(loaded)
      }
    } catch {}
  }, [])

  const savePriests = (next) => {
    setPriests(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }

  const addPriest = (p) => {
    const id = Date.now().toString()
    const item = { id, name: '', role: '', email: '', phone: '', avatar: '', ...p }
    savePriests([item, ...priests])
  }

  const updatePriest = (id, patch) => {
    savePriests(priests.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  const removePriest = (id) => {
    savePriests(priests.filter(p => p.id !== id))
  }

  const clearAllPriests = () => savePriests([])

  return { priests, addPriest, updatePriest, removePriest, clearAllPriests, savePriests }
}

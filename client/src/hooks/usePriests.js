import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

const KEY = 'parish_priests_v1'

const normalizeServer = (doc) => ({
  id: doc._id || doc.id,
  name: doc.name || '',
  role: doc.role || '',
  email: doc.email || '',
  phone: doc.phone || '',
  avatar: doc.avatar || '',
  order: typeof doc.order === 'number' ? doc.order : 0,
})

export function usePriests() {
  const [priests, setPriests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getToken = () => { try { return localStorage.getItem('auth_token') } catch { return null } }

  const persist = (arr) => { setPriests(arr); try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {} }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl('/priests'))
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      const mapped = Array.isArray(data) ? data.map(normalizeServer) : []
      persist(mapped)
    } catch (e) {
      setError(e.message)
      try { const raw = localStorage.getItem(KEY); if (raw) persist(JSON.parse(raw)) } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addPriest = async (p) => {
    try {
      const token = getToken()
      if (!token) throw new Error('Cần đăng nhập')
      const res = await fetch(apiUrl('/priests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(p)
      })
      if (!res.ok) throw new Error('Tạo thất bại')
      const data = await res.json()
      const mapped = normalizeServer(data)
      persist([mapped, ...priests])
    } catch (e) {
      // local fallback
      const id = Date.now().toString()
      const item = { id, name: '', role: '', email: '', phone: '', avatar: '', ...p }
      persist([item, ...priests])
    }
  }

  const updatePriest = async (id, patch) => {
    try {
      const token = getToken()
      if (!token) throw new Error('Cần đăng nhập')
      await fetch(apiUrl(`/priests/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(patch)
      })
    } catch {}
    persist(priests.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  const removePriest = async (id) => {
    try {
      const token = getToken()
      if (!token) throw new Error('Cần đăng nhập')
      await fetch(apiUrl(`/priests/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    } catch {}
    persist(priests.filter(p => p.id !== id))
  }

  const clearAllPriests = () => persist([])

  return { priests, loading, error, addPriest, updatePriest, removePriest, clearAllPriests, savePriests: persist, refetch: load }
}

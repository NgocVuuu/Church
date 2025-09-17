import { createContext, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const remove = (id) => setList((l) => l.filter((t) => t.id !== id))
  const push = (t) => {
    const id = Date.now() + Math.random()
    const item = { id, ...t }
    setList((l) => [...l, item])
    setTimeout(() => remove(id), t.duration ?? 3000)
  }
  const api = useMemo(() => ({
    success: (msg, opts={}) => push({ type: 'success', msg, ...opts }),
    error: (msg, opts={}) => push({ type: 'error', msg, ...opts }),
    info: (msg, opts={}) => push({ type: 'info', msg, ...opts }),
  }), [])
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed z-[100] top-4 right-4 space-y-2">
        {list.map(t => (
          <div key={t.id} className={`min-w-[240px] max-w-xs px-4 py-3 rounded shadow text-sm text-white animate-slideIn ${
            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : 'bg-neutral-800'
          }`}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-6px)} to { opacity: 1; transform: translateY(0)} }
        .animate-slideIn { animation: slideIn .18s ease-out }
      `}</style>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

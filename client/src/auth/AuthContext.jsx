import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/apiBase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null) // { role: 'admin' }

  useEffect(() => {
    const t = localStorage.getItem('auth_token')
    const u = localStorage.getItem('auth_user')
    if (t && u) {
      setToken(t)
      try { setUser(JSON.parse(u)) } catch {}
    }
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.token) {
        return { ok: false, error: data?.error || 'Sai tài khoản hoặc mật khẩu' }
      }
      const t = data.token
      const u = data.user || { email, role: 'admin' }
      localStorage.setItem('auth_token', t)
      localStorage.setItem('auth_user', JSON.stringify(u))
      setToken(t)
      setUser(u)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Không thể kết nối máy chủ' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, isAdmin: user?.role === 'admin', login, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

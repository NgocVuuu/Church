import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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
    // Placeholder: accept a hardcoded admin until backend is wired
    if (email === 'admin@parish.vn' && password === 'admin123') {
      const t = 'demo-token'
      const u = { email, role: 'admin' }
      localStorage.setItem('auth_token', t)
      localStorage.setItem('auth_user', JSON.stringify(u))
      setToken(t)
      setUser(u)
      return { ok: true }
    }
    return { ok: false, error: 'Sai tài khoản hoặc mật khẩu' }
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

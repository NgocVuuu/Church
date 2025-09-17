import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import { useAuth } from '../auth/AuthContext'

export default function AdminLogin() {
  const { login, isAdmin } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const r = await login(email, password)
    if (r.ok) nav('/quan-tri')
    else setError(r.error || 'Đăng nhập thất bại')
  }

  useEffect(() => {
    if (isAdmin) nav('/quan-tri', { replace: true })
  }, [isAdmin])

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <PageBanner title="Đăng nhập quản trị" />
      <div className="max-w-md mx-auto px-6 py-10">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email quản trị" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Mật khẩu" className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="w-full rounded-full bg-primary text-white px-8 py-3">Đăng nhập</button>
        </form>
      </div>
      <Footer />
    </div>
  )
}

import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/quan-tri/dang-nhap" replace />
  return children
}

export default function AdminLayout() {
  const { logout, user } = useAuth()
  const linkCls = ({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-neutral-200' : 'hover:bg-neutral-100'}`
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="h-4" />
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 border rounded-lg p-4 h-fit">
          <div className="font-display text-xl mb-3">Quản trị</div>
          <div className="text-xs text-neutral-600 mb-3">{user?.email}</div>
          <nav className="space-y-1 text-sm">
            <NavLink to="." end className={linkCls}>Tổng quan</NavLink>
            <NavLink to="home" className={linkCls}>Trang Home</NavLink>
            <NavLink to="bai-viet" className={linkCls}>Bài viết</NavLink>
            <NavLink to="bai-giang" className={linkCls}>Bài giảng</NavLink>
            <NavLink to="muc-tu" className={linkCls}>Mục tử</NavLink>
            <NavLink to="gioi-thieu" className={linkCls}>Giới thiệu</NavLink>
            <NavLink to="thu-vien-anh" className={linkCls}>Thư viện ảnh</NavLink>
            <NavLink to="lien-he" className={linkCls}>Liên hệ</NavLink>
          </nav>
          <div className="mt-4">
            <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
          </div>
        </aside>
        <main className="md:col-span-3">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

import { Link, NavLink, useLocation } from 'react-router-dom'
import CrossIcon from './icons/CrossIcon'
import { useEffect, useState } from 'react'
import { useLoading } from '../contexts/LoadingContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isLoading } = useLoading()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = location.pathname === '/'
  const effectiveScrolled = scrolled || !isHome
  const [open, setOpen] = useState(false)

  const linkCls = (active) =>
    `uppercase tracking-widest text-xs transition-colors ${
      effectiveScrolled ? (active ? 'text-primary' : 'text-neutral-700 hover:text-primary')
                        : (active ? 'text-primary' : 'text-white/90 hover:text-primary')
    }`

  // Lock scroll when menu open and close on route change
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => { document.documentElement.style.overflow = '' }
  }, [open])
  useEffect(() => { setOpen(false) }, [location.pathname, location.search])

  return (
    <header className={`${effectiveScrolled ? 'sticky top-0 bg-white/95 shadow-sm border-b border-neutral-100' : 'absolute'} top-0 inset-x-0 z-20 backdrop-blur ${!effectiveScrolled ? 'bg-black/30 md:bg-transparent' : ''}` }>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className={`text-primary`}>
            <CrossIcon className="w-7 h-7" />
          </span>
          <span className={`font-script text-3xl transition-colors ${effectiveScrolled ? 'text-neutral-800' : 'text-white'} group-hover:text-primary`}>Gx.Đông Vinh</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-5">
          <NavLink to="/" className={({isActive}) => linkCls(isActive)}>Trang chủ</NavLink>
          <NavLink to="/gioi-thieu" className={({isActive}) => linkCls(isActive)}>Giới thiệu</NavLink>
          <NavLink to="/bai-giang" className={({isActive}) => linkCls(isActive)}>Bài giảng</NavLink>
          <NavLink to="/bai-viet" className={({isActive}) => linkCls(isActive)}>Blog</NavLink>
          <NavLink to="/muc-tu" className={({isActive}) => linkCls(isActive)}>Mục tử</NavLink>
          <NavLink to="/lien-he" className={({isActive}) => linkCls(isActive)}>Liên hệ</NavLink>
          <NavLink to="/quan-tri" className={({isActive}) => linkCls(isActive)}>Quản trị</NavLink>
        </nav>
        {/* Mobile hamburger */}
        <button
          aria-label="Mở menu"
          className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded ${effectiveScrolled ? 'text-neutral-800 hover:bg-neutral-100' : 'text-white hover:bg-white/10'} transition`}
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-script text-2xl text-neutral-800">Gx.Đông Vinh</span>
              <button aria-label="Đóng" className="w-9 h-9 rounded hover:bg-neutral-100" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav className="mt-6 grid gap-3">
              <NavLink to="/" className={({isActive}) => `${linkCls(isActive)} py-3`}>Trang chủ</NavLink>
              <NavLink to="/gioi-thieu" className={({isActive}) => `${linkCls(isActive)} py-3`}>Giới thiệu</NavLink>
              <NavLink to="/bai-giang" className={({isActive}) => `${linkCls(isActive)} py-3`}>Bài giảng</NavLink>
              <NavLink to="/bai-viet" className={({isActive}) => `${linkCls(isActive)} py-3`}>Blog</NavLink>
              <NavLink to="/muc-tu" className={({isActive}) => `${linkCls(isActive)} py-3`}>Mục tử</NavLink>
              <NavLink to="/lien-he" className={({isActive}) => `${linkCls(isActive)} py-3`}>Liên hệ</NavLink>
              <NavLink to="/quan-tri" className={({isActive}) => `${linkCls(isActive)} py-3`}>Quản trị</NavLink>
            </nav>
            <div className="mt-auto pt-4 text-xs text-neutral-500">© {new Date().getFullYear()} Gx. Đông Vinh</div>
          </div>
        </div>
      )}
    </header>
  )
}

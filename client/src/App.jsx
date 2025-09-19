import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import About from './pages/About'
import Blog from './pages/Blog'
import Sermons from './pages/Sermons'
import Pastors from './pages/Pastors'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminLayout, { RequireAdmin } from './pages/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminPosts from './pages/admin/AdminPosts'
import AdminSermons from './pages/admin/AdminSermons'
import AdminPriests from './pages/admin/AdminPriests'
import AdminAbout from './pages/admin/AdminAbout'
import AdminHome from './pages/admin/AdminHome'
import { AuthProvider } from './auth/AuthContext'
import PostDetail from './pages/PostDetail'
import SermonDetail from './pages/SermonDetail'
import { ToastProvider } from './components/Toast'
import Gallery from './pages/Gallery'
import AdminGallery from './pages/admin/AdminGallery'
import AdminContact from './pages/admin/AdminContact'
import EventsPage from './pages/Events'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gioi-thieu" element={<About />} />
        <Route path="/bai-viet" element={<Blog />} />
  <Route path="/bai-viet/:slug" element={<PostDetail />} />
        <Route path="/bai-giang" element={<Sermons />} />
  <Route path="/bai-giang/:id" element={<SermonDetail />} />
        <Route path="/muc-tu" element={<Pastors />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/thu-vien-anh" element={<Gallery />} />
  <Route path="/su-kien" element={<EventsPage />} />
        <Route path="/quan-tri/dang-nhap" element={<AdminLogin />} />
        <Route path="/quan-tri" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="bai-viet" element={<AdminPosts />} />
          <Route path="bai-giang" element={<AdminSermons />} />
          <Route path="muc-tu" element={<AdminPriests />} />
          <Route path="gioi-thieu" element={<AdminAbout />} />
          <Route path="thu-vien-anh" element={<AdminGallery />} />
          <Route path="lien-he" element={<AdminContact />} />
        </Route>
      </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

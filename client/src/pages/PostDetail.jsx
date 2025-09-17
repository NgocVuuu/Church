import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import SidebarLatest from '../components/SidebarLatest'
import { useParams } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import { useSermons } from '../hooks/useSermons'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import Reveal from '../components/Reveal'

export default function PostDetail() {
  const { slug } = useParams()
  const { posts, getPostBySlug } = usePosts()
  const { sermons } = useSermons()
  const post = getPostBySlug(slug) || posts[0]
  const { isSpeaking, isPaused, speakSmart, pause, resume, stop } = useTextToSpeech()

  const handleSpeak = () => speakSmart(`${post.title}. ${post.content}`)

  const renderContent = (text = '') => {
    const renderInline = (s='') => {
      const parts = s.split(/(\*\*[^*]+\*\*)/g)
      return parts.map((part, idx) => {
        const m = /^\*\*([^*]+)\*\*$/.exec(part)
        if (m) return <strong key={idx}>{m[1]}</strong>
        return <span key={idx}>{part}</span>
      })
    }
    return (text || '')
      .toString()
      .split(/\n{2,}/)
      .map((para, i) => (
        <p key={i} className="whitespace-pre-line mb-4">{renderInline(para)}</p>
      ))
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
  <PageBanner pageKey="blog" title={post?.title || 'Bài viết'} subtitle="Chi tiết bài viết" vAlign="bottom" />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-3 gap-10">
        <main className="lg:col-span-2">
          <Reveal>
            {post?.image ? <img src={post.image} alt={post.title} className="w-full h-72 object-cover rounded" loading="lazy"/> : null}
          </Reveal>
          <Reveal delay={80}>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500">{post?.date} • {post?.author}</div>
            <h1 className="font-display text-3xl mt-2">{post?.title}</h1>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSpeak}
                disabled={isSpeaking && !isPaused}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm transition ${isSpeaking && !isPaused ? 'opacity-60 cursor-not-allowed bg-primary text-black' : 'bg-primary text-black hover:brightness-110 active:translate-y-px'}`}
              >
                <span>►</span>
                <span>Phát giọng đọc</span>
              </button>
              {!isPaused ? (
                <button onClick={pause} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition">
                  <span>⏸</span>
                  <span>Tạm dừng</span>
                </button>
              ) : (
                <button onClick={resume} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition">
                  <span>▶</span>
                  <span>Tiếp tục</span>
                </button>
              )}
              <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition">
                <span>⏹</span>
                <span>Dừng</span>
              </button>
            </div>
            <div className="mt-4 leading-relaxed text-[1.05rem] [text-align:justify] [hyphens:auto]">
              {renderContent(post?.content)}
            </div>
          </div>
          </Reveal>
        </main>
        <div>
          <SidebarLatest posts={posts} sermons={sermons} />
        </div>
      </div>
      <Footer />
    </div>
  )
}

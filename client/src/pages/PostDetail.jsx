import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import SidebarLatest from '../components/SidebarLatest'
import { useParams } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import { useSermons } from '../hooks/useSermons'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import Reveal from '../components/Reveal'
import { useEffect, useMemo, useRef } from 'react'
import { dlog } from '../lib/debug'

export default function PostDetail() {
  const { slug } = useParams()
  const { posts, getPostBySlug, fetchPostBySlug } = usePosts()
  const { sermons } = useSermons()
  const post = getPostBySlug(slug) || posts[0]
  const { isSpeaking, isPaused, speak, speakSmart, pause, resume, stop, forceStop, voices, preferredVoiceKey, voiceKey } = useTextToSpeech()

  // Dừng đọc khi unmount hoặc đổi bài (slug)
  const cleanupGuardRef = useRef(false)
  // Keep latest stop function in a ref, but don't retrigger effect on each render
  const stopRef = useRef(forceStop)
  useEffect(() => { stopRef.current = forceStop }, [forceStop])
  useEffect(() => {
    if (slug) fetchPostBySlug(slug)
    return () => {
      if (import.meta.env.DEV && !cleanupGuardRef.current) {
        cleanupGuardRef.current = true
        return
      }
      try { stopRef.current?.() } catch {}
    }
  }, [slug])

  // Chuẩn hóa text (chỉ đọc nội dung đến từ DB, không lấy từ DOM)
  function getReadableText(title = '', content = '') {
    const combine = [title, content].filter(Boolean).join('. ')
    if (!combine) return ''
    // Remove HTML tags
    let s = combine.replace(/<[^>]+>/g, ' ')
    // Basic HTML entity decoding
    s = s
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
    // Strip common Markdown markers
    s = s
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*#{1,6}\s*/gm, '')
    // Remove URLs
    s = s.replace(/https?:\/\/\S+/g, '')
    // Collapse whitespace
    s = s.replace(/\s+/g, ' ').trim()
    return s
  }

  const cleanedText = useMemo(() => getReadableText(post?.title, post?.content), [post?.title, post?.content])
  const handleSpeak = () => {
    const rawTitle = post?.title || ''
    const rawContent = post?.content || ''
    const supports = {
      hasSynth: typeof window !== 'undefined' && !!window.speechSynthesis,
      hasUtter: typeof window !== 'undefined' && 'SpeechSynthesisUtterance' in window,
    }
    const engine = supports.hasSynth
      ? { speaking: window.speechSynthesis.speaking, paused: window.speechSynthesis.paused, pending: window.speechSynthesis.pending }
      : {}
    const preview = (cleanedText || '').slice(0, 120)
    const titlePreview = rawTitle.slice(0, 120)
    const contentPreview = rawContent.slice(0, 120)
  // Unconditional log for visibility
  // eslint-disable-next-line no-console
    console.log('[post] Speak clicked', {
      slug,
      rawTitleLen: rawTitle.length,
      rawContentLen: rawContent.length,
      titlePreview,
      contentPreview,
      sanitizedLen: (cleanedText||'').length,
      sanitizedPreview: preview,
      hasContent: !!cleanedText,
      supports,
      engine,
    })
  dlog('post', 'Speak clicked', { slug, len: (cleanedText||'').length, hasContent: !!cleanedText, supports, engine, preview })
    try {
      if (cleanedText) {
        // Prefer chunked reading with explicit Vietnamese voice
        // Pass preferred voice if any
        const preferred = (voices || []).find(v => voiceKey(v) === preferredVoiceKey)
        speakSmart(cleanedText, { lang: 'vi-VN', pauseMs: 450, voice: preferred })
      }
      else dlog('post', 'No cleanedText → button should be disabled')
    } catch (e) {
      dlog('post', 'speak() threw', e)
    }
  }

  // Chỉ bật nút đọc khi có văn bản sạch từ DB
  const canRead = !!cleanedText
  useEffect(() => {
    dlog('post', 'Detail mounted', { slug, canRead, len: (cleanedText||'').length })
    return () => { dlog('post', 'Detail cleanup', { guard: cleanupGuardRef.current }) }
  }, [slug, canRead, cleanedText])

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
  <PageBanner
    pageKey="blog"
    title={post?.title || 'Bài viết'}
    subtitle="Chi tiết bài viết"
    vAlign="bottom"
    height="h-64 md:h-72 lg:h-80"
    padding="pt-28 pb-10 md:py-12"
    titleClassName="text-lg sm:text-xl md:text-4xl tracking-wider leading-snug"
  />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-3 gap-10 mt-2 md:mt-0">
        <main className="lg:col-span-2">
          <Reveal>
            {post?.image ? <img src={post.image} alt={post.title} className="w-full h-72 object-cover rounded" loading="lazy"/> : null}
          </Reveal>
          <Reveal delay={80}>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500">{post?.date} • {post?.author} {typeof post?.views === 'number' ? `• ${post?.views} lượt đọc` : ''}</div>
            <h1 className="font-display text-2xl md:text-3xl mt-2 uppercase tracking-wider leading-relaxed [text-align:justify]">{post?.title}</h1>
            {/* TTS controls dưới tiêu đề */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {!isSpeaking ? (
                <button
                  onClick={handleSpeak}
                  disabled={!canRead}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm transition bg-primary text-black hover:brightness-110 active:translate-y-px disabled:opacity-50"
                >
                  <span>🔊</span>
                  <span>Đọc bài viết</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button 
                      onClick={resume} 
                       className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]"
                    >
                      <span>▶</span>
                      <span>Tiếp tục</span>
                    </button>
                  ) : (
                    <button 
                      onClick={pause} 
                       className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]"
                    >
                      <span>⏸</span>
                      <span>Tạm dừng</span>
                    </button>
                  )}
                  <button 
                    onClick={stop} 
                     className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]"
                  >
                    <span>⏹</span>
                    <span>Dừng</span>
                  </button>
                </>
              )}
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

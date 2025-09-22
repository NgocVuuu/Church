import Navbar from '../components/Navbar'
import PageBanner from '../components/PageBanner'
import Footer from '../components/Footer'
import SidebarLatest from '../components/SidebarLatest'
import { useParams } from 'react-router-dom'
import { useSermons } from '../hooks/useSermons'
import { usePosts } from '../hooks/usePosts'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import Reveal from '../components/Reveal'
import { useEffect, useMemo, useRef } from 'react'
import { dlog } from '../lib/debug'
import TtsQuickVoice from '../components/TtsQuickVoice'

export default function SermonDetail() {
  const { id } = useParams()
  const { sermons, getSermonBySlug, fetchSermonBySlug } = useSermons()
  const { posts } = usePosts()
  const sermon = getSermonBySlug(id) || sermons.find(s => s.id === id) || sermons[0]
  const { isSpeaking, isPaused, speak, speakSmart, pause, resume, stop, forceStop, voices, preferredVoiceKey, setPreferredVoiceKey, voiceKey } = useTextToSpeech()

  // Dừng đọc khi unmount hoặc đổi bài giảng (id)
  const cleanupGuardRef = useRef(false)
  const stopRef = useRef(forceStop)
  useEffect(() => { stopRef.current = forceStop }, [forceStop])
  useEffect(() => {
    if (id) fetchSermonBySlug(id)
    return () => {
      if (import.meta.env.DEV && !cleanupGuardRef.current) {
        cleanupGuardRef.current = true
        return
      }
      try { stopRef.current?.() } catch {}
    }
  }, [id])

  // Chuẩn hóa text (chỉ đọc nội dung đến từ DB, không lấy từ DOM)
  function getReadableText(title = '', content = '') {
    const combine = [title, content].filter(Boolean).join('. ')
    if (!combine) return ''
    let s = combine.replace(/<[^>]+>/g, ' ')
    s = s
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
    s = s
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*#{1,6}\s*/gm, '')
    s = s.replace(/https?:\/\/\S+/g, '')
    s = s.replace(/\s+/g, ' ').trim()
    return s
  }

  const cleanedText = useMemo(() => getReadableText(sermon?.title, sermon?.content), [sermon?.title, sermon?.content])
  const cleanedTitle = useMemo(() => getReadableText(sermon?.title || '', ''), [sermon?.title])
  const cleanedContent = useMemo(() => getReadableText('', sermon?.content || ''), [sermon?.content])
  const handleSpeak = () => {
    const rawTitle = sermon?.title || ''
    const rawContent = sermon?.content || ''
    const rawContentFirst2000 = rawContent.slice(0, 2000)
    const supports = {
      hasSynth: typeof window !== 'undefined' && !!window.speechSynthesis,
      hasUtter: typeof window !== 'undefined' && 'SpeechSynthesisUtterance' in window,
    }
    const engine = supports.hasSynth
      ? { speaking: window.speechSynthesis.speaking, paused: window.speechSynthesis.paused, pending: window.speechSynthesis.pending }
      : {}
    const preview = (cleanedText || '').slice(0, 200)
    const titlePreview = rawTitle.slice(0, 120)
    const contentPreview = rawContent.slice(0, 120)
    const cleanedTitlePreview = (cleanedTitle || '').slice(0, 200)
    const cleanedContentPreview = (cleanedContent || '').slice(0, 200)
    // Unconditional console for quick visibility
    // eslint-disable-next-line no-console
    console.log('[sermon] Speak clicked', {
      slug: id,
      rawTitleLen: rawTitle.length,
      rawContentLen: rawContent.length,
      rawTitle,
      rawContentFirst2000,
      titlePreview,
      contentPreview,
      sanitizedLen: (cleanedText||'').length,
      sanitizedPreview: preview,
      cleanedTitlePreview,
      cleanedContentPreview,
      hasContent: !!cleanedText,
      supports,
      engine,
    })
    dlog('sermon', 'Speak clicked', { slug: id, len: (cleanedText||'').length, hasContent: !!cleanedText })
    try {
      // Đọc tiêu đề trước, rồi nội dung – tách đoạn để speakSmart tạo ranh giới chunk
      const joined = [cleanedTitle, cleanedContent].filter(Boolean).join('\n\n')
      if (joined) {
        const preferred = (voices || []).find(v => voiceKey(v) === preferredVoiceKey)
        // dùng speakSmart để xử lý chunk và fallback tốt hơn (buộc giọng tiếng Việt)
  speakSmart(joined, { lang: 'vi-VN', pauseMs: 250, rate: 1.05, voice: preferred })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[sermon] speak() threw', e)
    }
  }

  // Chỉ bật nút đọc khi có văn bản sạch từ DB
  const canRead = !!cleanedText
  useEffect(() => {
    dlog('sermon', 'Detail mounted', { slug: id, canRead, len: (cleanedText||'').length })
    return () => {
      dlog('sermon', 'Detail cleanup', { guard: cleanupGuardRef.current })
    }
  }, [id, canRead, cleanedText])

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
    pageKey="sermons"
    title={sermon?.title || 'Bài giảng'}
    subtitle="Chi tiết bài giảng"
    vAlign="bottom"
    height="h-64 md:h-72 lg:h-80"
    padding="pt-28 pb-10 md:py-12"
    titleClassName="text-lg sm:text-xl md:text-4xl tracking-wider leading-snug"
  />
  <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-3 gap-10 mt-2 md:mt-0">
        <main className="lg:col-span-2">
          <Reveal>
            {sermon?.image ? <img src={sermon.image} alt={sermon.title} className="w-full h-72 object-cover rounded" loading="lazy"/> : null}
          </Reveal>
          <Reveal delay={80}>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500">{sermon?.date} • {sermon?.pastor} {typeof sermon?.views === 'number' ? `• ${sermon?.views} lượt đọc` : ''}</div>
            <h1 className="font-display text-2xl md:text-3xl mt-2 uppercase tracking-wider leading-relaxed [text-align:justify]">{sermon?.title}</h1>
            {/* TTS controls dưới tiêu đề */}
            <div className="mt-4 flex items-center gap-2 flex-wrap min-h-[44px]">
              {!isSpeaking ? (
                <button
                  onClick={handleSpeak}
                  disabled={!canRead}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm transition bg-primary text-black hover:brightness-110 active:translate-y-px disabled:opacity-50"
                >
                  <span>🔊</span>
                  <span>Đọc bài giảng</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button onClick={resume} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]">
                      <span>▶</span>
                      <span>Tiếp tục</span>
                    </button>
                  ) : (
                    <button onClick={pause} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]">
                      <span>⏸</span>
                      <span>Tạm dừng</span>
                    </button>
                  )}
                  <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-neutral-100 active:translate-y-px transition min-h-[44px]">
                    <span>⏹</span>
                    <span>Dừng</span>
                  </button>
                </>
              )}
            </div>
            <div className="mt-2">
              <TtsQuickVoice
                voices={voices}
                preferredVoiceKey={preferredVoiceKey}
                setPreferredVoiceKey={setPreferredVoiceKey}
                voiceKey={voiceKey}
              />
            </div>
            <div className="mt-4 leading-relaxed text-[1.05rem] [text-align:justify] [hyphens:auto]">
              {renderContent(sermon?.content)}
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

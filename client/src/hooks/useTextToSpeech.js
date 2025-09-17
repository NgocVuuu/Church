import { useEffect, useRef, useState } from 'react'

export function useTextToSpeech() {
  const synthRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const cancelledRef = useRef(false)
  const currentUtterRef = useRef(null)
  const nextTimerRef = useRef(null)

  // Load speech synthesis and available voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis || null
      const loadVoices = () => {
        try {
          const list = synthRef.current?.getVoices?.() || []
          setVoices(list)
        } catch {}
      }
      loadVoices()
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices
      }
    }
    return () => { if (synthRef.current) synthRef.current.cancel() }
  }, [])

  const pickVoice = (lang = 'vi-VN') => {
    if (!voices.length) return null
    const preferByName = (names = []) => names
      .map(n => voices.find(v => v.name?.toLowerCase().includes(n.toLowerCase())))
      .find(Boolean)

    // Prefer high-quality voices by name per language
    if (lang.toLowerCase().startsWith('vi')) {
      const preferred = preferByName([
        'Google tiếng việt', 'Google Vietnamese',
        'Microsoft HoaiMy', 'Microsoft HoiHan',
        'Vietnamese (Vietnam)'
      ])
      if (preferred) return preferred
    }
    if (lang.toLowerCase().startsWith('en')) {
      const preferred = preferByName([
        'Google US English', 'Google UK English',
        'Microsoft Aria', 'Microsoft Guy', 'Microsoft Jenny'
      ])
      if (preferred) return preferred
    }
    // exact match
    let v = voices.find(v => v.lang === lang)
    if (v) return v
    // prefix match (e.g., vi-*)
    const pre = lang.split('-')[0]
    v = voices.find(v => v.lang?.toLowerCase().startsWith(pre.toLowerCase()))
    if (v) return v
    // fallback English
    v = voices.find(v => v.lang?.toLowerCase().startsWith('en'))
    return v || voices[0]
  }

  const hasViChars = (s = '') => /[ăâêôơưđÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂÂĐÊÔƠƯàáâãèéêìíòóôõùúăâđêôơưỳýÀ-ỹ]/.test(s)
  const startsWithNumberedList = (s = '') => /^\s*\d+[\.)]\s+/.test(s)

  // Convert Roman numerals (up to a reasonable range) to Arabic numbers
  const romanToArabic = (roman = '') => {
    const map = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}
    let i=0, n=0
    const s = roman.toUpperCase()
    while (i < s.length) {
      if (i+1 < s.length && map[s.slice(i,i+2)]) { n += map[s.slice(i,i+2)]; i+=2 }
      else { n += map[s[i]] || 0; i+=1 }
    }
    return n || null
  }

  // Preprocess to improve pronunciation for VI and numbers
  const preprocessForLang = (lang = 'vi-VN', text = '') => {
  let out = text
    if (lang.toLowerCase().startsWith('vi')) {
      // Improve some Vietnamese church terms
      out = out.replace(/\bGiêsu\b/gi, 'Giê-su')
      out = out.replace(/\bGiê-su\b/gi, 'Giê-su')
      // thế kỉ/thế kỷ + Roman numerals → Arabic
      out = out.replace(/(thế\s*k[ỉịy])\s+([MDCLXVI]+)/gi, (m, g1, roman) => {
        const n = romanToArabic(roman)
        return n ? `${g1} ${n}` : m
      })
    }
    // If starts with numbered list like "1. ...", expand punctuation for VI clarity
    if (startsWithNumberedList(out)) {
      out = out.replace(/^(\s*)(\d+)([\.)])\s+/m, (m, sp, n) => `${sp}mục thứ ${n} `)
    }
    // Generic: standalone Roman numerals after space -> number (limited false positives)
    out = out.replace(/\b([MDCLXVI]{2,})\b/g, (m, r) => romanToArabic(r) || m)
    return out
  }

  // Simple polyglot reading: split into chunks, choose voice per chunk by detecting Vietnamese diacritics
  const speakSmart = (text, opts = {}) => {
    const synth = synthRef.current
    if (!synth || !text) return
    synth.cancel()
    cancelledRef.current = false
    if (nextTimerRef.current) { clearTimeout(nextTimerRef.current); nextTimerRef.current = null }
    const chunks = text
      .toString()
      .split(/\n{2,}|(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean)

    if (!chunks.length) return

    setIsSpeaking(true)
    setIsPaused(false)

    let index = 0
    const speakNext = () => {
      if (cancelledRef.current) { setIsSpeaking(false); setIsPaused(false); return }
      if (index >= chunks.length) {
        setIsSpeaking(false); setIsPaused(false); return
      }
      const chunk = chunks[index++]
  // Force Vietnamese if numbered-list-like to avoid English reading of "one, two"
  const lang = opts.lang || ((hasViChars(chunk) || startsWithNumberedList(chunk)) ? 'vi-VN' : 'en-US')
      const processed = preprocessForLang(lang, chunk)
      const utter = new SpeechSynthesisUtterance(processed)
      const voice = opts.voice || pickVoice(lang)
      if (voice) utter.voice = voice
      utter.lang = lang
      utter.rate = (opts.rate ?? 0.8)
      utter.pitch = (opts.pitch ?? 0.95)
      const pauseMs = opts.pauseMs ?? 300
      const scheduleNext = () => {
        if (cancelledRef.current) return
        if (nextTimerRef.current) { clearTimeout(nextTimerRef.current) }
        nextTimerRef.current = setTimeout(() => {
          nextTimerRef.current = null
          if (!cancelledRef.current) speakNext()
        }, pauseMs)
      }
      utter.onend = scheduleNext
      utter.onerror = scheduleNext
      currentUtterRef.current = utter
      synth.speak(utter)
    }
    speakNext()
  }

  // Simple single-utterance speak (backward compatible)
  const speak = (text, opts = {}) => {
    const synth = synthRef.current
    if (!synth || !text) return
    synth.cancel()
    cancelledRef.current = false
    const lang = opts.lang || 'vi-VN'
    const utter = new SpeechSynthesisUtterance(preprocessForLang(lang, text))
    const voice = opts.voice || pickVoice(opts.lang || 'vi-VN')
    if (voice) utter.voice = voice
    utter.lang = lang
    utter.rate = (opts.rate ?? 0.8)
    utter.pitch = (opts.pitch ?? 0.95)
    utter.onend = () => { setIsSpeaking(false); setIsPaused(false) }
    utter.onerror = () => { setIsSpeaking(false); setIsPaused(false) }
    currentUtterRef.current = utter
    setIsSpeaking(true)
    setIsPaused(false)
    synth.speak(utter)
  }

  const pause = () => { const s = synthRef.current; if (s && s.speaking && !s.paused) { s.pause(); setIsPaused(true) } }
  const resume = () => { const s = synthRef.current; if (s && s.paused) { s.resume(); setIsPaused(false) } }
  const stop = () => {
    const s = synthRef.current
    cancelledRef.current = true
    if (s) {
      try {
        s.cancel()
      } finally {
        // Best-effort to clear current utter handlers
        if (currentUtterRef.current) {
          currentUtterRef.current.onend = null
          currentUtterRef.current.onerror = null
        }
        if (nextTimerRef.current) { clearTimeout(nextTimerRef.current); nextTimerRef.current = null }
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }
  }

  return { isSpeaking, isPaused, speak, speakSmart, pause, resume, stop, voices }
}

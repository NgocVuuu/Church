import { useEffect, useRef, useState } from 'react'
import { dlog, debugOn } from '../lib/debug'

const devLog = (...args) => {
  try { if (import.meta?.env?.DEV) console.log('[tts]', ...args) } catch {}
}

export function useTextToSpeech() {
  const synthRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const cancelledRef = useRef(false)
  const currentUtterRef = useRef(null)
  const nextTimerRef = useRef(null)
  const primeTriedRef = useRef(false)
  const voiceTriesRef = useRef(0)
  const readStartTimeRef = useRef(null)

  // Load speech synthesis and available voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[tts] hook mounted')
      synthRef.current = window.speechSynthesis || null
      const loadVoices = () => {
        try {
          const list = synthRef.current?.getVoices?.() || []
          setVoices(list)
          dlog('tts', 'voices loaded', { count: list.length, tries: voiceTriesRef.current })
          devLog('voices loaded', { count: list.length, tries: voiceTriesRef.current })
          // Retry a few times if voices haven't populated yet (Chrome loads async)
          if (list.length === 0 && voiceTriesRef.current < 20) {
            voiceTriesRef.current += 1
            setTimeout(loadVoices, 250)
          }
        } catch {}
      }
      loadVoices()
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = () => {
          dlog('tts', 'onvoiceschanged fired')
          devLog('onvoiceschanged fired')
          loadVoices()
        }
      }
    }
    return () => {
      // Comprehensive cleanup on unmount
      if (synthRef.current) {
        try { dlog('tts', 'cleanup: cancel synthesis'); synthRef.current.cancel() } catch {}
      }
      if (nextTimerRef.current) { clearTimeout(nextTimerRef.current); nextTimerRef.current = null }
      if (currentUtterRef.current) {
        try { currentUtterRef.current.onend = null; currentUtterRef.current.onerror = null } catch {}
        currentUtterRef.current = null
      }
      setIsSpeaking(false)
      setIsPaused(false)
    }
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
    const chosen = v || voices[0]
    if (chosen) { dlog('tts', 'pickVoice ->', { requestLang: lang, chosen: { name: chosen.name, lang: chosen.lang } }); devLog('pickVoice', { requestLang: lang, name: chosen.name, lang: chosen.lang }) }
    return chosen
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
    let didCancel = false
    try {
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel()
        didCancel = true
        devLog('synth.cancel() before speakSmart (conditional)')
        dlog('tts', 'synth.cancel() before speakSmart (conditional)')
      }
    } catch {}
    cancelledRef.current = false
    primeTriedRef.current = false
    readStartTimeRef.current = null
    if (nextTimerRef.current) { clearTimeout(nextTimerRef.current); nextTimerRef.current = null }
    const chunks = text
      .toString()
      .split(/\n{2,}|(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean)

    if (!chunks.length) return

    // Mark speaking only after the first onstart to avoid UI flashing when audio is blocked
    let started = false
  dlog('tts', 'speakSmart start', { chunks: chunks.length, totalLen: text.length })
  devLog('speakSmart start', { chunks: chunks.length, totalLen: text.length })
  try { console.log('[tts] speakSmart invoked') } catch {}

    let index = 0
    const speakNext = () => {
      if (cancelledRef.current) { setIsSpeaking(false); setIsPaused(false); return }
      if (index >= chunks.length) {
        // Finished all chunks; if it ended too quickly, try a single-utterance fallback
        const startedAt = readStartTimeRef.current
        setIsSpeaking(false); setIsPaused(false)
  const totalMs = startedAt ? (Date.now() - startedAt) : null
        const longText = chunks.join(' ').length > 80
        const tooQuick = totalMs !== null && totalMs < (opts.minDurationMs ?? 1200)
  dlog('tts', 'speakSmart finished', { totalMs, longText, tooQuick })
  devLog('speakSmart finished', { totalMs, longText, tooQuick })
        if (!cancelledRef.current && longText && tooQuick) {
          try {
            const full = chunks.join(' ')
            const lang = opts.lang || (hasViChars(full) ? 'vi-VN' : 'en-US')
            dlog('tts', 'fallback to single utterance after tooQuick in speakSmart', { lang })
            const utter = new SpeechSynthesisUtterance(preprocessForLang(lang, full))
            const voice = opts.voice || pickVoice(lang)
            if (voice) { utter.voice = voice; utter.lang = voice.lang || lang } else { utter.lang = lang }
            utter.rate = (opts.rate ?? 0.8)
            utter.pitch = (opts.pitch ?? 0.95)
            utter.volume = 1
            utter.onstart = () => { dlog('tts', 'fallback single onstart'); devLog('fallback single onstart'); setIsSpeaking(true); setIsPaused(false) }
            utter.onend = () => { dlog('tts', 'fallback single onend'); devLog('fallback single onend'); setIsSpeaking(false); setIsPaused(false) }
            utter.onerror = (e) => { dlog('tts', 'fallback single onerror', e?.error); devLog('fallback single onerror', e?.error); setIsSpeaking(false); setIsPaused(false) }
            synth.speak(utter)
          } catch {}
        }
        return
      }
      const currentIndex = index
      const chunk = chunks[index++]
      // Force Vietnamese if numbered-list-like to avoid English reading of "one, two"
      const lang = opts.lang || ((hasViChars(chunk) || startsWithNumberedList(chunk)) ? 'vi-VN' : 'en-US')
      const processed = preprocessForLang(lang, chunk)
      const utter = new SpeechSynthesisUtterance(processed)
      const voice = opts.voice || pickVoice(lang)
      if (voice) {
        utter.voice = voice
        // Align utterance language to the selected voice where possible
        utter.lang = voice.lang || lang
      } else {
        // If no voices have loaded yet, don't force a lang that might be unsupported; let the engine pick default
        if (voices.length > 0) utter.lang = lang
      }
      utter.rate = (opts.rate ?? 0.8)
      utter.pitch = (opts.pitch ?? 0.95)
      utter.volume = 1
  dlog('tts', 'speakSmart chunk', { index: currentIndex, of: chunks.length, lang: utter.lang, len: chunk.length, voice: voice?.name, voicesCount: voices.length })
  devLog('chunk', { index: currentIndex, of: chunks.length, lang: utter.lang, len: chunk.length, voice: voice?.name, voicesCount: voices.length })
      const pauseMs = opts.pauseMs ?? 300
      const scheduleNext = () => {
        if (cancelledRef.current) return
        if (nextTimerRef.current) { clearTimeout(nextTimerRef.current) }
        nextTimerRef.current = setTimeout(() => {
          nextTimerRef.current = null
          if (!cancelledRef.current) speakNext()
        }, pauseMs)
      }
      // Guard: ensure the engine actually starts; otherwise try to resume then move on
      let startGuard = null
      utter.onstart = () => {
        dlog('tts', 'utter onstart', { index: currentIndex })
        devLog('utter onstart', { index: currentIndex })
        if (!started) { setIsSpeaking(true); setIsPaused(false); started = true }
        if (!readStartTimeRef.current) { readStartTimeRef.current = Date.now() }
        if (startGuard) { clearTimeout(startGuard); startGuard = null }
      }
      utter.onend = () => { dlog('tts', 'utter onend', { index: currentIndex }); devLog('utter onend', { index: currentIndex }); if (startGuard) { clearTimeout(startGuard); startGuard = null } scheduleNext() }
      utter.onerror = (e) => { dlog('tts', 'utter onerror', { index: currentIndex, error: e?.error }); devLog('utter onerror', { index: currentIndex, error: e?.error }); if (startGuard) { clearTimeout(startGuard); startGuard = null } scheduleNext() }
      currentUtterRef.current = utter
      try {
        synth.speak(utter)
      } catch {
        // If speak throws, attempt to continue with the next chunk
        dlog('tts', 'synth.speak threw, scheduling next chunk')
        devLog('synth.speak threw, schedule next')
        scheduleNext()
        return
      }
      // Start guard after issuing speak
      startGuard = setTimeout(() => {
        startGuard = null
        if (cancelledRef.current) return
        try { synth.resume(); dlog('tts', 'resume() called by startGuard'); devLog('resume() by startGuard') } catch {}
        setTimeout(() => {
          if (!cancelledRef.current && !synth.speaking) {
            // If still not speaking, try a one-time short prime utterance to unlock audio
            if (!primeTriedRef.current) {
              primeTriedRef.current = true
              dlog('tts', 'priming utterance (speakSmart)')
              devLog('priming utterance (speakSmart)')
              const primeUtter = new SpeechSynthesisUtterance(
                (utter.lang?.toLowerCase().startsWith('vi') ? 'Bắt đầu đọc' : 'Starting to read')
              )
              primeUtter.lang = utter.lang
              primeUtter.volume = 1
              primeUtter.rate = utter.rate
              primeUtter.pitch = utter.pitch
              primeUtter.onend = () => {
                dlog('tts', 'prime onend → retry same chunk', { index: currentIndex })
                devLog('prime onend → retry same chunk', { index: currentIndex })
                // Retry the same chunk after prime
                index = currentIndex
                speakNext()
              }
              primeUtter.onerror = (e) => {
                dlog('tts', 'prime onerror', e?.error)
                devLog('prime onerror', e?.error)
                // If prime also fails, proceed to next to avoid locking
                scheduleNext()
              }
              try { synth.speak(primeUtter) } catch { dlog('tts', 'speak prime threw'); devLog('speak prime threw'); scheduleNext() }
            } else {
              // Already tried priming; move on
              dlog('tts', 'already primed; moving to next chunk')
              devLog('already primed; next chunk')
              scheduleNext()
            }
          }
        }, 200)
      }, 800)
    }
    // If no voices yet, try an immediate tiny prime to wake engine, then continue
    if (voices.length === 0 && !primeTriedRef.current) {
      primeTriedRef.current = true
      dlog('tts', 'immediate prime (no voices yet)')
      devLog('immediate prime (no voices yet)')
      const primeUtter = new SpeechSynthesisUtterance(
        'Bắt đầu đọc'
      )
      // Don't force lang here; let engine choose default
      primeUtter.volume = 1
      primeUtter.rate = 1
      primeUtter.pitch = 1
      primeUtter.onend = () => { dlog('tts', 'prime immediate onend → start speakNext'); devLog('prime immediate onend → start speakNext'); speakNext() }
      primeUtter.onerror = (e) => { dlog('tts', 'prime immediate onerror', e?.error); devLog('prime immediate onerror', e?.error); speakNext() }
      try { synth.speak(primeUtter) } catch { speakNext() }
      return
    }
    // If we had to cancel an ongoing speech, defer to next tick; otherwise speak immediately to keep user activation
    if (didCancel) setTimeout(speakNext, 0)
    else speakNext()
  }

  // Simple single-utterance speak (backward compatible)
  const speak = (text, opts = {}) => {
    const synth = synthRef.current
    if (!synth || !text) return
    let didCancel = false
    try {
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel()
        didCancel = true
        devLog('synth.cancel() before single speak (conditional)')
        dlog('tts', 'synth.cancel() before single speak (conditional)')
      }
    } catch {}
    cancelledRef.current = false
    const lang = opts.lang || 'vi-VN'
    const utter = new SpeechSynthesisUtterance(preprocessForLang(lang, text))
    const voice = opts.voice || pickVoice(opts.lang || 'vi-VN')
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang || lang
    } else {
      if (voices.length > 0) utter.lang = lang
    }
    utter.rate = (opts.rate ?? 0.8)
    utter.pitch = (opts.pitch ?? 0.95)
    utter.volume = 1
    let startedAt = null
    dlog('tts', 'speak single start', { len: (text||'').length, lang: utter.lang, voice: voice?.name, voicesCount: voices.length })
    devLog('speak single start', { len: (text||'').length, lang: utter.lang, voice: voice?.name, voicesCount: voices.length })
  utter.onstart = () => { dlog('tts', 'single onstart'); devLog('single onstart'); setIsSpeaking(true); setIsPaused(false); startedAt = Date.now() }
    utter.onend = () => {
      dlog('tts', 'single onend')
      devLog('single onend')
      setIsSpeaking(false); setIsPaused(false)
      // If it ended too quickly for a long text, fallback to chunked reading
      const totalMs = startedAt ? (Date.now() - startedAt) : null
      const longText = (text || '').length > 200
      const tooQuick = totalMs !== null && totalMs < (opts.minDurationMs ?? 1200)
      dlog('tts', 'single end timing', { totalMs, longText, tooQuick })
      devLog('single end timing', { totalMs, longText, tooQuick })
      if (!cancelledRef.current && longText && tooQuick) {
        try { dlog('tts', 'fallback to speakSmart after tooQuick in speak'); devLog('fallback to speakSmart after tooQuick'); speakSmart(text, opts) } catch {}
      }
    }
    utter.onerror = (e) => { dlog('tts', 'single onerror', e?.error); devLog('single onerror', e?.error); setIsSpeaking(false); setIsPaused(false) }
    currentUtterRef.current = utter
    try {
      if (didCancel) {
        setTimeout(() => {
          try { synth.speak(utter) } catch (err) { dlog('tts', 'synth.speak threw (single)'); devLog('synth.speak threw (single)', err) }
        }, 0)
      } else {
        // speak immediately to preserve user activation
        synth.speak(utter)
      }
    } catch (err) {
      dlog('tts', 'enqueue/speak threw (single)')
      devLog('enqueue/speak threw (single)', err)
    }

    // Guard: if not speaking after a short delay, try resume and a short prime utterance once
    setTimeout(() => {
      if (cancelledRef.current) return
      if (!synth.speaking) {
        try { synth.resume(); dlog('tts', 'resume() called by single guard'); devLog('resume() by single guard') } catch {}
        setTimeout(() => {
          if (!cancelledRef.current && !synth.speaking && !primeTriedRef.current) {
            primeTriedRef.current = true
            dlog('tts', 'priming utterance (single)')
            devLog('priming utterance (single)')
            const primeUtter = new SpeechSynthesisUtterance(
              lang.toLowerCase().startsWith('vi') ? 'Bắt đầu đọc' : 'Starting to read'
            )
            primeUtter.lang = utter.lang
            primeUtter.volume = 1
            primeUtter.rate = utter.rate
            primeUtter.pitch = utter.pitch
            primeUtter.onend = () => {
              // Retry the main utterance after priming
              dlog('tts', 'prime onend → retry main (single)')
              devLog('prime onend → retry main (single)')
              try { synth.speak(utter) } catch { dlog('tts', 'retry main threw after prime'); devLog('retry main threw after prime') }
            }
            primeUtter.onerror = (e) => { dlog('tts', 'prime onerror (single)', e?.error); devLog('prime onerror (single)', e?.error) }
            try { synth.speak(primeUtter) } catch { dlog('tts', 'speak prime threw (single)'); devLog('speak prime threw (single)') }
          }
        }, 200)
      }
    }, 800)
  }

  const pause = () => {
    const s = synthRef.current
    if (!s) return
    try {
      if (s.speaking && !s.paused) { dlog('tts', 'pause()'); devLog('pause()'); s.pause(); setIsPaused(true) }
    } catch {}
  }
  const resume = () => {
    const s = synthRef.current
    if (!s) return
    try {
      if (s.paused) { dlog('tts', 'resume()'); devLog('resume()'); s.resume(); setIsPaused(false) }
      else if (!s.speaking && currentUtterRef.current) {
        // Some engines drop state; attempt to restart the current utterance best-effort
        dlog('tts', 'resume(): engine idle, retry speak current utterance')
        devLog('resume(): engine idle, retry speak current utterance')
        try { s.speak(currentUtterRef.current) } catch {}
      }
    } catch {}
  }
  const stop = () => {
    const s = synthRef.current
    cancelledRef.current = true
    if (s) {
      try {
        dlog('tts', 'stop(): cancel() called')
        devLog('stop(): cancel() called')
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

  // Provide a stable alias for external cleanup
  const forceStop = () => stop()

  const api = { isSpeaking, isPaused, speak, speakSmart, pause, resume, stop, forceStop, voices }
  if (typeof window !== 'undefined' && debugOn('tts')) {
    // Expose for quick manual testing in console when debug is on
    window.tts = api
  }
  return api
}

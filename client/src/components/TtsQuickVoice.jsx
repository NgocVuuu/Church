import React from 'react'

// Minimal voice selector for TTS
// Props: { voices, preferredVoiceKey, setPreferredVoiceKey, voiceKey, langPrefix = 'vi' }
export default function TtsQuickVoice({ voices = [], preferredVoiceKey = '', setPreferredVoiceKey, voiceKey, langPrefix = 'vi' }) {
  const viVoices = Array.isArray(voices) ? voices.filter(v => (v.lang || '').toLowerCase().startsWith(langPrefix.toLowerCase())) : []
  if (!viVoices.length) return null
  const options = viVoices
    .map(v => ({ key: voiceKey(v), label: `${v.name} (${v.lang})` }))
    // prioritize names that include Natural/Neural/Online/Google/Microsoft
    .sort((a, b) => score(b.label) - score(a.label))

  function score(label = '') {
    const s = label.toLowerCase()
    let sc = 0
    if (s.includes('natural')) sc += 5
    if (s.includes('neural')) sc += 5
    if (s.includes('online')) sc += 2
    if (s.includes('google')) sc += 2
    if (s.includes('microsoft')) sc += 2
    if (/\bvi\b|vi-vn|vietnam/.test(s)) sc += 1
    return sc
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-neutral-600">Giọng:</span>
      <select
        value={preferredVoiceKey || ''}
        onChange={(e)=> setPreferredVoiceKey?.(e.target.value)}
        className="border rounded px-2 py-1 bg-white"
      >
        <option value="">Mặc định (tự chọn)</option>
        {options.map(opt => (
          <option key={opt.key} value={opt.key}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}

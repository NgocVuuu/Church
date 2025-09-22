import { useMemo } from 'react'

export default function TtsVoiceSelector({ voices = [], preferredVoiceKey = '', onChange, voiceKey, onTest }) {
  const viVoices = useMemo(() => voices.filter(v => (v.lang || '').toLowerCase().startsWith('vi')), [voices])
  const otherVoices = useMemo(() => voices.filter(v => !(v.lang || '').toLowerCase().startsWith('vi')), [voices])

  const options = useMemo(() => {
    const toOpt = v => ({ key: voiceKey(v), label: `${v.name} (${v.lang || 'unknown'})`, isVi: (v.lang||'').toLowerCase().startsWith('vi') })
    return [...viVoices.map(toOpt), ...otherVoices.map(toOpt)]
  }, [viVoices, otherVoices, voiceKey])

  const noVi = viVoices.length === 0

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <select
        value={preferredVoiceKey || ''}
        onChange={(e)=>{
          const key = e.target.value
          onChange?.(key)
          // auto test on change
          onTest?.(key)
        }}
        className="border rounded px-2 py-1 text-sm"
        title="Chọn giọng đọc ưu tiên"
      >
        <option value="">(Tự động chọn giọng Việt tốt nhất)</option>
        {options.map(opt => (
          <option key={opt.key} value={opt.key}>
            {opt.isVi ? '🇻🇳 ' : ''}{opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={()=>onTest?.(preferredVoiceKey)}
        className="px-2 py-1 border rounded text-sm"
        title="Thử giọng đọc"
      >Thử giọng</button>
      {/* Removed guidance line per request */}
    </div>
  )
}

import { forwardRef, useEffect, useRef } from 'react'

// Auto-resizing textarea that grows to fit its content
// Props: value, onChange, className, rows (min rows), placeholder, disabled
const AutoResizeTextarea = forwardRef(function AutoResizeTextarea(
  { value = '', onChange, className = '', rows = 3, placeholder = '', disabled = false, name },
  ref
) {
  const innerRef = useRef(null)
  // expose the inner ref to parent when provided
  useEffect(() => {
    if (!ref) return
    if (typeof ref === 'function') ref(innerRef.current)
    else ref.current = innerRef.current
  }, [ref])

  const resize = () => {
    const el = innerRef.current
    if (!el) return
    // Reset height to measure scrollHeight accurately, then set to content height
    el.style.height = '0px'
    const next = el.scrollHeight
    el.style.height = next + 'px'
  }

  useEffect(() => { resize() }, [value])
  useEffect(() => {
    // initial resize after mount
    resize()
    // also resize on window resize (for responsive font/width changes)
    const onWin = () => resize()
    window.addEventListener('resize', onWin)
    return () => window.removeEventListener('resize', onWin)
  }, [])

  return (
    <textarea
      ref={innerRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      rows={rows}
      disabled={disabled}
      className={`w-full border rounded px-4 py-3 font-sans resize-y overflow-hidden ${className}`}
      onInput={resize}
    />
  )
})

export default AutoResizeTextarea

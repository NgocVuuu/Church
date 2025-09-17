import { useBanner } from '../hooks/useBanner'

// Props:
// - pageKey: key used by useBanner
// - title, subtitle: texts
// - focus: 'top' | 'center' | 'bottom' (controls object-position of background image)
// - vAlign: 'top' | 'center' | 'bottom' (controls vertical placement of content)
// - height: tailwind height classes string for wrapper (default responsive heights)
export default function PageBanner({ title, subtitle, pageKey, focus = 'center', vAlign = 'center', height }) {
  const { url } = useBanner(pageKey)
  const hasImage = !!url

  const heightCls = height || 'h-52 md:h-64 lg:h-72'
  const focusCls = focus === 'top' ? 'object-top' : focus === 'bottom' ? 'object-bottom' : 'object-center'
  const vAlignCls = vAlign === 'top' ? 'items-start' : vAlign === 'bottom' ? 'items-end' : 'items-center'

  return (
    <div className={`relative border-b overflow-hidden ${hasImage ? 'bg-black' : 'bg-neutral-100'}`}>
      <div className={`relative ${heightCls}`}>
        {hasImage && (
          <>
            <img
              src={url}
              alt="banner"
              className={`absolute inset-0 w-full h-full object-cover ${focusCls}`}
              loading="lazy"
              decoding="async"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className={`relative h-full flex ${vAlignCls}`}>
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <h1 className={`font-display text-3xl md:text-4xl ${hasImage ? 'text-white drop-shadow' : ''}`}>{title}</h1>
              {subtitle && (
                <p className={`mt-2 ${hasImage ? 'text-white/90 drop-shadow-sm' : 'text-neutral-600'}`}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

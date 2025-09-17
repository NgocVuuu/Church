export default function Announcements({ items = [] }) {
  if (!items?.length) return null
  const sorted = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-4">
          <h2 className="font-display text-xl">Thông báo</h2>
          <p className="text-sm text-neutral-600">Các thông tin, nhắc nhở quan trọng của giáo xứ</p>
        </div>
        {/* Mobile slider */}
        <div className="md:hidden -mx-6">
          <div className="px-6 flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {sorted.map((a, idx) => (
              <div key={(a.title||'') + idx} className="flex-none w-80 border rounded-lg p-4 bg-white" style={{ scrollSnapAlign: 'start' }}>
                <div className="flex items-baseline gap-2">
                  <div className="text-xs text-neutral-500 w-24">{a.date || ''}</div>
                  <div className="font-medium">{a.title || 'Thông báo'}</div>
                </div>
                {a.text && <div className="mt-2 text-neutral-700 whitespace-pre-line">{a.text}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {sorted.map((a, idx) => (
            <div key={(a.title||'') + idx} className="border rounded-lg p-4 bg-white">
              <div className="flex items-baseline gap-2">
                <div className="text-xs text-neutral-500 w-24">{a.date || ''}</div>
                <div className="font-medium">{a.title || 'Thông báo'}</div>
              </div>
              {a.text && <div className="mt-2 text-neutral-700 whitespace-pre-line">{a.text}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

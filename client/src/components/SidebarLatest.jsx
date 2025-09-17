import { Link } from 'react-router-dom'

export default function SidebarLatest({ posts = [], sermons = [] }) {
  return (
    <aside className="space-y-8">
      <div>
        <div className="uppercase tracking-widest text-xs text-neutral-500 mb-3">Bài viết mới</div>
        <div className="space-y-3">
          {posts.slice(0,5).map(p => (
            <Link key={p.id} to={`/bai-viet/${p.slug || p.id}`} className="flex gap-3 group">
              <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy"/> : null}
              </div>
              <div>
                <div className="text-sm font-medium group-hover:underline line-clamp-2">{p.title}</div>
                <div className="text-xs text-neutral-500">{p.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="uppercase tracking-widest text-xs text-neutral-500 mb-3">Bài giảng mới</div>
        <div className="space-y-3">
          {sermons.slice(0,5).map(s => (
            <Link key={s.id} to={`/bai-giang/${s.id}`} className="flex gap-3 group">
              <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                {s.image ? <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy"/> : null}
              </div>
              <div>
                <div className="text-sm font-medium group-hover:underline line-clamp-2">{s.title}</div>
                <div className="text-xs text-neutral-500">{s.date} • {s.pastor}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

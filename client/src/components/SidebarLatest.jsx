import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function SidebarLatest({ posts = [], sermons = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isPostDetail = location.pathname.startsWith('/bai-viet/')
  const isSermonDetail = location.pathname.startsWith('/bai-giang/')
  const POST_AUTHORS = [
    'Hội đồng mục vụ', 'Ban giáo lý', 'Ca đoàn', 'Giới người cha', 'Giới người mẹ', 'Vatican', 'Đức Thánh Cha', 'Đức Giám Mục'
  ]
  const SERMON_AUTHORS = ['Linh mục', 'Đức Giám Mục', 'Đức Thánh Cha']
  const goFilter = (kind, author) => {
    if (kind === 'post') navigate(`/bai-viet?author=${encodeURIComponent(author)}`)
    if (kind === 'sermon') navigate(`/bai-giang?author=${encodeURIComponent(author)}`)
  }
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
      {/* Authors quick filter */}
      <div>
        <div className="uppercase tracking-widest text-xs text-neutral-500 mb-3">Tác giả</div>
        <div className="flex flex-wrap gap-2">
          {(isPostDetail ? POST_AUTHORS : SERMON_AUTHORS).map(a => (
            <button key={a} onClick={()=>goFilter(isPostDetail ? 'post' : 'sermon', a)} className="px-2 py-1 rounded-full border text-xs hover:bg-neutral-50">
              {a}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

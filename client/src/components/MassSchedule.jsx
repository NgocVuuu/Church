export default function MassSchedule({
  weekly = [
    { day: 'Thứ Hai', times: ['05:30', '19:00'] },
    { day: 'Thứ Ba', times: ['05:30', '19:00'] },
    { day: 'Thứ Tư', times: ['05:30', '19:00'] },
    { day: 'Thứ Năm', times: ['05:30', '19:00'] },
    { day: 'Thứ Sáu', times: ['05:30', '19:00'] },
    { day: 'Thứ Bảy', times: ['05:30', '17:00 (Lễ Vọng)'] },
    { day: 'Chúa Nhật', times: ['05:30', '07:30', '17:30'] },
  ],
  specials = [
    { date: '24/12', label: 'Đêm vọng Giáng Sinh', times: ['19:30', '21:30'] },
    { date: '25/12', label: 'Lễ Giáng Sinh', times: ['05:30', '07:30', '17:30'] },
  ],
  note = 'Lịch có thể thay đổi, xin theo dõi thông báo giáo xứ.'
}) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="uppercase tracking-[0.35em] text-neutral-500 text-xs">Giờ lễ</div>
          <h3 className="font-display text-3xl mt-3">Lịch lễ hằng tuần & đặc biệt</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Weekly schedule */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-4 py-2 text-sm font-medium">Hằng tuần</div>
            <ul className="divide-y">
              {weekly.map((d) => (
                <li key={d.day} className="px-4 py-3 flex items-start justify-between">
                  <span className="font-medium">{d.day}</span>
                  <span className="text-neutral-600">{d.times.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Special schedule */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-4 py-2 text-sm font-medium">Đặc biệt</div>
            <ul className="divide-y">
              {specials.map((s) => (
                <li key={s.date + s.label} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-black font-semibold">{s.date}</span>
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-neutral-600 text-sm">{s.times.join(', ')}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {note && (
          <div className="mt-6 text-center text-neutral-500 text-sm">{note}</div>
        )}
      </div>
    </section>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Tổng quan</h1>
      <p className="text-neutral-600">Chọn một mục ở bên trái để chỉnh sửa nội dung các trang hiển thị cho người dùng.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">Bài viết: 3</div>
        <div className="border rounded-lg p-4">Bài giảng: 3</div>
        <div className="border rounded-lg p-4">Mục tử: 3</div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import CrossIcon from './icons/CrossIcon'
import FacebookIcon from './icons/FacebookIcon'

export default function Footer() {
  return (
  <footer className="bg-neutral-900 text-neutral-300 pt-14 pb-10 font-sans mt-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-primary">
              <CrossIcon className="w-7 h-7" />
            </span>
            <span className="font-script text-3xl text-white">Gx.Đông Vinh</span>
          </div>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            ⛪️Một Giáo xứ non trẻ, xa xôi <br />
            ở vùng truyền giáo Gp Đà nẵng <br />
            Bổn mạng:<br />ĐỨC MARIA HỒN XÁC LÊN TRỜI</p>
          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://www.facebook.com/GiaoXuDongVinhDaNang"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Giáo xứ Đông Vinh Đà Nẵng"
              className="w-10 h-10 rounded-full bg-neutral-800 grid place-items-center hover:bg-neutral-700 text-white"
              title="Facebook Giáo xứ Đông Vinh Đà Nẵng"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-white text-2xl mb-4">Giới thiệu</h4>
          <ul className="space-y-3 text-neutral-300">
            <li>
              <Link to="/bai-viet/luoc-su-hinh-thanh-giao-xu-dong-vinh" className="hover:text-white">Lịch sử</Link>
            </li>
            <li>Hôn phối & An táng</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-white text-2xl mb-4">Kết nối</h4>
          <ul className="space-y-3 text-neutral-300">
            <li>Nhóm sinh hoạt</li>
            <li>Ca đoàn</li>
            <li>Thiếu nhi & Sinh viên</li>
            <li>Tình nguyện</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-white text-2xl mb-4">Phụng vụ trong tuần</h4>
          <div className="text-neutral-400 italic">Chầu Thánh Thể Thứ Năm:</div>
          <div className="text-primary text-lg font-medium mb-3">19:00 - 19:30</div>
          <div className="text-neutral-400 italic">Thánh Lễ Chúa Nhật:</div>
          <div className="text-primary text-lg font-medium mb-3">7:30 - 8:30</div>
          <div className="text-neutral-400 italic">Học giáo Lý:</div>
          <div className="text-primary text-lg font-medium">8:45 - 9:30</div>
        </div>
      </div>
      <div className="mt-10 text-center text-neutral-500 text-sm">©2025 | Bản quyền thiết kế thuộc về Ngọc Vũ</div>
    </footer>
  )
}

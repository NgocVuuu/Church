import { Router } from 'express'
import HomeContent from '../models/HomeContent.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validateHomeContent } from '../middleware/validation.js'

const router = Router()

// Get home content
router.get('/', async (req, res) => {
  try {
    let content = await HomeContent.findOne().lean()
    if (!content) {
      // Create default content if none exists
      const defaultContent = {
        slides: [
          {
            img: 'https://i0.wp.com/myhollyland.org/wp-content/uploads/2023/11/How-Many-Pages-Are-There-in-the-Bible.jpg?fit=1024%2C536&ssl=1',
            titlePre: 'Chúng tôi',
            titleEm: 'YÊU THIÊN CHÚA',
            titlePost: ', chúng tôi tin vào Thiên Chúa',
            desc: 'Ở nơi xa, sau những dãy núi của ngôn từ, cách xa các quốc gia Vokalia và Consonantia, có những văn bản mù lòa.'
          },
          {
            img: 'https://images.squarespace-cdn.com/content/v1/5cbe89ac809d8e6a6dd1a719/1609782097042-GMLKFHZHNVPCG0Z81O8N/P2422563.jpg',
            titlePre: 'Đức tin',
            titleEm: 'LÀ ÁNH SÁNG',
            titlePost: ' dẫn lối chúng ta',
            desc: 'Cùng nhau thờ phượng, yêu thương và phục vụ cộng đoàn.'
          },
          {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhihu08_Rt9QEUK_BfZcRlkebfnQo5cWj4Jw&s',
            titlePre: 'Cộng đoàn',
            titleEm: 'HIỆP NHẤT',
            titlePost: ' trong tình yêu Chúa',
            desc: 'Hãy đến và là một phần của gia đình giáo xứ.'
          }
        ],
        mass: {
          weekly: [
            { day: 'Thứ Hai', times: ['05:30', '19:00'] },
            { day: 'Thứ Ba', times: ['05:30', '19:00'] },
            { day: 'Thứ Tư', times: ['05:30', '19:00'] },
            { day: 'Thứ Năm', times: ['05:30', '19:00'] },
            { day: 'Thứ Sáu', times: ['05:30', '19:00'] },
            { day: 'Thứ Bảy', times: ['05:30', '17:00 (Lễ Vọng)'] },
            { day: 'Chúa Nhật', times: ['05:30', '07:30', '17:30'] }
          ],
          specials: [
            { date: '24/12', label: 'Đêm vọng Giáng Sinh', times: ['19:30', '21:30'] },
            { date: '25/12', label: 'Lễ Giáng Sinh', times: ['05:30', '07:30', '17:30'] }
          ],
          note: 'Lịch có thể thay đổi, xin theo dõi thông báo giáo xứ.'
        },
        event: {
          title: 'Chia sẻ Đức Tin & Tin Mừng',
          timeLabel: '8:30 sáng - 11:30 sáng',
          pastor: 'Lm. Giuse',
          address: '203 Đường Mẫu, Phường ABC, Thành phố XYZ',
          date: '2026-01-01T08:30:00',
          image: 'https://images.unsplash.com/photo-1543306730-efd0a3fa3a83?q=80&w=1600&auto=format&fit=crop'
        },
        quotes: [
          {
            title: 'Đức ái là trái tim của Giáo Hội',
            text: 'Hãy để tình yêu hướng dẫn mọi hành động của chúng ta, đặc biệt với những người bé nhỏ và yếu thế.',
            source: 'Đức Giáo hoàng Phanxicô',
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
          },
          {
            title: 'Hy vọng không làm thất vọng',
            text: 'Trong Chúa Kitô, hy vọng trở nên chắc chắn vì Người luôn đồng hành trong mọi thử thách.',
            source: 'Đức Giáo hoàng Phanxicô',
            image: 'https://images.unsplash.com/photo-1489619243109-4e0ea66d2e93?q=80&w=1200&auto=format&fit=crop'
          },
          {
            title: 'Cầu nguyện là hơi thở của linh hồn',
            text: 'Không có cầu nguyện, đức tin khô cạn; với cầu nguyện, mọi điều đều trở nên có thể.',
            source: 'Đức Giáo hoàng Phanxicô',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'
          }
        ],
        announcements: []
      }
      content = await HomeContent.create(defaultContent)
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get home content' })
  }
})

// Update home content
router.put('/', auth, adminOnly, validateHomeContent, async (req, res) => {
  try {
    let content = await HomeContent.findOne()
    if (!content) {
      content = await HomeContent.create(req.body)
    } else {
      content = await HomeContent.findOneAndUpdate({}, req.body, { new: true })
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update home content' })
  }
})

export default router
import { Router } from 'express'
import AboutContent from '../models/AboutContent.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validateAboutContent } from '../middleware/validation.js'

const router = Router()

// Get about content
router.get('/', async (req, res) => {
  try {
    let content = await AboutContent.findOne().lean()
    if (!content) {
      // Create default content if none exists
      const defaultContent = {
        intro: {
          title: 'Giới thiệu về giáo xứ',
          paragraphs: [
            'Giáo xứ hình thành từ đầu thế kỷ XX, với truyền thống đạo đức và tinh thần hiệp thông mạnh mẽ.',
            'Chúng tôi hướng đến xây dựng một cộng đoàn hiệp hành theo ba trụ cột: Hiệp thông – Tham gia – Sứ vụ.'
          ],
          bullets: [
            'Phụng vụ trang nghiêm, thánh nhạc phong phú',
            'Giáo lý và huấn giáo cho nhiều lứa tuổi',
            'Công tác bác ái xã hội và truyền giáo'
          ]
        },
        stats: { 
          parishioners: '3.500', 
          priests: '3', 
          zones: '6' 
        },
        collage: [
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=800&auto=format&fit=crop'
        ],
        highlights: [
          { tag: 'Sinh hoạt nổi bật', title: 'Ca đoàn 3 ban' },
          { tag: 'Bác ái', title: 'Caritas giáo xứ' },
          { tag: 'Giới trẻ', title: 'Sinh hoạt thứ 7' }
        ]
      }
      content = await AboutContent.create(defaultContent)
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get about content' })
  }
})

// Update about content
router.put('/', auth, adminOnly, validateAboutContent, async (req, res) => {
  try {
    let content = await AboutContent.findOne()
    if (!content) {
      content = await AboutContent.create(req.body)
    } else {
      content = await AboutContent.findOneAndUpdate({}, req.body, { new: true })
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update about content' })
  }
})

export default router
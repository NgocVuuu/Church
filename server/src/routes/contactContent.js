import { Router } from 'express'
import ContactContent from '../models/ContactContent.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validateContactContent } from '../middleware/validation.js'

const router = Router()

// Get contact content
router.get('/', async (req, res) => {
  try {
    let content = await ContactContent.findOne().lean()
    if (!content) {
      // Create default content if none exists
      const defaultContent = {
        address: '198 West 21th Street, Suite 721\nNew York, NY 10016',
        phone: '+ 1235 2355 98',
        email: 'info@yoursite.com',
        website: 'yoursite.com',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502743256744!2d106.700!3d10.773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9c6f4d1f%3A0x27f0b9b8b8627a1a!2zQ2F0aG9saWMgQ2h1cmNo!5e0!3m2!1svi!2s!4v1680000000000',
        banner: ''
      }
      content = await ContactContent.create(defaultContent)
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contact content' })
  }
})

// Update contact content
router.put('/', auth, adminOnly, validateContactContent, async (req, res) => {
  try {
    let content = await ContactContent.findOne()
    if (!content) {
      content = await ContactContent.create(req.body)
    } else {
      content = await ContactContent.findOneAndUpdate({}, req.body, { new: true })
    }
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact content' })
  }
})

export default router
import { Router } from 'express'
import { GalleryItem, EventMeta } from '../models/Gallery.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validateGalleryItem, validateObjectId } from '../middleware/validation.js'

const router = Router()

// Get all gallery items
router.get('/items', async (req, res) => {
  try {
    const items = await GalleryItem.find({}).sort({ uploadedAt: -1 }).lean()
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get gallery items' })
  }
})

// Get events metadata
router.get('/events', async (req, res) => {
  try {
    const events = await EventMeta.find({}).sort({ date: -1 }).lean()
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get events metadata' })
  }
})

// Add gallery item
router.post('/items', auth, adminOnly, validateGalleryItem, async (req, res) => {
  try {
    const { url, event, date } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })
    
    const item = await GalleryItem.create({
      url,
      event: event || '',
      date: date || ''
    })
    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gallery item' })
  }
})

// Update gallery item
router.put('/items/:id', auth, adminOnly, validateObjectId, validateGalleryItem, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Gallery item not found' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery item' })
  }
})

// Delete gallery item
router.delete('/items/:id', auth, adminOnly, validateObjectId, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Gallery item not found' })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery item' })
  }
})

// Set event metadata
router.put('/events/:eventName', auth, adminOnly, async (req, res) => {
  try {
    const { eventName } = req.params
    const { date, coverUrl } = req.body
    
    const eventMeta = await EventMeta.findOneAndUpdate(
      { eventName },
      { eventName, date, coverUrl },
      { new: true, upsert: true }
    )
    res.json(eventMeta)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event metadata' })
  }
})

export default router
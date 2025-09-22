import { Router } from 'express'
import Sermon from '../models/Sermon.js'
import { slugify } from '../utils/text.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validateSermon, validateObjectId } from '../middleware/validation.js'

const router = Router()

router.get('/', async (req, res) => {
  const list = await Sermon.find({}).sort({ createdAt: -1 }).lean()
  res.json(list)
})

router.get('/:slug', async (req, res) => {
  try {
    const key = req.params.slug
    let updated = null
    // If looks like an ObjectId, try by _id first
    if (/^[a-fA-F0-9]{24}$/.test(key)) {
      updated = await Sermon.findByIdAndUpdate(key, { $inc: { views: 1 } }, { new: true }).lean()
    }
    if (!updated) {
      updated = await Sermon.findOneAndUpdate({ slug: key }, { $inc: { views: 1 } }, { new: true }).lean()
    }
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: 'read_failed' })
  }
})

router.post('/', auth, adminOnly, validateSermon, async (req, res) => {
  const { title, slug, pastor, date, image, summary, content } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title is required' })
  const s = (slug || slugify(title))
  try {
    const created = await Sermon.create({ title, slug: s, pastor, date, image, summary, content })
    res.status(201).json(created)
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'slug already exists' })
    res.status(500).json({ error: 'create_failed' })
  }
})

router.put('/:id', auth, adminOnly, validateObjectId, validateSermon, async (req, res) => {
  try {
    const updated = await Sermon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'update_failed' })
  }
})

router.delete('/:id', auth, adminOnly, validateObjectId, async (req, res) => {
  try {
    const del = await Sermon.findByIdAndDelete(req.params.id)
    if (!del) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'delete_failed' })
  }
})

// Admin: reset all views to 0
router.post('/reset-views', auth, adminOnly, async (req, res) => {
  try {
    const result = await Sermon.updateMany({}, { $set: { views: 0 } })
    const modified = result?.modifiedCount ?? result?.nModified ?? 0
    res.json({ ok: true, modified })
  } catch (e) {
    res.status(500).json({ error: 'reset_failed' })
  }
})

export default router

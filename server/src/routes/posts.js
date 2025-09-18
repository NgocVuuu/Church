import { Router } from 'express'
import Post from '../models/Post.js'
import { slugify } from '../utils/text.js'

const router = Router()

// List
router.get('/', async (req, res) => {
  const list = await Post.find({}).sort({ createdAt: -1 }).lean()
  res.json(list)
})

// Get one by slug
router.get('/:slug', async (req, res) => {
  const item = await Post.findOne({ slug: req.params.slug }).lean()
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// Create
router.post('/', async (req, res) => {
  const { title, slug, author, date, image, content } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title is required' })
  const s = (slug || slugify(title))
  try {
    const created = await Post.create({ title, slug: s, author, date, image, content })
    res.status(201).json(created)
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'slug already exists' })
    res.status(500).json({ error: 'create_failed' })
  }
})

// Update by id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'update_failed' })
  }
})

// Delete by id
router.delete('/:id', async (req, res) => {
  try {
    const del = await Post.findByIdAndDelete(req.params.id)
    if (!del) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'delete_failed' })
  }
})

export default router

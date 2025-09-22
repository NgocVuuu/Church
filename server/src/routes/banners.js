import { Router } from 'express'
import Banner from '../models/Banner.js'
import { auth, adminOnly } from '../middleware/auth.js'

const router = Router()

// GET all banners as an object { key: url }
router.get('/', async (_req, res) => {
  try {
    const docs = await Banner.find({}).lean()
    const map = {}
    for (const b of docs) map[b.key] = b.url || ''
    res.json(map)
  } catch (e) {
    res.status(500).json({ error: 'failed_to_list_banners' })
  }
})

// GET one banner by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const doc = await Banner.findOne({ key }).lean()
    res.json({ key, url: doc?.url || '' })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_get_banner' })
  }
})

// PUT upsert one banner (admin only)
router.put('/:key', auth, adminOnly, async (req, res) => {
  try {
    const { key } = req.params
    const { url = '' } = req.body || {}
    if (typeof url !== 'string') return res.status(400).json({ error: 'invalid_url' })
    const updated = await Banner.findOneAndUpdate(
      { key },
      { $set: { url } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()
    res.json({ key: updated.key, url: updated.url || '' })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_set_banner' })
  }
})

export default router

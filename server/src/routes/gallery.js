import { Router } from 'express'
import { auth, adminOnly } from '../middleware/auth.js'
import mongoose from 'mongoose'
import { GalleryItem, Gallery } from '../models/Gallery.js'

const router = Router()

// Legacy flat items endpoint deprecated: use /gallery/groups instead
router.get('/items', async (_req, res) => {
  res.status(410).json({ error: 'Deprecated. Use GET /gallery/groups instead.' })
})

// List grouped albums (by event/title)
router.get('/groups', async (req, res) => {
  try {
    const groups = await Gallery.find({}).sort({ updatedAt: -1 }).lean()
    res.json(groups.map(g => ({ id: g._id.toString(), title: g.title, date: g.date || '', coverUrl: g.coverUrl || '', photos: (g.photos||[]).map(p => ({ url: p.url, date: p.date||'', uploadedAt: p.uploadedAt })) })))
  } catch (e) {
    res.status(500).json({ error: 'Failed to list gallery groups' })
  }
})

// Create photo(s) directly into a group (albums API)
router.post('/groups/items', auth, adminOnly, async (req, res) => {
  try {
    const body = req.body || {}
    const list = Array.isArray(body) ? body : (Array.isArray(body.items) ? body.items : [body])
    const docs = list
      .filter(x => x && typeof x.url === 'string')
      .map(x => ({ url: x.url, title: (x.title||'').trim() || 'Chưa phân loại', date: x.date || '', uploadedAt: x.uploadedAt ? new Date(x.uploadedAt) : new Date() }))
    if (!docs.length) return res.status(400).json({ error: 'No items' })
    for (const d of docs) {
      const update = {
        $setOnInsert: { title: d.title },
        $push: { photos: { url: d.url, date: d.date, uploadedAt: d.uploadedAt } }
      }
      if (d.date) update.$set = { ...(update.$set||{}), date: d.date }
      await Gallery.updateOne({ title: d.title }, update, { upsert: true })
      // set cover if missing
      await Gallery.updateOne({ title: d.title, $or: [ { coverUrl: { $exists: false } }, { coverUrl: '' }, { coverUrl: null } ] }, { $set: { coverUrl: d.url } })
    }
    res.json({ ok: true, inserted: docs.length })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create group items' })
  }
})

// Delete a photo from a group
router.delete('/groups/items', auth, adminOnly, async (req, res) => {
  try {
    const { title, url } = req.body || {}
    if (!title || !url) return res.status(400).json({ error: 'title and url are required' })
    await Gallery.updateOne({ title }, { $pull: { photos: { url } } })
    // Ensure coverUrl still valid
    const doc = await Gallery.findOne({ title }).lean()
    if (doc) {
      const urls = new Set((doc.photos||[]).map(p => p.url))
      if (!urls.has(doc.coverUrl)) {
        const newCover = (doc.photos && doc.photos[0] ? doc.photos[0].url : '') || ''
        await Gallery.updateOne({ _id: doc._id }, { $set: { coverUrl: newCover } })
      }
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete group item' })
  }
})

// Delete entire album/group by title
router.delete('/groups/:title', auth, adminOnly, async (req, res) => {
  try {
    const { title } = req.params
    if (!title) return res.status(400).json({ error: 'title is required' })
    const del = await Gallery.deleteOne({ title })
    // Best-effort cleanup of legacy flat items for same event name
    try { await GalleryItem.deleteMany({ event: title }) } catch {}
    res.json({ ok: true, deletedCount: del?.deletedCount || 0 })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete gallery group' })
  }
})

// Legacy flat items endpoint deprecated: use POST /gallery/groups/items instead
router.post('/items', auth, adminOnly, async (_req, res) => {
  res.status(410).json({ error: 'Deprecated. Use POST /gallery/groups/items instead.' })
})

// Legacy flat items endpoint deprecated: use DELETE /gallery/groups/items instead
router.delete('/items/:id', auth, adminOnly, async (_req, res) => {
  res.status(410).json({ error: 'Deprecated. Use DELETE /gallery/groups/items instead.' })
})

// Bulk rename event label
router.post('/events/rename', auth, adminOnly, async (req, res) => {
  try {
    const { oldName, newName } = req.body || {}
    if (!oldName || !newName) return res.status(400).json({ error: 'oldName and newName are required' })
    const result = await GalleryItem.updateMany({ event: oldName }, { $set: { event: newName } })
    // Mirror rename in grouped Gallery
    await Gallery.updateOne({ title: oldName }, { $set: { title: newName } })
    res.json({ ok: true, modified: result.modifiedCount })
  } catch (e) {
    res.status(500).json({ error: 'Failed to rename event' })
  }
})

// Bulk set date for all items within an event
router.post('/events/set-date', auth, adminOnly, async (req, res) => {
  try {
    const { event, date } = req.body || {}
    if (!event) return res.status(400).json({ error: 'event is required' })
    const result = await GalleryItem.updateMany({ event }, { $set: { date: date || '' } })
    // Mirror date onto grouped Gallery doc
    await Gallery.updateOne({ title: event }, { $set: { date: date || '' } })
    res.json({ ok: true, modified: result.modifiedCount })
  } catch (e) {
    res.status(500).json({ error: 'Failed to set event date' })
  }
})

export default router
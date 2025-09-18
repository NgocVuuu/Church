import { Router } from 'express'
import Priest from '../models/Priest.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { validatePriest, validateObjectId } from '../middleware/validation.js'

const router = Router()

// List all priests
router.get('/', async (req, res) => {
  try {
    const priests = await Priest.find({}).sort({ order: 1, createdAt: -1 }).lean()
    res.json(priests)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get priests' })
  }
})

// Get one priest by id
router.get('/:id', async (req, res) => {
  try {
    const priest = await Priest.findById(req.params.id).lean()
    if (!priest) return res.status(404).json({ error: 'Priest not found' })
    res.json(priest)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get priest' })
  }
})

// Create new priest
router.post('/', auth, adminOnly, validatePriest, async (req, res) => {
  try {
    const { name, role, email, phone, avatar, order } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    
    const priest = await Priest.create({
      name,
      role: role || '',
      email: email || '',
      phone: phone || '',
      avatar: avatar || '',
      order: order || 0
    })
    res.status(201).json(priest)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create priest' })
  }
})

// Update priest by id
router.put('/:id', auth, adminOnly, validateObjectId, validatePriest, async (req, res) => {
  try {
    const priest = await Priest.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!priest) return res.status(404).json({ error: 'Priest not found' })
    res.json(priest)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update priest' })
  }
})

// Delete priest by id
router.delete('/:id', auth, adminOnly, validateObjectId, async (req, res) => {
  try {
    const priest = await Priest.findByIdAndDelete(req.params.id)
    if (!priest) return res.status(404).json({ error: 'Priest not found' })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete priest' })
  }
})

export default router
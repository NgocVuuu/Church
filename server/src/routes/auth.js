import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { JWT_SECRET, auth } from '../middleware/auth.js'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email và password là bắt buộc' })
    }

    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc password không đúng' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc password không đúng' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  })
})

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ ok: true, token })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password và new password là bắt buộc' })
    }

    const user = await User.findById(req.user._id)
    const isMatch = await user.comparePassword(currentPassword)
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password không đúng' })
    }

    user.password = newPassword
    await user.save()

    res.json({ ok: true, message: 'Password đã được thay đổi' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
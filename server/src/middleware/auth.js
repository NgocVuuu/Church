import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'church-jwt-secret-key-change-in-production'

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Access denied. Invalid token.' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Access denied. Invalid token.' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' })
  }
  next()
}

export { JWT_SECRET }
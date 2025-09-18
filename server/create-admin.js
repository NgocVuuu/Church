import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'

dotenv.config()

async function createAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@parish.vn' })
    if (existingAdmin) {
      console.log('⏭️  Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@parish.vn',
      password: 'admin123', // Will be hashed automatically
      name: 'Administrator',
      role: 'admin'
    })

    console.log('✅ Admin user created:')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: admin123`)
    console.log(`👤 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin._id}`)

    console.log('\n🎉 Admin creation completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Admin creation failed:', error)
    process.exit(1)
  }
}

createAdmin()
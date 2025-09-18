import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Post from './src/models/Post.js'
import Sermon from './src/models/Sermon.js'

dotenv.config()

const defaultPosts = [
  { 
    title: 'Niềm vui Tin Mừng', 
    slug: 'niem-vui-tin-mung',
    date: '12/09/2025', 
    author: 'Ban Truyền thông', 
    image: '', 
    content: 'Suy niệm về sứ điệp hiệp hành nơi cộng đoàn. Nội dung đầy đủ bài viết...' 
  },
  { 
    title: 'Nhịp sống giáo xứ', 
    slug: 'nhip-song-giao-xu',
    date: '05/09/2025', 
    author: 'Giáo lý viên', 
    image: '', 
    content: 'Những hoạt động nổi bật trong tuần qua. Nội dung đầy đủ...' 
  },
  { 
    title: 'Thông báo mục vụ', 
    slug: 'thong-bao-muc-vu',
    date: '01/09/2025', 
    author: 'Văn phòng Giáo xứ', 
    image: '', 
    content: 'Lịch sinh hoạt và các lưu ý dành cho cộng đoàn. Nội dung...' 
  },
]

const defaultSermons = [
  { 
    title: 'Sống Đức Tin giữa đời', 
    slug: 'song-duc-tin-giua-doi',
    date: '14/09/2025', 
    pastor: 'Lm. Giuse', 
    image: '', 
    summary: 'Bài giảng về sống đức tin giữa đời thường.', 
    content: 'Nội dung bài giảng đầy đủ...' 
  },
  { 
    title: 'Lòng Thương Xót Chúa', 
    slug: 'long-thuong-xot-chua',
    date: '07/09/2025', 
    pastor: 'Lm. Phêrô', 
    image: '', 
    summary: 'Suy niệm về lòng thương xót.', 
    content: 'Nội dung bài giảng...' 
  },
  { 
    title: 'Hướng về tha nhân', 
    slug: 'huong-ve-tha-nhan',
    date: '31/08/2025', 
    pastor: 'Lm. Gioan', 
    image: '', 
    summary: 'Sống yêu thương và phục vụ.', 
    content: 'Nội dung bài giảng...' 
  },
]

async function migrateDefaults() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected')

    // Check existing posts
    const existingPosts = await Post.find({})
    console.log(`📖 Existing posts: ${existingPosts.length}`)

    // Check existing sermons  
    const existingSermons = await Sermon.find({})
    console.log(`🎤 Existing sermons: ${existingSermons.length}`)

    // Migrate default posts if none exist with these slugs
    for (const post of defaultPosts) {
      const existing = await Post.findOne({ slug: post.slug })
      if (!existing) {
        await Post.create(post)
        console.log(`✅ Created post: ${post.title}`)
      } else {
        console.log(`⏭️  Post already exists: ${post.title}`)
      }
    }

    // Migrate default sermons if none exist with these slugs
    for (const sermon of defaultSermons) {
      const existing = await Sermon.findOne({ slug: sermon.slug })
      if (!existing) {
        await Sermon.create(sermon)
        console.log(`✅ Created sermon: ${sermon.title}`)
      } else {
        console.log(`⏭️  Sermon already exists: ${sermon.title}`)
      }
    }

    // Final count
    const finalPosts = await Post.find({})
    const finalSermons = await Sermon.find({})
    console.log(`\n📊 Final count:`)
    console.log(`📖 Posts: ${finalPosts.length}`)
    console.log(`🎤 Sermons: ${finalSermons.length}`)

    console.log('\n🎉 Migration completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateDefaults()
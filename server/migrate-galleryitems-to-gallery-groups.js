import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { GalleryItem, Gallery } from './src/models/Gallery.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to Mongo')

  const items = await GalleryItem.find({}).lean()
  if (!items.length) {
    console.log('No galleryitems found; nothing to migrate.')
    await mongoose.disconnect()
    return
  }

  const byEvent = items.reduce((acc, it) => {
    const key = (it.event || '').trim() || 'Chưa phân loại'
    acc[key] = acc[key] || []
    acc[key].push(it)
    return acc
  }, {})

  for (const [title, arr] of Object.entries(byEvent)) {
    const latestDate = arr.map(a => a.date || '').filter(Boolean).sort().reverse()[0] || ''
    const cover = arr[0]?.url || ''
    const photos = arr.map(a => ({ url: a.url, date: a.date || '', uploadedAt: a.uploadedAt || new Date() }))
    await Gallery.updateOne(
      { title },
      { $set: { title, date: latestDate, coverUrl: cover, photos } },
      { upsert: true }
    )
  }

  console.log('Backfilled gallery groups from galleryitems')
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })

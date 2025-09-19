import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Home from './src/models/Home.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'

function mapLegacyEvent(ev) {
  const title = ev.eventName || ev.title || 'Sự kiện'
  const date = ev.date || (ev.photos && ev.photos[0]?.uploadedAt) || ''
  const image = ev.coverUrl || (ev.photos && ev.photos[0]?.url) || ''
  return {
    title,
    timeLabel: ev.timeLabel || '',
    pastor: ev.pastor || '',
    address: ev.address || '',
    date: typeof date === 'string' ? date : (date ? new Date(date).toISOString() : ''),
    image
  }
}

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to Mongo')

  const db = mongoose.connection.db
  const collections = await db.listCollections({ name: 'galleryevents' }).toArray()
  const exists = collections.length > 0
  if (!exists) {
    console.log('No galleryevents collection found; nothing to migrate.')
    await mongoose.disconnect()
    return
  }

  const col = db.collection('galleryevents')
  const legacy = await col.find({}).toArray()
  if (!legacy.length) {
    console.log('galleryevents is empty; dropping collection...')
    await col.drop().catch(()=>{})
    await mongoose.disconnect()
    return
  }

  const mapped = legacy.map(mapLegacyEvent)
  const home = await Home.findOne()
  if (!home) {
    await Home.create({ slides: [], mass: { weekly: [], specials: [], note: '' }, event: {}, events: mapped, quotes: [], announcements: [] })
    console.log(`Created Home with ${mapped.length} events`)
  } else {
    const existing = Array.isArray(home.events) ? home.events : []
    // Simple merge by title+date signature to avoid dupes
    const sig = (e) => `${(e.title||'').trim()}|${(e.date||'').slice(0,10)}`
    const seen = new Set(existing.map(sig))
    const toAdd = mapped.filter(e => !seen.has(sig(e)))
    if (toAdd.length) {
      home.events = existing.concat(toAdd)
      await home.save()
      console.log(`Appended ${toAdd.length} events to Home.events`)
    } else {
      console.log('No new events to add')
    }
  }

  // Drop legacy collection
  await col.drop().catch(()=>{})
  console.log('Dropped galleryevents collection')
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })

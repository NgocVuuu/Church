import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'
const DB_NAME = process.env.MONGODB_DB || (new URL(MONGODB_URI).pathname.replace('/', '') || 'church')

async function dropIfExists(db, name) {
  const exists = await db.listCollections({ name }).hasNext()
  if (!exists) {
    console.log(`ℹ️  Collection not found: ${name}`)
    return false
  }
  await db.collection(name).drop()
  console.log(`🗑️  Dropped collection: ${name}`)
  return true
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    console.log(`✅ Connected to ${DB_NAME}`)
  const targets = ['eventmetas', 'galleryitems', 'event']
    let dropped = 0
    for (const c of targets) {
      const ok = await dropIfExists(db, c)
      if (ok) dropped++
    }
    console.log(`🎉 Done. Dropped ${dropped}/${targets.length} collections.`)
    process.exit(0)
  } catch (e) {
    console.error('❌ Failed to drop legacy collections:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()

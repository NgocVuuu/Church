import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church'
const DB_NAME = process.env.MONGODB_DB || (new URL(MONGODB_URI).pathname.replace('/', '') || 'church')

const CONFIG_PATH = process.env.RENAME_CONFIG || path.resolve(process.cwd(), 'collection-rename.json')

async function ensureEmptyOrDrop(db, name, dropTarget) {
  const exists = await db.listCollections({ name }).hasNext()
  if (!exists) return
  if (!dropTarget) throw new Error(`Target collection ${name} exists. Re-run with dropTarget:true to replace.`)
  await db.collection(name).drop()
  console.log(`🗑️  Dropped existing target: ${name}`)
}

async function copyWithFieldMap(db, src, dst, fieldMap = {}) {
  const srcCol = db.collection(src)
  const dstCol = db.collection(dst)
  const cursor = srcCol.find({})
  let count = 0
  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    const { _id, ...rest } = doc
    const mapped = { ...rest }
    for (const [from, to] of Object.entries(fieldMap)) {
      if (from in mapped) {
        mapped[to] = mapped[from]
        delete mapped[from]
      }
    }
    await dstCol.insertOne(mapped)
    count++
  }
  console.log(`📦 Copied ${count} docs from ${src} → ${dst}`)
}

async function renameCollections() {
  const client = new MongoClient(MONGODB_URI)
  let config
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  } catch (e) {
    console.error('Failed to read config file:', CONFIG_PATH, e)
    process.exit(1)
  }
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    console.log(`✅ Connected to ${DB_NAME}`)

    for (const rule of config) {
      const { old, new: newer, dropTarget = false, fieldMap } = rule
      if (!old || !newer) { console.warn('Skipping invalid rule:', rule); continue }

      if (!fieldMap || Object.keys(fieldMap).length === 0) {
        // Use server-side renameCollection when just renaming
        await ensureEmptyOrDrop(db, newer, dropTarget)
        await db.renameCollection(old, newer)
        console.log(`🔁 Renamed ${old} → ${newer}`)
      } else {
        // Create new collection and copy with field mapping, then drop old
        await ensureEmptyOrDrop(db, newer, dropTarget)
        await db.createCollection(newer)
        await copyWithFieldMap(db, old, newer, fieldMap)
        await db.collection(old).drop()
        console.log(`🔁 Copied+Dropped ${old} → ${newer}`)
      }
    }
    console.log('🎉 Done!')
    process.exit(0)
  } catch (e) {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

renameCollections()

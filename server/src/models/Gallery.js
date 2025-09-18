import mongoose from 'mongoose'

const GalleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  event: { type: String, default: '' },
  date: { type: String, default: '' }, // YYYY-MM-DD format
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const EventMetaSchema = new mongoose.Schema({
  eventName: { type: String, required: true, unique: true },
  date: { type: String, default: '' }, // YYYY-MM-DD
  coverUrl: { type: String, default: '' }
}, { timestamps: true })

export const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema)
export const EventMeta = mongoose.model('EventMeta', EventMetaSchema)
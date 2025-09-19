import mongoose from 'mongoose'

// Legacy disabled models (kept to avoid import crashes)
const GalleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  event: { type: String, default: '' },
  date: { type: String, default: '' }, // YYYY-MM-DD format
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'galleryitems', autoCreate: false, autoIndex: false })

const EventMetaSchema = new mongoose.Schema({
  eventName: { type: String, required: true, unique: true },
  date: { type: String, default: '' }, // YYYY-MM-DD
  coverUrl: { type: String, default: '' }
}, { timestamps: true, collection: 'eventmetas', autoCreate: false, autoIndex: false })

export const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema)
export const EventMeta = mongoose.model('EventMeta', EventMetaSchema)

// New grouped Gallery model (by title/event name)
const GalleryPhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  date: { type: String, default: '' }, // YYYY-MM-DD
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false })

const GalleryGroupSchema = new mongoose.Schema({
  title: { type: String, required: true }, // event name / group title
  date: { type: String, default: '' }, // representative date
  coverUrl: { type: String, default: '' },
  photos: [GalleryPhotoSchema]
}, { timestamps: true, collection: 'gallery' })

export const Gallery = mongoose.model('Gallery', GalleryGroupSchema)
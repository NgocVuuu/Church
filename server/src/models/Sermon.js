import mongoose from 'mongoose'

const SermonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    pastor: { type: String, default: '' },
    date: { type: String, default: '' },
    image: { type: String, default: '' },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Sermon', SermonSchema)

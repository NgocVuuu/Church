import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: String, default: '' },
    date: { type: String, default: '' }, // dd/MM/YYYY for compatibility with FE
    image: { type: String, default: '' },
    content: { type: String, default: '' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Post', PostSchema)

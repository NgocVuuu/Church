import mongoose from 'mongoose'

const BannerSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  url: { type: String, default: '' }
}, { timestamps: true, collection: 'banners' })

export default mongoose.model('Banner', BannerSchema)

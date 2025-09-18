import mongoose from 'mongoose'

const ContactContentSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  mapEmbedUrl: { type: String, default: '' },
  banner: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('ContactContent', ContactContentSchema)
import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  mapEmbedUrl: { type: String, default: '' },
  banner: { type: String, default: '' }
}, { timestamps: true, collection: 'contact' })

export default mongoose.model('Contact', ContactSchema)
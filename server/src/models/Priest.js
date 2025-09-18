import mongoose from 'mongoose'

const PriestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  order: { type: Number, default: 0 } // for ordering in display
}, { timestamps: true })

export default mongoose.model('Priest', PriestSchema)
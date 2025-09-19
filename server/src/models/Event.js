import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeLabel: { type: String, default: '' },
  pastor: { type: String, default: '' },
  address: { type: String, default: '' },
  date: { type: String, default: '' },
  image: { type: String, default: '' }
}, { timestamps: true, collection: 'events' })

export default mongoose.model('Event', EventSchema)
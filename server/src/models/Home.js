import mongoose from 'mongoose'

const SlideSchema = new mongoose.Schema({
  img: { type: String, default: '' },
  titlePre: { type: String, default: '' },
  titleEm: { type: String, default: '' },
  titlePost: { type: String, default: '' },
  desc: { type: String, default: '' }
})

const MassTimeSchema = new mongoose.Schema({
  day: { type: String, required: true },
  times: [{ type: String }]
})

const SpecialMassSchema = new mongoose.Schema({
  date: { type: String, required: true },
  label: { type: String, required: true },
  times: [{ type: String }]
})

const EventSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  timeLabel: { type: String, default: '' },
  pastor: { type: String, default: '' },
  address: { type: String, default: '' },
  date: { type: String, default: '' },
  image: { type: String, default: '' }
})

const QuoteSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  source: { type: String, default: '' },
  image: { type: String, default: '' }
})

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  date: { type: String, default: '' }
})

const HomeSchema = new mongoose.Schema({
  slides: [SlideSchema],
  mass: {
    weekly: [MassTimeSchema],
    specials: [SpecialMassSchema],
    note: { type: String, default: '' }
  },
  // Featured event (legacy)
  event: EventSchema,
  // New: list of upcoming events
  events: [EventSchema],
  quotes: [QuoteSchema],
  announcements: [AnnouncementSchema]
}, { timestamps: true, collection: 'home' })

export default mongoose.model('Home', HomeSchema)
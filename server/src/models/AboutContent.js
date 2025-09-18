import mongoose from 'mongoose'

const AboutContentSchema = new mongoose.Schema({
  intro: {
    title: { type: String, default: '' },
    paragraphs: [{ type: String }],
    bullets: [{ type: String }]
  },
  stats: {
    parishioners: { type: String, default: '' },
    priests: { type: String, default: '' },
    zones: { type: String, default: '' }
  },
  collage: [{ type: String }], // array of image URLs
  highlights: [{
    tag: { type: String, default: '' },
    title: { type: String, default: '' }
  }]
}, { timestamps: true })

export default mongoose.model('AboutContent', AboutContentSchema)
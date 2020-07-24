import mongoose, { Schema } from 'mongoose'

const regionSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: 'text',
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const model = mongoose.model('Region', regionSchema)

export const schema = model.schema
export default model

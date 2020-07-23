import mongoose, { Schema } from 'mongoose'

const citySchema = new Schema({
  name: {
    type: String,
    required: true,
    index: 'text',
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: 'Region',
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

const model = mongoose.model('City', citySchema)

export const schema = model.schema
export default model

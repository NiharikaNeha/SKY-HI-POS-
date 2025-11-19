import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  emoji: {
    type: String,
    default: '🍽️'
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'low_stock'],
    default: 'available'
  }
}, {
  timestamps: true
})

const MenuItem = mongoose.model('MenuItem', menuItemSchema)

export default MenuItem


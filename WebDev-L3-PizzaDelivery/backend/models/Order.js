const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    veggies: { type: [String], default: [] },
    size: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
      default: 'Order Received',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)

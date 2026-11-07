const express = require('express')
const Order = require('../models/Order')
const requireDb = require('../middleware/requireDb')
const { auth } = require('../middleware/auth')
const { priceOrder } = require('../data/menu')

const router = express.Router()

// POST /api/orders — auth required.
// Body: { base, sauce, cheese, veggies[], size, quantity }
// The total is computed server-side from the menu; a client-supplied
// total is ignored. If MongoDB is not connected, answers 503, no crash.
router.post('/', requireDb, auth, async (req, res) => {
  const result = priceOrder(req.body || {})
  if (!result.ok) {
    return res.status(400).json({ error: result.error })
  }

  try {
    const order = await Order.create({
      user: req.user._id,
      base: req.body.base,
      sauce: req.body.sauce,
      cheese: req.body.cheese,
      veggies: req.body.veggies || [],
      size: result.summary.size,
      quantity: result.summary.quantity,
      unitPrice: result.unitPrice,
      total: result.total,
      status: 'Order Received',
    })
    return res.status(201).json({
      order: {
        id: order._id.toString(),
        ...result.summary,
        unitPrice: result.unitPrice,
        total: result.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    })
  } catch (err) {
    console.error('Order failed:', err.message)
    return res.status(500).json({ error: 'Could not place the order. Please try again.' })
  }
})

module.exports = router

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || ''

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
  })
})

// Next steps: auth routes (register/login/JWT), pizzas, orders, inventory, admin.
// Razorpay (test mode) and Nodemailer low-stock alerts plug in here.

async function start() {
  if (!MONGODB_URI) {
    console.log('MONGODB_URI not set — starting API without a database connection.')
  } else {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected.')
  }
  app.listen(PORT, () => console.log(`Pizza API listening on http://localhost:${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})

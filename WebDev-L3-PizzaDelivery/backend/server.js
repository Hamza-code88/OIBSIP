const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const pizzaRoutes = require('./routes/pizzas')
const orderRoutes = require('./routes/orders')

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

app.use('/api/auth', authRoutes)
app.use('/api/pizzas', pizzaRoutes)
app.use('/api/orders', orderRoutes)

// Unknown API route — JSON, not an HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' })
})

// Last-resort error handler — always JSON, never a crash dump to the client.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

async function start() {
  if (!MONGODB_URI) {
    console.log('MONGODB_URI not set — starting API without a database connection.')
    console.log('Auth and orders will answer 503 until MONGODB_URI is set in backend/.env.')
  } else {
    try {
      await mongoose.connect(MONGODB_URI)
      console.log('MongoDB connected.')
    } catch (err) {
      console.error('MongoDB connection failed:', err.message)
      console.log('Starting API without a database connection. Auth and orders will answer 503.')
    }
  }
  app.listen(PORT, () => console.log(`Pizza API listening on http://localhost:${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})

const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const requireDb = require('../middleware/requireDb')
const { auth, signToken } = require('../middleware/auth')

const router = express.Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateAuthInput({ name, email, password }, { requireName }) {
  if (requireName && (!name || name.trim().length < 2)) {
    return 'Name must be at least 2 characters.'
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return 'Please enter a valid email address.'
  }
  if (!password || String(password).length < 6) {
    return 'Password must be at least 6 characters.'
  }
  return null
}

// POST /api/auth/register — { name, email, password } -> { token, user }
router.post('/register', requireDb, async (req, res) => {
  const error = validateAuthInput(req.body || {}, { requireName: true })
  if (error) return res.status(400).json({ error })

  const name = req.body.name.trim()
  const email = String(req.body.email).trim().toLowerCase()
  const { password } = req.body

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: passwordHash })
    const token = signToken(user)
    return res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }
    console.error('Register failed:', err.message)
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// POST /api/auth/login — { email, password } -> { token, user }
router.post('/login', requireDb, async (req, res) => {
  const error = validateAuthInput(req.body || {}, { requireName: false })
  if (error) return res.status(400).json({ error })

  const email = String(req.body.email).trim().toLowerCase()
  const { password } = req.body

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const token = signToken(user)
    // toSafeObject is defined on the schema; the loaded doc has it too.
    return res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    console.error('Login failed:', err.message)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// GET /api/auth/me — Bearer token -> { user }
router.get('/me', requireDb, auth, (req, res) => {
  return res.json({ user: req.user.toSafeObject() })
})

module.exports = router

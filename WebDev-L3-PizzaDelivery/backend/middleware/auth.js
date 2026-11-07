const jwt = require('jsonwebtoken')
const User = require('../models/User')

function getJwtSecret() {
  return process.env.JWT_SECRET || ''
}

// Verifies the Bearer token, loads the user, and attaches it as req.user.
// The password hash is never loaded (select: false on the model).
async function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }
  const secret = getJwtSecret()
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET is not set.' })
  }
  try {
    const payload = jwt.verify(token, secret)
    const user = await User.findById(payload.id)
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists. Please log in again.' })
    }
    req.user = user
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid session. Please log in again.' })
  }
}

function signToken(user) {
  const secret = getJwtSecret()
  if (!secret) throw new Error('JWT_SECRET is not set')
  return jwt.sign({ id: user._id.toString(), email: user.email }, secret, { expiresIn: '7d' })
}

module.exports = { auth, signToken }

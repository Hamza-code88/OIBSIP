const mongoose = require('mongoose')

// Routes that need MongoDB use this first. If the database is not
// connected (no MONGODB_URI configured, or Atlas unreachable) the API
// answers with a clear 503 JSON instead of crashing.
function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database not available. Set MONGODB_URI in backend/.env and restart the server.',
    })
  }
  return next()
}

module.exports = requireDb

const express = require('express')
const { MENU } = require('../data/menu')

const router = express.Router()

// GET /api/pizzas — static menu (bases, sauces, cheeses, veggies, sizes).
// No database needed, so this works even before MongoDB is configured.
router.get('/', (req, res) => {
  return res.json(MENU)
})

module.exports = router

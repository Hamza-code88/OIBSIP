// Static menu. Prices are in INR (Razorpay test mode uses INR).
// The server always recomputes the total from this menu — the client
// total is never trusted.
const MENU = {
  currency: 'INR',
  bases: [
    { id: 'thin-crust', name: 'Thin Crust', price: 150 },
    { id: 'classic-hand-tossed', name: 'Classic Hand-Tossed', price: 180 },
    { id: 'cheese-burst', name: 'Cheese Burst', price: 250 },
    { id: 'whole-wheat', name: 'Whole Wheat', price: 200 },
  ],
  sauces: [
    { id: 'classic-tomato', name: 'Classic Tomato', price: 0 },
    { id: 'bbq', name: 'BBQ', price: 40 },
    { id: 'pesto', name: 'Pesto', price: 60 },
    { id: 'alfredo', name: 'Alfredo', price: 50 },
  ],
  cheeses: [
    { id: 'mozzarella', name: 'Mozzarella', price: 80 },
    { id: 'cheddar', name: 'Cheddar', price: 70 },
    { id: 'paneer', name: 'Paneer', price: 90 },
    { id: 'vegan', name: 'Vegan Cheese', price: 100 },
  ],
  veggies: [
    { id: 'onion', name: 'Onion', price: 20 },
    { id: 'capsicum', name: 'Capsicum', price: 25 },
    { id: 'mushroom', name: 'Mushroom', price: 40 },
    { id: 'sweet-corn', name: 'Sweet Corn', price: 30 },
    { id: 'jalapeno', name: 'Jalapeño', price: 35 },
    { id: 'olives', name: 'Olives', price: 45 },
  ],
  sizes: [
    { id: 'Small', name: 'Small', multiplier: 1 },
    { id: 'Medium', name: 'Medium', multiplier: 1.5 },
    { id: 'Large', name: 'Large', multiplier: 2 },
  ],
}

function findOption(list, id) {
  return list.find((item) => item.id === id) || null
}

// Validate a builder selection and compute the price server-side.
// Returns { ok: true, unitPrice, total, summary } or { ok: false, error }.
function priceOrder(selection) {
  const { base, sauce, cheese, veggies = [], size = 'Medium', quantity = 1 } = selection || {}

  const baseOpt = findOption(MENU.bases, base)
  if (!baseOpt) return { ok: false, error: 'Please choose a valid pizza base.' }
  const sauceOpt = findOption(MENU.sauces, sauce)
  if (!sauceOpt) return { ok: false, error: 'Please choose a valid sauce.' }
  const cheeseOpt = findOption(MENU.cheeses, cheese)
  if (!cheeseOpt) return { ok: false, error: 'Please choose a valid cheese.' }
  if (!Array.isArray(veggies)) return { ok: false, error: 'Veggies must be a list.' }
  const veggieOpts = []
  for (const id of veggies) {
    const opt = findOption(MENU.veggies, id)
    if (!opt) return { ok: false, error: `Unknown veggie option: ${id}` }
    veggieOpts.push(opt)
  }
  const sizeOpt = findOption(MENU.sizes, size)
  if (!sizeOpt) return { ok: false, error: 'Please choose a valid size (Small, Medium or Large).' }
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return { ok: false, error: 'Quantity must be a whole number between 1 and 10.' }
  }

  const subtotal = baseOpt.price + sauceOpt.price + cheeseOpt.price
    + veggieOpts.reduce((sum, v) => sum + v.price, 0)
  const unitPrice = Math.round(subtotal * sizeOpt.multiplier)
  const total = unitPrice * qty

  return {
    ok: true,
    unitPrice,
    total,
    summary: {
      base: baseOpt.name,
      sauce: sauceOpt.name,
      cheese: cheeseOpt.name,
      veggies: veggieOpts.map((v) => v.name),
      size: sizeOpt.name,
      quantity: qty,
    },
  }
}

module.exports = { MENU, priceOrder }

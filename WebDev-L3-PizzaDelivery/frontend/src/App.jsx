import React, { useEffect, useMemo, useState } from 'react'
import {
  register,
  login,
  fetchMe,
  fetchMenu,
  placeOrder,
  clearSession,
  loadStoredUser,
} from './api.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthForm({ mode, onSuccess, onSwitch }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isRegister = mode === 'register'

  async function submit(event) {
    event.preventDefault()
    if (isRegister && name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const data = isRegister
        ? await register({ name: name.trim(), email: email.trim(), password })
        : await login({ email: email.trim(), password })
      onSuccess(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>{isRegister ? 'Create your account' : 'Log in'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        {isRegister && (
          <div className="field">
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Hamza Khan" autoComplete="name"
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters" autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </div>
        <button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
        <button type="button" className="link-btn" onClick={onSwitch}>
          {isRegister ? 'Log in' : 'Create one'}
        </button>
      </p>
    </section>
  )
}

function PizzaBuilder({ user, onNeedLogin }) {
  const [menu, setMenu] = useState(null)
  const [menuError, setMenuError] = useState('')
  const [base, setBase] = useState('')
  const [sauce, setSauce] = useState('')
  const [cheese, setCheese] = useState('')
  const [veggies, setVeggies] = useState([])
  const [size, setSize] = useState('Medium')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchMenu()
      .then((data) => { if (!cancelled) setMenu(data) })
      .catch((err) => { if (!cancelled) setMenuError(err.message) })
    return () => { cancelled = true }
  }, [])

  const price = useMemo(() => {
    if (!menu) return null
    const pick = (list, id) => list.find((x) => x.id === id)
    const b = pick(menu.bases, base)
    const s = pick(menu.sauces, sauce)
    const c = pick(menu.cheeses, cheese)
    if (!b || !s || !c) return null
    const sizeOpt = menu.sizes.find((x) => x.id === size) || menu.sizes[1]
    const vegTotal = veggies.reduce((sum, id) => sum + (pick(menu.veggies, id)?.price || 0), 0)
    const unit = Math.round((b.price + s.price + c.price + vegTotal) * sizeOpt.multiplier)
    return { unit, total: unit * quantity }
  }, [menu, base, sauce, cheese, veggies, size, quantity])

  function toggleVeggie(id) {
    setVeggies((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  function OptionChips({ list, value, onPick, label }) {
    return (
      <div className="field">
        <label>{label}</label>
        <div className="options">
          {list.map((opt) => (
            <button
              key={opt.id} type="button"
              className={`chip${value === opt.id ? ' selected' : ''}`}
              onClick={() => onPick(opt.id)}
            >
              {opt.name} — ₹{opt.price}
            </button>
          ))}
        </div>
      </div>
    )
  }

  async function submitOrder() {
    if (!user) {
      onNeedLogin()
      return
    }
    if (!base || !sauce || !cheese) {
      setMessage({ type: 'error', text: 'Please pick a base, a sauce and a cheese first.' })
      return
    }
    setMessage(null)
    setBusy(true)
    try {
      const data = await placeOrder({ base, sauce, cheese, veggies, size, quantity })
      setMessage({
        type: 'success',
        text: `Order placed! Order ID ${data.order.id} — ${data.order.size} pizza, total ₹${data.order.total}. Status: ${data.order.status}.`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (menuError) {
    return (
      <section className="card">
        <h2>Build your pizza</h2>
        <div className="error">Could not load the menu: {menuError}</div>
        <p className="muted">Start the backend first (see README), then refresh this page.</p>
      </section>
    )
  }
  if (!menu) {
    return <section className="card"><p>Loading menu…</p></section>
  }

  const summary = price
    ? [
        menu.bases.find((x) => x.id === base)?.name,
        menu.sauces.find((x) => x.id === sauce)?.name,
        menu.cheeses.find((x) => x.id === cheese)?.name,
        ...veggies.map((id) => menu.veggies.find((x) => x.id === id)?.name),
      ].filter(Boolean).join(' · ')
    : 'Pick a base, sauce and cheese to see your price.'

  return (
    <section className="card">
      <h2>Build your pizza</h2>
      {message && <div className={message.type}>{message.text}</div>}
      <OptionChips list={menu.bases} value={base} onPick={setBase} label="1. Base" />
      <OptionChips list={menu.sauces} value={sauce} onPick={setSauce} label="2. Sauce" />
      <OptionChips list={menu.cheeses} value={cheese} onPick={setCheese} label="3. Cheese" />
      <div className="field">
        <label>4. Veggies (optional)</label>
        <div className="checks">
          {menu.veggies.map((opt) => (
            <label key={opt.id}>
              <input
                type="checkbox" checked={veggies.includes(opt.id)}
                onChange={() => toggleVeggie(opt.id)}
              /> {opt.name} — ₹{opt.price}
            </label>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="size">5. Size</label>
          <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
            {menu.sizes.map((s) => (
              <option key={s.id} value={s.id}>{s.name} (×{s.multiplier})</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qty">6. Quantity</label>
          <input
            id="qty" type="number" min="1" max="10" value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          />
        </div>
      </div>
      <div className="summary">
        <strong>Order summary</strong>
        <p>{summary}</p>
        {price && (
          <p className="total">
            ₹{price.unit} each × {quantity} = ₹{price.total}
          </p>
        )}
      </div>
      <p style={{ marginTop: '1rem' }}>
        <button type="button" onClick={submitOrder} disabled={busy}>
          {busy ? 'Placing order…' : user ? 'Place order' : 'Log in to place order'}
        </button>
      </p>
      {!user && <p className="muted">You need an account to place an order — it takes less than a minute.</p>}
    </section>
  )
}

export default function App() {
  const [user, setUser] = useState(() => loadStoredUser())
  const [view, setView] = useState('builder')

  // If a token is stored, verify it with the backend on load.
  useEffect(() => {
    if (!user) return
    fetchMe()
      .then((me) => setUser(me))
      .catch(() => { clearSession(); setUser(null) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function logout() {
    clearSession()
    setUser(null)
    setView('builder')
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>🍕 Pizza Delivery</h1>
          <p>Oasis Infobyte Level 3 — build your own pizza, order it, track it.</p>
        </div>
        <div className="user-box">
          {user ? (
            <>
              <span>Hi, <strong>{user.name}</strong></span>
              <button type="button" className="secondary" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <button type="button" className="secondary" onClick={() => setView('login')}>Log in</button>
              <button type="button" onClick={() => setView('register')}>Sign up</button>
            </>
          )}
        </div>
      </header>

      <div className="tabs">
        <button type="button" className={view === 'builder' ? '' : 'secondary'} onClick={() => setView('builder')}>
          Build a pizza
        </button>
        {!user && (
          <button type="button" className={view === 'login' || view === 'register' ? '' : 'secondary'} onClick={() => setView(view === 'register' ? 'register' : 'login')}>
            Account
          </button>
        )}
      </div>

      {view !== 'builder' && !user && (
        <AuthForm
          mode={view === 'register' ? 'register' : 'login'}
          onSuccess={(me) => { setUser(me); setView('builder') }}
          onSwitch={() => setView(view === 'register' ? 'login' : 'register')}
        />
      )}

      <PizzaBuilder user={user} onNeedLogin={() => setView('login')} />
    </main>
  )
}

import React from 'react'

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: 640 }}>
      <h1>Pizza Delivery</h1>
      <p>Oasis Infobyte Level 3 — full-stack pizza delivery app (Day-1 skeleton).</p>
      <h2>Coming next</h2>
      <ul>
        <li>Auth — register with email verification, JWT login, forgot password</li>
        <li>Pizza builder — base, sauce, cheese, veggies + order summary</li>
        <li>Razorpay checkout (test mode) + real-time order tracking</li>
        <li>Admin — inventory dashboard, stock auto-decrement, low-stock emails</li>
      </ul>
      <p>
        API health: <a href="/api/health">/api/health</a>
      </p>
    </main>
  )
}

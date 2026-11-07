# Pizza Delivery — Oasis Infobyte Level 3 (Web Development & Designing)

Full-stack pizza delivery application — the Level 3 task for the AICTE OIB-SIP
internship (Web Development and Designing). One task completes the whole level.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Payments:** Razorpay (test mode) — later step
- **Realtime:** order status updates (polling / WebSockets) — later step
- **Email:** Nodemailer (low-stock alerts, order emails) — later step

## Structure

```
WebDev-L3-PizzaDelivery/
├── frontend/          # React + Vite app (auth, pizza builder, orders)
│   ├── src/
│   │   ├── App.jsx    # Auth forms + pizza builder + order summary
│   │   ├── api.js     # Backend client (JWT in localStorage)
│   │   └── styles.css # Clean styling, no UI framework
│   └── .env.example   # VITE_API_URL (default http://localhost:5000)
├── backend/           # Express API (auth, pizzas, orders, inventory, admin)
│   ├── server.js      # Entry point
│   ├── data/menu.js   # Static menu + server-side price calculation
│   ├── models/        # User (bcrypt-hashed password), Order
│   ├── middleware/    # JWT auth, requireDb (503 when MongoDB is down)
│   ├── routes/        # auth, pizzas, orders
│   └── .env.example   # Copy to .env and fill in your own keys (never commit .env)
└── README.md
```

## Features

**Step 1 (Day-1 skeleton):** project structure, Express server with MongoDB
connection + health route, React app shell.

**Step 2 (this step) — auth + pizza builder:**
- Register / login with email + password (bcryptjs hash, JWT, 7-day expiry),
  `GET /api/auth/me` with a Bearer token, logout on the frontend.
- Pizza builder: base, sauce, cheese, veggies, size, quantity, live price
  calculation and order summary.
- Place order: authenticated `POST /api/orders`, total is computed
  server-side from the menu (the client total is never trusted) and the
  order is stored in MongoDB with status `Order Received`.
- If MongoDB is not connected, auth and order routes answer with a clear
  `503 { "error": "Database not available..." }` instead of crashing.
  `GET /api/pizzas` (static menu) and `GET /api/health` work without a DB.

**Still to come:** admin login + inventory dashboard, stock auto-decrement,
low-stock email alerts, Razorpay checkout (test mode), real-time order
tracking, order history page.

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # add your MongoDB Atlas URI + a JWT_SECRET
npm install
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env   # optional — defaults to http://localhost:5000
npm install
npm run dev            # http://localhost:5173
```

## What still needs real keys (later steps, not now)

- **MongoDB Atlas URI** (`MONGODB_URI` in `backend/.env`) — without it, auth
  and orders return 503; the menu and health check still work.
- **JWT_SECRET** (`backend/.env`) — any long random string you generate
  yourself; never commit it, never share it.
- **Razorpay test keys** (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`) — needed
  only for the checkout step, in test mode only.
- **Email credentials** (`EMAIL_USER` / `EMAIL_PASS`, app password) — needed
  only for the low-stock email alerts step.

## API quick reference

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | — | `{ status: "ok", db: "connected" \| "not connected" }` |
| GET | `/api/pizzas` | — | Static menu: bases, sauces, cheeses, veggies, sizes |
| POST | `/api/auth/register` | — | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Bearer | Current user (no password in any response) |
| POST | `/api/orders` | Bearer | Builder selection → `201 { order }` with server-computed total |

## Day-1 + Step-2 status

Auth and pizza builder are complete and verified locally (see commit
message). Features land in the next steps: admin/inventory, Razorpay test
checkout, real-time tracking.

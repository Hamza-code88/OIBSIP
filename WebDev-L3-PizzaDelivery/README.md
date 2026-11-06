# Pizza Delivery — Oasis Infobyte Level 3 (Web Development & Designing)

Full-stack pizza delivery application — the Level 3 task for the AICTE OIB-SIP
internship (Web Development and Designing). One task completes the whole level.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Payments:** Razorpay (test mode)
- **Realtime:** order status updates (polling / WebSockets)
- **Email:** Nodemailer (low-stock alerts, order emails)

## Structure

```
WebDev-L3-PizzaDelivery/
├── frontend/          # React + Vite app (pizza builder, orders, tracking)
├── backend/           # Express API (auth, pizzas, orders, inventory, admin)
│   ├── server.js      # Entry point
│   └── .env.example   # Copy to .env and fill in your own keys (never commit .env)
└── README.md
```

## Features (planned)

**User side:** registration with email verification, JWT login, forgot password,
dashboard, custom pizza builder (base / sauce / cheese / veggies), order
summary, Razorpay checkout (test mode), real-time order status
(Order Received → In Kitchen → Sent to Delivery).

**Admin side:** separate admin login, inventory dashboard (bases / sauces /
cheeses / vegetables), stock auto-decrement per order, manual stock update,
automated low-stock email to admin, order management panel.

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # add your MongoDB Atlas URI + Razorpay test keys
npm install
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Day-1 status

Skeleton only: project structure, Express server with MongoDB connection +
health route, and a React app shell. Features land in the next steps.

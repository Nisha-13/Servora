# 🚀 Servora — Full-Stack On-Demand Services Platform

Servora is an enterprise-grade, production-style on-demand multi-service marketplace that connects customers with verified local service professionals.

---

## 🌟 Key Highlights & Features

- **Multi-Role Authentication**: Customer, Service Provider, and Administrator accounts with JWT and bcrypt security.
- **Strict 5-Step Service Lifecycle**:
  `PENDING` $\to$ `ACCEPTED` $\to$ `IN_PROGRESS` $\to$ `SERVICE_COMPLETED` $\to$ `PAYMENT_PENDING` $\to$ `PAID`.
- **Transparent Itemized Invoicing**: Line items for service fees, labor costs, replacement parts, taxes, and discounts.
- **Cash on Delivery Settlement**: Pay in physical cash upon service completion, confirmed directly by the provider.
- **Real-Time WebSockets**: Instant messaging, live status badges, typing indicators, and push notifications powered by Socket.IO.
- **Asynchronous Task Queues**: Redis & BullMQ workers for background notification dispatch and delayed payment reminders.
- **Rich Frontend SPA**: Built with 100% Vanilla JavaScript ES6+ (No React/Vue/jQuery) and compiled Tailwind CSS.
- **Admin Analytics Panel**: Live KPIs, monthly revenue charts (Chart.js), category management, user blocking, and activity audit logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript ES6+, HTML5, CSS3, Tailwind CSS (CLI compiled), Chart.js, Lucide Icons |
| **Backend** | Node.js, Express.js (Layered Architecture: Routes $\to$ Services $\to$ Repositories $\to$ Models) |
| **Database** | MongoDB & Mongoose (12 Collections) |
| **Cache & Queues** | Redis, BullMQ (Workers & Delayed Reminders) |
| **Payments** | Cash on Delivery (COD) with Provider Confirmation |
| **Real-Time** | Socket.IO (Authenticated via JWT) |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
Ensure you have the following installed locally:
- **Node.js**: v18+ (Tested on Node v22)
- **MongoDB**: Running locally on `mongodb://localhost:27017/servora`
- **Redis**: Running locally on `redis://127.0.0.1:6379`

### 2. Clone & Install Dependencies
Run from the root repository directory:
```bash
npm run install:all
```

### 3. Configure Environment Variables
Verify or edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/servora
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=super_secret_jwt_key_servora_2026_production
```

### 4. Seed the Database
Populate demo users, 28 categories across 5 groups, services, bookings, itemized invoices, verified payments, and reviews:
```bash
npm run seed
```

### 5. Run the Application
Start the backend server, background workers, and frontend in separate terminals (or root dev script):

**Terminal 1 (Backend API):**
```bash
npm --prefix backend run dev
```

**Terminal 2 (BullMQ Workers):**
```bash
npm --prefix backend run worker
```

**Terminal 3 (Frontend):**
Open `frontend/index.html` in your browser (or use VS Code Live Server / `npx serve frontend`).

---

## 👥 Demo Accounts (One-Click Login)

The application header features a **Live Demo Switcher Bar** to toggle between roles instantly:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Customer** | `usman.customer@servora.com` | `Password123!` | Book services, view invoices, pay via Cash on Delivery, chat, leave reviews |
| **Provider** | `ahmed.tech@servora.com` | `Password123!` | Accept bookings, start/complete jobs, issue itemized invoices, confirm cash payments |
| **Admin** | `admin@servora.com` | `Admin123!` | Dashboard KPIs, revenue charts, user moderation, audit logs |

---

## 🧪 Automated Testing

Run the full integration test suite that tests authentication, booking lifecycle, invoicing, Cash on Delivery confirmation, real-time chat, and admin analytics:
```bash
npm test
```

---

## 📁 Postman Collection & Documentation

- **Postman Collection**: [`postman/Servora.postman_collection.json`](file:///d:/servicehub/postman/Servora.postman_collection.json)
- **API Documentation**: [`docs/API_DOCUMENTATION.md`](file:///d:/servicehub/docs/API_DOCUMENTATION.md)
- **Architecture Documentation**: [`docs/ARCHITECTURE.md`](file:///d:/servicehub/docs/ARCHITECTURE.md)

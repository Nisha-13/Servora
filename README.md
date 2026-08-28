# 🚀 Servora — Full-Stack On-Demand Services Platform

Servora is an enterprise-grade, production-style on-demand multi-service marketplace that connects customers with verified local service professionals.

---

## 🌟 Key Highlights & Features

* **Multi-Role Authentication**: Customer, Service Provider, and Administrator accounts with JWT and bcrypt security.

* **6-Step Service Lifecycle**:
  `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `SERVICE_COMPLETED` → `PAYMENT_PENDING` → `PAID`

* **Transparent Itemized Invoicing**: Line items for service fees, labor costs, replacement parts, taxes, and discounts.

* **Cash on Delivery Settlement**: Pay in physical cash upon service completion, confirmed directly by the provider.

* **Real-Time WebSockets**: Instant messaging, live status badges, typing indicators, and push notifications powered by Socket.IO.

* **Asynchronous Task Queues**: Redis & BullMQ workers for background notification dispatch and delayed payment reminders.

* **Rich Frontend SPA**: Built with 100% Vanilla JavaScript ES6+ (No React/Vue/jQuery) and compiled Tailwind CSS.

* **Admin Analytics Panel**: Live KPIs, monthly revenue charts (Chart.js), category management, user blocking, and activity audit logs.

---

## 🛠️ Technology Stack

| Layer              | Technology                                                                 |
| :----------------- | :------------------------------------------------------------------------- |
| **Frontend**       | Vanilla JavaScript ES6+, HTML5, CSS3, Tailwind CSS, Chart.js, Lucide Icons |
| **Backend**        | Node.js, Express.js                                                        |
| **Architecture**   | Routes → Services → Repositories → Models                                  |
| **Database**       | MongoDB & Mongoose                                                         |
| **Cache & Queues** | Redis & BullMQ                                                             |
| **Payments**       | Cash on Delivery (COD) with Provider Confirmation                          |
| **Real-Time**      | Socket.IO with JWT Authentication                                          |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites

Ensure you have the following installed locally:

* **Node.js**: v18+ (Tested on Node v22)
* **MongoDB**: Running locally
* **Redis**: Running locally

### 2. Clone & Install Dependencies

Clone the repository and install all project dependencies:

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create a `backend/.env` file locally.

**Never commit your `.env` file or real credentials to GitHub.**

Example configuration:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/servora
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your_secure_random_secret
```

> ⚠️ The values above are examples only. Use your own secure credentials locally or through your deployment platform's environment-variable settings.

### 4. Seed the Database

Populate the development database with demo data:

```bash
npm run seed
```

### 5. Run the Application

Start the backend server, background workers, and frontend in separate terminals.

**Terminal 1 — Backend API**

```bash
npm --prefix backend run dev
```

**Terminal 2 — BullMQ Workers**

```bash
npm --prefix backend run worker
```

**Terminal 3 — Frontend**

Open `frontend/index.html` in your browser, use VS Code Live Server, or run:

```bash
npx serve frontend
```

---

## 👥 Demo Accounts

The application includes a development/demo environment with role-based accounts.

> ⚠️ **Development Only:** Demo credentials are intended for local testing and should never be used in production.

| Role         | Scope                                                                    |
| :----------- | :----------------------------------------------------------------------- |
| **Customer** | Book services, view invoices, complete payments, chat, and leave reviews |
| **Provider** | Accept bookings, manage jobs, issue invoices, and confirm payments       |
| **Admin**    | Dashboard KPIs, analytics, user moderation, and audit logs               |

---

## 🧪 Automated Testing

Run the integration test suite:

```bash
npm test
```

The test suite covers core functionality including authentication, booking lifecycle, invoicing, payment workflows, real-time communication, and administrative functionality.

---

## 📁 Postman Collection & Documentation

Project documentation is available directly inside this repository:

* **Postman Collection:** `postman/Servora.postman_collection.json`
* **API Documentation:** `docs/API_DOCUMENTATION.md`
* **Architecture Documentation:** `docs/ARCHITECTURE.md`

---

## 🔐 Security

Servora follows security-focused development practices including:

* JWT-based authentication
* bcrypt password hashing
* Role-Based Access Control (RBAC)
* Environment-based secrets
* Protected API routes
* Authenticated Socket.IO connections
* Input validation
* Secure HTTP headers
* CORS configuration
* Rate limiting and request protection where applicable

**Never commit passwords, JWT secrets, database credentials, API keys, or private configuration files to the repository.**

---

## 📌 Development Notice

Servora is a production-style portfolio project designed to demonstrate full-stack application architecture, authentication, real-time communication, background processing, database design, and API development.

For production deployment, configure environment variables and infrastructure according to the target hosting environment.

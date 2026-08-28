# Servora Architecture Documentation

## 1. System Overview

Servora is an enterprise-grade, event-driven, multi-service on-demand marketplace built on a layered architecture with real-time bidirectional communication, distributed caching, delayed queue execution, and verified Cash on Delivery settlement.

```
┌────────────────────────────────────────────────────────┐
│             Frontend SPA (Vanilla JS + Tailwind)       │
│  - Hash Router   - State Store   - Socket.IO Client    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST / WebSocket
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes → Controllers → Services → Repositories   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌─────────────────┐ ┌───────────────┐                 │
│  │ Socket.IO Server│ │ BullMQ Queues │                 │
│  └─────────────────┘ └───────────────┘                 │
└──────────┬───────────────────┬─────────────────────────┘
           │                   │
           ▼                   ▼
┌──────────────────┐  ┌────────────────┐
│ MongoDB Database │  │  Redis Server  │
│ (12 Collections) │  │(BullMQ & Cache)│
└──────────────────┘  └────────────────┘
```

---

## 2. Layered Architecture (Backend)

The backend strictly adheres to separation of concerns:

1. **Routes Layer (`backend/src/routes/`)**:
   Declares URL routing paths, applies authentication (`authMiddleware`), role-based authorization (`rbacMiddleware`), request body validation schemas (`validateMiddleware`), and rate limiters.

2. **Controllers / Services Layer (`backend/src/services/`)**:
   Contains pure business logic, lifecycle transition validation, cash payment verification, invoice math, and queue scheduling.

3. **Repositories / Data Access (`backend/src/repositories/`)**:
   Encapsulates all database operations, Mongoose query building, pagination, aggregation pipelines, and sorting.

4. **Models Layer (`backend/src/models/`)**:
   Defines strict Mongoose schemas with indexed fields, subdocument definitions, and virtuals across 12 distinct entities:
   - `User`, `Category`, `Service`, `Booking`, `Invoice`, `Payment`, `Review`, `Favorite`, `Conversation`, `Message`, `Notification`, `ActivityLog`.

---

## 3. Real-Time & Background Task Pipelines

### Redis & BullMQ Architecture
- **`notificationQueue`**: High-throughput asynchronous queue processing user emails, push alerts, and audit logs.
- **`reminderQueue`**: Delayed queue that schedules payment reminder jobs at +24h, +48h, and +72h when an invoice is issued (`PAYMENT_PENDING`).
- When payment is confirmed via Cash on Delivery, `ReminderQueueManager.cancelPaymentReminders(invoiceId)` removes the delayed jobs from Redis to prevent duplicate reminders.

### Socket.IO Integration
- User socket rooms (`user:<userId>`) enable targeted real-time push alerts.
- Conversation rooms (`conv:<convId>`) broadcast typing indicators and live messages to both parties.
- Global administrative channel for KPI updates.

---

## 4. Frontend Architecture (Vanilla ES6+ & Tailwind CLI)

- **No framework dependencies**: Zero React, Vue, or Angular.
- **Modern Hash Routing (`frontend/js/router.js`)**: Dynamic client-side router with role-based auth protection.
- **Reactivity & Store (`frontend/js/state.js`)**: Single source of truth with subscription listeners and localStorage persistence.
- **Tailwind CLI Pipeline**: Clean production compilation via PostCSS and Tailwind CLI into `frontend/dist/output.css`.

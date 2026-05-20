# 🤝 Smart Donation System

> A full-stack, AI-powered donation and disaster relief management platform — built to bring transparency, efficiency, and trust to the entire donation lifecycle.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Real-Time Notifications](#real-time-notifications)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Author](#author)

---

## 🧩 Overview

The **Smart Donation System** digitizes and automates the complete donation lifecycle — from a donor submitting an item with a photo, to an admin verifying it with AI assistance, to the item being tracked step-by-step as it reaches an orphanage or disaster zone.

### The Problem It Solves
- Donors have **no visibility** into where their donations end up
- NGOs have **no system** to screen fake or unsafe items
- Manual paperwork makes inventory management **error-prone**
- Disaster relief is **uncoordinated** without a centralized platform

### The Solution
A two-portal web app (Donor + Admin) with AI screening, real-time tracking, email OTP verification, live notifications, and a complete audit trail for every donated item.

---

## ✨ Features

### 👤 Donor Portal
| Feature | Description |
|---------|-------------|
| 📧 Email OTP Registration | Email is verified with a 6-digit OTP before the account activates |
| 💰 Money Donation | Donors can submit monetary donations with payment method details |
| 📦 Product Donation | Donors upload a photo + details; AI pre-screens the item immediately |
| 📍 Item Tracking | Full step-by-step tracking timeline (like a courier) using a unique barcode/UID |
| 🔔 Real-Time Notifications | Instant in-app popup + email when a donation is approved or rejected |
| 👤 Profile & Settings | Update phone, address, toggle anonymous donations and email notifications |
| 🆘 Disaster Requests | Users can submit a disaster relief request for an area in need |

### 🛡️ Admin Portal
| Feature | Description |
|---------|-------------|
| 📊 Live Dashboard | Charts showing total donations, pending items, revenue, and alerts |
| ✅ Product Approval | Review AI screening results and approve/reject with remarks |
| 💵 Donation Approval | Approve or reject monetary donations |
| 📋 Inventory Management | Full CRUD for warehouse inventory with expiry tracking |
| ↗️ Smart Redirect | Redirect approved inventory to specific orphanages or disaster zones |
| 🚨 Expiry Alerts | Dashboard alert for items nearing expiry date |
| 🏘️ Orphanage Management | Manage registered orphanages that receive donations |
| 🌪️ Disaster Management | Track active disasters and coordinate relief |

---

## 🧱 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React.js (Vite) | Component-based, fast Virtual DOM, SPA navigation |
| **Styling** | Tailwind CSS | Utility-first, rapid UI development |
| **Charts** | Recharts | React-native charting, clean API |
| **UI Components** | Material UI (MUI) | Toast notifications |
| **HTTP Client** | Axios | Auto token injection via interceptors |
| **Backend** | Node.js + Express.js | Non-blocking I/O, same language as frontend |
| **Database** | MySQL (mysql2) | Relational data, ACID transactions, native JOINs |
| **Authentication** | JWT (jsonwebtoken) | Stateless, scalable, secure tokens |
| **Password Security** | bcryptjs | Slow hashing, salt-based, brute-force resistant |
| **Real-Time** | Socket.IO | WebSocket rooms for per-user live notifications |
| **Email** | Nodemailer (Gmail SMTP) | OTP emails + approval/rejection notifications |
| **File Uploads** | Multer | Server-side image handling for product photos |
| **AI / ML** | TensorFlow.js + MobileNet | Pre-trained image classification for product screening |
| **Environment** | dotenv | Secure secret management |
| **Dev Tool** | Nodemon | Auto-restart on file changes |

---

## 🏗️ Architecture

```
┌──────────────────────────────────┐
│     Browser (React + Vite)       │
│  - Donor Portal  /dashboard      │
│  - Admin Portal  /admin/*        │
└────────────┬─────────────────────┘
             │ HTTP (Axios)   │ WebSocket (Socket.IO)
             ▼                ▼
┌──────────────────────────────────┐
│   Node.js + Express.js Server    │
│   Port: 3000                     │
│   - 19 REST API route files      │
│   - Socket.IO for real-time      │
│   - Multer for file uploads      │
└────────────┬─────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
MySQL DB         AI Service
(19 tables)    TensorFlow.js
               + MobileNet
                    +
              Email Service
              (Nodemailer)
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Donors with OTP verification fields and profile data |
| `admin_users` | Admin accounts (separate from users for security) |
| `donations` | Monetary donation records |
| `donatedProducts` | Item donations with AI screening results |
| `inventories` | Warehouse stock of approved items |
| `trackinghistory` | Full item journey log (approved → dispatched → delivered) |
| `disasters` | Active disaster events |
| `disasterrequests` | Relief requests for disaster-affected areas |
| `orphanages` | Registered recipient orphanages |
| `notifications` | In-app notification records per user |
| `donors` | Extended donor profile data |
| `productcatalog` | Master catalog of recognized product types |
| `redirectedproducts` | Record of inventory redirections |

---

## 🤖 AI Integration

Product donations are automatically screened by a local AI module before admin review:

**Flow:**
1. User uploads product photo → Multer saves it to `uploads/`
2. `aiService.js` loads **MobileNet** (pre-trained on millions of images)
3. Model classifies the image (e.g., "jeans", "teddy bear", "rice bag")
4. Label is mapped to system categories (clothing, food, toys, etc.)
5. **Risk score** is calculated using ML confidence + business rules:
   - Category mismatch (user said "food", image shows clothing) → +30 risk
   - Expired food → +70 risk
   - Missing expiry date on food → +25 risk
   - Medical items → +60 risk
6. Final verdict:
   - Risk < 40 → `approved` ✅
   - Risk 40–70 → `review` ⚠️
   - Risk > 70 → `rejected` ❌

Admin sees the AI's verdict, confidence %, and reason before making the final call.

---

## 🔔 Real-Time Notifications

When an admin approves or rejects a product:

1. **Database** — A notification row is inserted into the `notifications` table
2. **Socket.IO** — An event is emitted to `user_<id>` room → donor sees an **instant popup** on their screen
3. **Email** — A formatted HTML email is sent to the donor via Nodemailer

All three happen within the same admin action, asynchronously.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Sanjana23-is/smart-donation-system.git
cd smart-donation-system
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below).

Run database migrations:
```bash
node db-migrate.js
node db-migrate-profile.js
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open the App
- **User Portal:** http://localhost:5173
- **Admin Portal:** http://localhost:5173/admin/login

---

## 🔐 Environment Variables

Create a `backend/.env` file with the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=donation_db

JWT_SECRET=your_jwt_secret_key

GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

> ⚠️ Never commit `.env` to GitHub. It is already listed in `.gitignore`.

---

## 📁 Project Structure

```
smart-donation-system/
├── backend/
│   ├── app.js                  # Entry point: Express + Socket.IO
│   ├── db.js                   # MySQL connection pool
│   ├── db-migrate.js           # OTP columns migration
│   ├── db-migrate-profile.js   # Profile columns migration
│   ├── routes/                 # 19 API route files
│   │   ├── auth.js             # Register, verify OTP, login
│   │   ├── adminAuth.js        # Admin login + password update
│   │   ├── adminActions.js     # Approve/reject donations (with transactions)
│   │   ├── redirects.js        # Tracking & redirect logic
│   │   ├── user.js             # User profile GET/PUT
│   │   └── ...
│   ├── services/
│   │   └── aiService.js        # TensorFlow.js + MobileNet AI
│   ├── utils/
│   │   └── emailService.js     # Nodemailer email helper
│   ├── uploads/                # Saved product images (gitignored)
│   └── .env                    # Secret config (gitignored)
│
└── frontend/
    └── src/
        ├── App.jsx             # Root component + all routes
        ├── api.js              # Axios instance with JWT interceptor
        ├── ProtectedRoute.jsx  # Route guard by role
        ├── components/         # UserTopNav, UserSidebar, AdminSidebar, AdminNav
        ├── context/            # AuthContext (global user state)
        ├── layouts/            # AdminLayout (wraps all admin routes)
        └── pages/
            ├── Auth/           # UserLogin, UserRegister, AdminLogin
            ├── Admin/          # AdminDashboard, Products, Donations, etc.
            ├── UserProfile.jsx
            ├── UserSettings.jsx
            ├── Tracking.jsx
            └── ...
```

---

## 👩‍💻 Author

**Sanjana**
Information Science Engineering

---

> Built with ❤️ to bring transparency and efficiency to the world of charitable giving.

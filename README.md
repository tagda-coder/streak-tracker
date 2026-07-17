# 🔥 Streak Tracker

A full-stack habit and streak tracker — log daily categories, keep the fire going, and watch your consistency show up on a GitHub-style heatmap.

<p align="left">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React_19-149ECA?logo=react&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

---

## ✨ Overview

Streak Tracker helps you build and maintain habits by turning daily check-ins into visible progress. Create categories (habits) you want to track, log them as done or skipped each day, and let the backend compute real streaks and completion rates — no fake or randomly seeded data anywhere.

**Highlights**

- 🔐 JWT-based email/password auth
- 🏠 Home dashboard with current streak, a 52-week activity heatmap, and today's checklist
- 📅 Full calendar with year/month navigation and a tappable daily view
- 🗒️ Per-day notes and per-day task checklists
- 🗂️ Custom categories with icons, colors, and optional reminder times
- 📊 Analytics with completion %, streaks, and category breakdowns
- 👤 Editable profile with stats and theme toggle (light/dark)

All streaks and completion percentages are computed **server-side** from real entry data (see [`Backend/src/services/streaks.ts`](Backend/src/services/streaks.ts)).

---

## 🧱 Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, React Router                |
| Backend    | Node.js, Express, TypeScript                            |
| Database   | MongoDB (via Mongoose)                                  |
| Auth       | JWT + bcrypt password hashing                           |
| Tooling    | ts-node-dev, oxlint                                      |

---

## 📁 Project Structure

```
Streak App/
├── Backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose schemas (User, Category, Entry, DayNote)
│   │   ├── routes/        # Express route handlers
│   │   ├── services/      # Streak/completion calculation logic
│   │   ├── utils/         # Shared helpers
│   │   └── index.ts       # App entry point
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── api/            # API client
    │   ├── components/     # Shared UI components
    │   ├── context/        # Auth context/provider
    │   ├── pages/          # Route-level pages
    │   ├── styles/         # Theme
    │   └── App.tsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port `27017`

### 1. Start MongoDB

```bash
mongod --dbpath "<any writable folder>" --logpath "<any writable folder>\mongod.log" --port 27017
```

On Windows, if MongoDB is installed as a service, you can instead run `net start MongoDB` from an elevated PowerShell prompt.

### 2. Backend

```bash
cd Backend
npm install
npm run dev      # http://localhost:4000
```

Configure `Backend/.env`:

| Variable        | Description                                      |
| --------------- | ------------------------------------------------- |
| `MONGO_URI`     | MongoDB connection string                          |
| `JWT_SECRET`    | Secret used to sign JWTs                           |
| `PORT`          | Port for the API server (default `4000`)          |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS                   |

CORS also allows any `http://localhost:<port>` origin, so the frontend dev server works regardless of which port Vite picks.

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev      # http://localhost:5173 (or next free port)
```

Configure `Frontend/.env`:

| Variable        | Description                                        |
| --------------- | ---------------------------------------------------- |
| `VITE_API_URL`  | Backend API base URL (default `http://localhost:4000/api`) |

---

## 📡 API Reference

All routes are prefixed with `/api`.

| Method | Endpoint                  | Description                              | Auth |
| ------ | -------------------------- | ----------------------------------------- | :--: |
| GET    | `/health`                  | Health check                              |      |
| POST   | `/auth/register`           | Create a new account                      |      |
| POST   | `/auth/login`               | Log in and receive a JWT                  |      |
| GET    | `/auth/me`                  | Get the current authenticated user        |  ✅  |
| GET    | `/categories`               | List categories                           |  ✅  |
| POST   | `/categories`               | Create a category                         |  ✅  |
| PUT    | `/categories/:id`           | Update a category                         |  ✅  |
| DELETE | `/categories/:id`           | Delete a category                         |  ✅  |
| GET    | `/entries`                   | Get entries                               |  ✅  |
| PUT    | `/entries`                   | Log/update an entry for a day             |  ✅  |
| DELETE | `/entries`                   | Delete an entry                           |  ✅  |
| GET    | `/notes/:date`               | Get the note for a given date             |  ✅  |
| PUT    | `/notes/:date`               | Create/update the note for a given date   |  ✅  |
| GET    | `/analytics/overview`        | Overview stats                            |  ✅  |
| GET    | `/analytics/categories`      | Per-category analytics                    |  ✅  |
| GET    | `/analytics/streaks`         | Streak analytics                          |  ✅  |
| GET    | `/analytics/home-heatmap`    | Heatmap data for the home page            |  ✅  |
| GET    | `/profile/stats`             | Profile-level stats                       |  ✅  |
| PUT    | `/profile`                    | Update profile                            |  ✅  |

---

## 🗺️ App Tour

| Page          | What it does                                                              |
| ------------- | --------------------------------------------------------------------------- |
| **Home**      | Current streak, 52-week activity heatmap, today's checklist                 |
| **Calendar**  | Year/month navigation, month heatmap grid, tap a day to open Daily View     |
| **Daily View**| Week strip, per-day task checklist, per-day notes, day status badge         |
| **Categories**| List with live streak/completion %, add/delete                              |
| **Add Category** | Icon picker, color swatches, optional reminder time                      |
| **Add Entry** | Log a category as completed/skipped for today, with notes                   |
| **Analytics** | Overview (completion %, streaks, heatmap) / Categories / Streaks tabs       |
| **Profile**   | Editable name/tagline, stats, theme toggle, log out                         |

---

## 📄 License

MIT

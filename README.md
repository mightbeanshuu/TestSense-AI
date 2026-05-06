# ⚡ TestSense AI — Corporate Test Case Analyser

AI-powered test intelligence that transforms hours of manual review into **10-second actionable reports**.

![TestSense AI](https://img.shields.io/badge/TestSense-AI-6C63FF?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)

---

## 🚀 Features

- **AI Analysis Engine** — Multi-provider support (Claude / OpenAI) with SSE streaming
- **7-Category Test Classification** — Regression, Flaky, Consistently Failing, Stable Passing, New Test, Skipped, Fixed
- **Flaky Test Tracker** — Dedicated dashboard with flakiness scores, pass rates, and recommendations
- **Build History** — Trend charts, pass rate analysis, expandable build reports
- **Release Decision Banner** — Safe ✅ / Conditional ⚠️ / Do NOT Release 🚫
- **Quality Scorecard** — A-F grades for Build Health, Stability, Flakiness, Coverage
- **PDF Export** — Styled multi-page reports with cover page
- **Shareable Links** — Read-only report sharing via unique tokens
- **Dark/Light Mode** — Premium dark-first UI with glassmorphism design
- **JWT Authentication** — Secure user accounts with protected routes

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS v4, Vite, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude / OpenAI (configurable) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PDF | PDFKit |
| Uploads | Multer (CSV/Excel) |

---

## 📁 Project Structure

```
├── client/                    → React frontend
│   └── src/
│       ├── components/        → UI components (13 files)
│       ├── pages/             → Route pages (6 files)
│       ├── hooks/             → Custom hooks (3 files)
│       └── utils/             → Utilities (3 files)
├── server/                    → Node.js backend
│   ├── controllers/           → Request handlers
│   ├── models/                → Mongoose schemas
│   ├── middleware/             → Auth + Upload
│   ├── routes/                → API endpoints
│   └── services/              → AI + PDF services
└── package.json               → Root orchestration
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mightbeanshuu/TestSense-AI.git
cd TestSense-AI
npm run install:all
```

### 2. Configure Environment
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/testsense
JWT_SECRET=your_secret_here
AI_PROVIDER=claude          # or "openai"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...       # if using OpenAI
CLIENT_URL=http://localhost:5173
```

### 3. Run
```bash
npm run dev
```
Opens frontend at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/analyse` | Stream AI analysis (SSE) |
| GET | `/api/history` | List all builds |
| GET | `/api/history/:id` | Get build report |
| DELETE | `/api/history/:id` | Delete build |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id/pdf` | Download PDF |
| GET | `/api/reports/:id/share` | Get share link |
| GET | `/api/reports/flaky/all` | Aggregated flaky tests |

---

## 🎨 UI Preview

- **Dark mode** first with light mode toggle
- **Primary**: Deep purple `#6C63FF`
- **Glassmorphism** cards with subtle animations
- **Inter** font from Google Fonts
- Fully **responsive** — desktop, tablet, mobile

---

## 📄 License

MIT

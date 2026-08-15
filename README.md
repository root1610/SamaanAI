# ShelfSense — AI-Powered Smart Pantry & Expiry Management System

**ShelfSense** is an intelligent household inventory and expiry date management system. It eliminates manual date typing by allowing users to upload or capture product packaging images. An integrated OCR and AI vision pipeline automatically extracts product names, brands, manufacturing dates (MFD), expiration dates (including resolving "Best Before X Months" offsets), and batch numbers, normalizing all dates into ISO standard formats for full-stack tracking.

---

## 🌟 Features

- 📸 **AI Packaging Scanner**: Drag & drop or capture live camera photos of packaging to extract dates & details automatically.
- 🧠 **Intelligent Date Parser**: Differentiates between `MFD`, `EXP`, `Best Before`, `Use By`, and `Packed On`. Resolves relative offsets like `"BEST BEFORE 12 MONTHS"` from MFD.
- 🎨 **Modern Glassmorphism UI**: Color-coded expiry badges (**Green** = Safe, **Orange** = Expiring Soon, **Red** = Expired), smooth animations, dark/light aesthetics.
- 📊 **Interactive Dashboard**: KPI counters, expiring soon alerts, category filters, search bar, and grid/table view toggles.
- 🔐 **JWT Authentication**: Secure user registration, password hashing with `bcrypt`, and token-based API security.
- 📦 **Clean Architecture**: Decoupled FastAPI backend and React TypeScript frontend designed for easy extension into Flutter mobile applications.

---

## 🏗️ Architecture & Tech Stack

```
                     +-----------------------------------+
                     |      React 18 + TypeScript        |
                     |  (Tailwind CSS, Vite, Axios UI)  |
                     +-----------------+-----------------+
                                       |
                                       | REST APIs / JSON
                                       v
                     +-----------------------------------+
                     |          FastAPI Backend          |
                     +--------+-----------------+--------+
                              |                 |
                +-------------+                 +-------------+
                |                                             |
                v                                             v
+-------------------------------+             +-------------------------------+
|    AI & Computer Vision       |             |     SQLAlchemy ORM Layer      |
|  - OpenCV Preprocessing       |             |  - Users & Auth               |
|  - EasyOCR / Tesseract        |             |  - Products & Categories      |
|  - Heuristic NLP & Gemini LLM |             |  - SQLite / PostgreSQL        |
+-------------------------------+             +-------------------------------+
```

### Stack Components
- **Backend**: Python 3.11/3.13, FastAPI, SQLAlchemy ORM, Uvicorn, Pydantic v2, PyJWT, Passlib (bcrypt)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios
- **AI / Computer Vision**: OpenCV, EasyOCR, Pillow, Custom NLP Date Math Engine
- **Database**: SQLite (Zero-config local development) / PostgreSQL ready

---

## 🛠️ Project Structure

```
shelfsense/
├── backend/
│   ├── app/
│   │   ├── api/          # Auth, Products, Dashboard, Categories routers
│   │   ├── core/         # Config, Security, Database session
│   │   ├── models/       # SQLAlchemy models (User, Product, Category, etc.)
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # OCR & AI Date Extractor services
│   │   └── main.py       # FastAPI app entrypoint
│   ├── seed_data.py      # Database seeder with demo products
│   ├── requirements.txt  # Backend dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, DashboardStats, ProductCard, ImageScannerModal, etc.
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # LoginPage, RegisterPage, DashboardPage, InventoryPage
│   │   ├── services/     # Axios client
│   │   └── types/        # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial database with sample categories and demo data
python seed_data.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Backend server will run at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```

Frontend application will run at: `http://localhost:3000`

---

## 🔑 Demo Account Credentials

When launching the web app, you can log in immediately using the pre-seeded account:

- **Email**: `demo@shelfsense.com`
- **Password**: `demo123456`

---

## 📡 API Specification Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Authenticate user & get JWT access token |
| `GET` | `/auth/me` | Fetch current user profile |
| `POST` | `/products/upload-image` | Upload packaging image $\rightarrow$ AI OCR extraction |
| `POST` | `/products` | Save confirmed product to pantry |
| `GET` | `/products` | List products with search, category filter & sorting |
| `GET` | `/products/expiring` | Query products expiring in 30/7/1 days or expired |
| `GET` | `/dashboard` | Fetch KPI stats, counts, and recent alert feeds |
| `GET` | `/categories` | List product categories |

---

## 🔮 Future Development Roadmap

- [ ] **Mobile Application**: Flutter app targeting iOS & Android consuming existing FastAPI backend.
- [ ] **Barcode Scanning**: Automatic barcode lookup via Open Food Facts API integration.
- [ ] **Push Notifications**: Firebase Cloud Messaging (FCM) & Web Push for morning expiry alerts.
- [ ] **Recipe Recommendations**: AI suggestion of meals based on products expiring soon.
- [ ] **Shared Family Inventory**: Multi-user household sharing & joint pantry management.

# 📦 SamaanAI — Full-Stack AI Household Inventory & Expiry Manager

> **SamaanAI** is an intelligent household inventory and expiration management system powered by AI Vision, OCR packaging scanners, Barcode Lookup API, and Telegram push alerts.

---

## 📌 Project Description

SamaanAI helps households eliminate food waste and track pantry safety automatically. Instead of typing product details manually, users can simply upload package photos or capture them via web camera. SamaanAI's multi-angle OpenCV & AI OCR pipeline automatically extracts product names, brands, batch numbers, manufacturing dates (`MFD`), and expiry dates (`EXP`), auto-populating inventory items with high precision.

---

## ✨ Key Features

- **📸 AI Vision & Package OCR Scanner**:
  - Multi-angle rotation scanning ($0^\circ, 90^\circ, 270^\circ$) to capture sideways printed codes.
  - Dot-matrix inkjet font binarization and thresholding for light-on-dark date stamps.
  - Multi-pattern date parser supporting `DD/MM/YYYY`, `MM/YY`, `MFD (M)`, and `Use Before (U)` single-letter packaging codes.
- **🔍 Instant Barcode Scanner**:
  - OpenCV EAN/UPC barcode detector.
  - Automatic integration with **Open Food Facts** and **Open Beauty Facts** global APIs.
- **🎨 Interactive KPI Dashboard**:
  - Real-time inventory overview: Total Items, Safe Items, Expiring Soon, and Expired Products.
  - Interactive filter cards with one-click pantry status sorting.
- **📱 Telegram Expiry Alerts**:
  - Automated daily background scheduler checking items nearing expiration.
  - Lock-screen push notifications delivered straight to your phone via Telegram Bot API.
- **🛡️ Enterprise Security**:
  - `PBKDF2-HMAC-SHA256` password hashing with 100,000 iterations & unique 16-byte random salts.
  - `HS256` JWT authentication and row-level database user isolation.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS, Tailwind CSS (Neutral light theme design system)
- **Icons**: Lucide React Icons

### **Backend**
- **Server**: FastAPI (Python 3.13), Uvicorn WSGI server
- **Database**: SQLite, SQLAlchemy ORM
- **Security**: PyJWT, Hashlib PBKDF2-SHA256

### **AI & Vision Pipeline**
- **Computer Vision**: OpenCV (`cv2`) multi-threshold binarization & CLAHE contrast boost
- **OCR Engine**: EasyOCR, PyTesseract
- **NLP Parser**: Python `dateutil` relative date math & regex pattern extractor

---

## ⚡ Quick Start (One-Click Launch on Windows)

Double-click `start-all.bat` in the project root:

```cmd
start-all.bat
```

This launches both services simultaneously:
- **Frontend UI**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000` (Interactive Swagger docs at `http://localhost:8000/docs`)

---

## 🔐 Demo Credentials

- **Email**: `demo@samaanai.com`
- **Password**: `demo123456`

---

## 📂 Repository Structure

```
SamaanAI/
├── backend/
│   ├── app/
│   │   ├── api/             # Auth, Products, Dashboard, Categories, Notifications
│   │   ├── core/            # Database, Security, Config
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── schemas/         # Pydantic Schemas & DTOs
│   │   └── services/        # AI Extractor, OCR Service, Telegram & Storage
│   ├── tests/               # Pytest Backend Unit Test Suite
│   ├── seed_data.py         # Pre-populated Demo User & Product Seeder
│   └── requirements.txt     # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProductCards, Modals, Badges
│   │   ├── pages/           # Dashboard, Inventory, Login, Register
│   │   ├── services/        # Axios API Client
│   │   └── types/           # TypeScript Definitions
│   └── package.json
├── start-all.bat            # One-click Windows Launcher
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

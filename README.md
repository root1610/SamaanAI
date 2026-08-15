# 📦 SamaanAI — AI Household Inventory & Expiry Management System

SamaanAI is an AI-powered full-stack web application designed to help households track pantry inventory, automatically scan package manufacturing and expiration dates using OCR & vision intelligence, and receive instant alerts before food or products expire.

---

## 🌟 Key Features

- **📸 AI Packaging & Expiry Scanner**: Drag-and-drop or camera capture of package photos to extract product names, brand, batch numbers, manufacturing dates (`MFD`), and expiration dates (`EXP`).
- **🔍 Barcode Scanner Integration**: Automatically detects EAN/UPC barcodes and queries global Open Food & Beauty Facts databases.
- **🎨 Interactive Dashboard & KPI Filters**: One-click filtering by Safe, Expiring Soon, and Expired products.
- **📱 Telegram Expiry Alerts**: Direct push notifications sent to your phone via Telegram Bot API before items expire.
- **🔐 Secure Authentication**: PBKDF2-SHA256 password hashing with unique salts & JWT session authorization.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy ORM, SQLite database.
- **AI & Vision**: OpenCV preprocessing, EasyOCR / PyTesseract multi-angle scanning, Date NLP parsing engine.

---

## 🚀 One-Click Quick Start (Windows)

Simply double-click `start-all.bat` in the project root:

```cmd
start-all.bat
```

This launches:
- **FastAPI Backend**: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)
- **React Frontend**: `http://localhost:3000`

---

## 🔐 Demo Credentials

- **Email**: `demo@samaanai.com`
- **Password**: `demo123456`

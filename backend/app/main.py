import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.dashboard import router as dashboard_router
from app.api.categories import router as categories_router
from app.api.notifications import router as notifications_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saaman AI API",
    description="Full-stack AI Household Inventory & Expiry Management API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount static route
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(dashboard_router)
app.include_router(categories_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Saaman AI API",
        "docs": "/docs",
        "version": "1.0.0"
    }

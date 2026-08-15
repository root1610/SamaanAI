from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class TelegramSettingsUpdate(BaseModel):
    telegram_chat_id: Optional[str] = None
    telegram_alerts_enabled: bool = True

class UserResponse(UserBase):
    id: str
    is_active: bool
    telegram_chat_id: Optional[str] = None
    telegram_alerts_enabled: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Category Schema
class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon_name: Optional[str] = None

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = None
    category_id: Optional[int] = 1
    expiry_date: date
    mfd_date: Optional[date] = None
    purchase_date: Optional[date] = None
    quantity: int = 1
    unit: Optional[str] = "pcs"
    batch_number: Optional[str] = None
    notes: Optional[str] = None

class ProductCreate(ProductBase):
    image_url: Optional[str] = None
    ocr_confidence: Optional[float] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    expiry_date: Optional[date] = None
    mfd_date: Optional[date] = None
    purchase_date: Optional[date] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    batch_number: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    user_id: str
    ocr_confidence: Optional[float] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    status: str = "safe"  # safe, expiring_soon, expired
    days_until_expiry: int = 0

    class Config:
        from_attributes = True

class AIOCRResult(BaseModel):
    product_name: str
    brand: Optional[str] = None
    category: str
    category_id: int
    expiry_date: Optional[str] = None
    mfd_date: Optional[str] = None
    batch_number: Optional[str] = None
    confidence_score: float
    raw_ocr_text: str
    image_url: str
    explanation: str

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Product, NotificationHistory
from app.schemas.schemas import NotificationResponse
from app.api.auth import get_current_user
from app.services.telegram_service import TelegramService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves recent notification alert history for current user."""
    notifications = db.query(NotificationHistory).filter(
        NotificationHistory.user_id == current_user.id
    ).order_by(NotificationHistory.created_at.desc()).limit(20).all()
    return notifications

@router.post("/trigger-telegram-test")
def trigger_telegram_test_alert(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Triggers an instant Telegram alert check for testing."""
    today = date.today()
    three_days = today + timedelta(days=3)

    products = db.query(Product).filter(Product.user_id == current_user.id).all()
    
    expired = []
    expiring = []

    for p in products:
        days_left = (p.expiry_date - today).days
        item_data = {
            "name": p.name,
            "brand": p.brand,
            "expiry_date": p.expiry_date.strftime("%Y-%m-%d"),
            "days_until_expiry": days_left
        }
        if days_left < 0:
            expired.append(item_data)
        elif days_left <= 3:
            expiring.append(item_data)

    if not expired and not expiring:
        # Create dummy sample alert for testing if pantry is empty
        expiring.append({
            "name": "Sample Product",
            "brand": "Demo",
            "expiry_date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "days_until_expiry": 2
        })

    success = TelegramService.send_expiry_alert(
        user_name=current_user.full_name or current_user.email,
        chat_id=current_user.telegram_chat_id or "DEV_MODE",
        expired_items=expired,
        expiring_soon_items=expiring
    )

    # Save to notification history
    notif = NotificationHistory(
        user_id=current_user.id,
        title="Telegram Expiry Alert Triggered",
        message=f"Sent alert for {len(expired)} expired and {len(expiring)} expiring products.",
        notification_type="telegram",
        is_read=True
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "delivered": success,
        "chat_id": current_user.telegram_chat_id or "DEV_MODE (Logged in backend console)",
        "expired_count": len(expired),
        "expiring_count": len(expiring)
    }

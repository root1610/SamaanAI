from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import User, Product
from app.schemas.schemas import DashboardStats
from app.api.auth import get_current_user
from app.api.products import format_product_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    tomorrow = today + timedelta(days=1)
    seven_days = today + timedelta(days=7)
    thirty_days = today + timedelta(days=30)

    all_products = db.query(Product).options(joinedload(Product.category)).filter(
        Product.user_id == current_user.id
    ).order_by(Product.expiry_date.asc()).all()

    formatted = [format_product_response(p) for p in all_products]

    total_products = len(formatted)
    expired_products = [p for p in formatted if p["status"] == "expired"]
    expiring_soon_products = [p for p in formatted if p["status"] == "expiring_soon"]
    safe_products = [p for p in formatted if p["status"] == "safe"]

    expiring_tomorrow = [p for p in formatted if p["expiry_date"] == tomorrow]
    expiring_7 = [p for p in formatted if today <= p["expiry_date"] <= seven_days]
    expiring_30 = [p for p in formatted if today <= p["expiry_date"] <= thirty_days]

    recently_added = sorted(formatted, key=lambda x: x["created_at"], reverse=True)[:5]

    return {
        "total_products": total_products,
        "safe_products": len(safe_products),
        "expiring_soon_count": len(expiring_soon_products),
        "expired_count": len(expired_products),
        "expiring_tomorrow_count": len(expiring_tomorrow),
        "expiring_7_days_count": len(expiring_7),
        "expiring_30_days_count": len(expiring_30),
        "recently_added": recently_added,
        "expiring_soon_products": expiring_soon_products[:10],
        "expired_products": expired_products[:10]
    }

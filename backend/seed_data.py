from datetime import date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, Product, Category
from app.core.security import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Create Demo User
        user = db.query(User).filter(User.email == "demo@saaman.com").first()
        if not user:
            user = User(
                email="demo@saaman.com",
                hashed_password=get_password_hash("demo123456"),
                full_name="Alex Pantry Keeper"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user: demo@saaman.com / demo123456")

        # 2. Check if demo products exist
        if db.query(Product).filter(Product.user_id == user.id).count() == 0:
            today = date.today()
            demo_products = [
                Product(
                    user_id=user.id,
                    name="Amul Gold Whole Milk",
                    brand="Amul",
                    category_id=2, # Dairy
                    expiry_date=today + timedelta(days=2), # Expiring in 2 days (Orange)
                    mfd_date=today - timedelta(days=5),
                    quantity=2,
                    unit="L",
                    batch_number="MLK-9821",
                    ocr_confidence=0.96,
                    image_url="/static/uploads/sample_milk.jpg",
                    notes="Keep refrigerated below 4°C"
                ),
                Product(
                    user_id=user.id,
                    name="Organic Greek Yogurt",
                    brand="Chobani",
                    category_id=2, # Dairy
                    expiry_date=today - timedelta(days=3), # Expired (Red)
                    mfd_date=today - timedelta(days=25),
                    quantity=1,
                    unit="tub",
                    batch_number="YOG-4410",
                    ocr_confidence=0.92,
                    image_url="/static/uploads/sample_yogurt.jpg",
                    notes="Check for spoilage"
                ),
                Product(
                    user_id=user.id,
                    name="Multivitamin Daily Supplement",
                    brand="Centrum",
                    category_id=4, # Medicine
                    expiry_date=today + timedelta(days=180), # Safe (Green)
                    mfd_date=today - timedelta(days=60),
                    quantity=1,
                    unit="bottle",
                    batch_number="RX-77291",
                    ocr_confidence=0.98,
                    notes="Take 1 tablet daily after breakfast"
                ),
                Product(
                    user_id=user.id,
                    name="Extra Virgin Olive Oil 1L",
                    brand="Borges",
                    category_id=1, # Food
                    expiry_date=today + timedelta(days=12), # Expiring soon (Orange)
                    mfd_date=today - timedelta(days=300),
                    quantity=1,
                    unit="bottle",
                    batch_number="OO-8812",
                    ocr_confidence=0.89,
                    notes="Cold pressed"
                ),
                Product(
                    user_id=user.id,
                    name="Hydrating Facial Serum 50ml",
                    brand="The Ordinary",
                    category_id=5, # Cosmetics
                    expiry_date=today + timedelta(days=45), # Safe (Green)
                    mfd_date=today - timedelta(days=120),
                    quantity=1,
                    unit="box",
                    batch_number="COS-3021",
                    ocr_confidence=0.95,
                    notes="Hyaluronic Acid 2% + B5"
                )
            ]
            db.add_all(demo_products)
            db.commit()
            print("Seeded 5 demo products for Alex Pantry Keeper.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

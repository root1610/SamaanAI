import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import date, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Category, Product
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Categories if empty
        if db.query(Category).count() == 0:
            categories = [
                Category(id=1, name="Food", description="General food, grains, sauces, canned items", icon_name="Package"),
                Category(id=2, name="Dairy", description="Milk, cheese, butter, yogurt", icon_name="Milk"),
                Category(id=3, name="Beverages", description="Juices, sodas, tea, coffee", icon_name="Coffee"),
                Category(id=4, name="Medicine", description="Tablets, syrups, first aid", icon_name="Pill"),
                Category(id=5, name="Cosmetics", description="Skincare, shampoos, creams", icon_name="Sparkles"),
                Category(id=6, name="Household", description="Cleaners, detergents, tissues", icon_name="Home"),
                Category(id=7, name="Bakery & Snacks", description="Bread, biscuits, chips, chocolates", icon_name="Cookie")
            ]
            db.add_all(categories)
            db.commit()
            print("Successfully seeded 7 Categories.")

        # 2. Seed Demo User if not exists
        demo_user = db.query(User).filter(User.email == "demo@samaanai.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@samaanai.com",
                hashed_password=get_password_hash("demo123456"),
                full_name="Demo User"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("Successfully created Demo User (demo@samaanai.com / demo123456).")

        # 3. Seed Sample Products for Demo User if empty
        if db.query(Product).filter(Product.user_id == demo_user.id).count() == 0:
            today = date.today()
            sample_products = [
                Product(
                    user_id=demo_user.id,
                    name="Amul Taaza Toned Milk",
                    brand="Amul",
                    category_id=2,
                    expiry_date=today + timedelta(days=2),
                    mfd_date=today - timedelta(days=2),
                    quantity=2,
                    unit="liters",
                    batch_number="B-AMUL-9901",
                    ocr_confidence=0.98,
                    image_url="/static/uploads/sample_milk.jpg",
                    notes="Keep refrigerated below 4°C"
                ),
                Product(
                    user_id=demo_user.id,
                    name="Chobani Greek Yogurt",
                    brand="Chobani",
                    category_id=2,
                    expiry_date=today + timedelta(days=6),
                    mfd_date=today - timedelta(days=10),
                    quantity=4,
                    unit="cups",
                    batch_number="LOT-88231",
                    ocr_confidence=0.94,
                    image_url="/static/uploads/sample_yogurt.jpg"
                ),
                Product(
                    user_id=demo_user.id,
                    name="Borges Extra Virgin Olive Oil 1L",
                    brand="Borges",
                    category_id=1,
                    expiry_date=today + timedelta(days=180),
                    mfd_date=today - timedelta(days=30),
                    quantity=1,
                    unit="bottle",
                    batch_number="BATCH-EVOO-41",
                    ocr_confidence=0.96
                ),
                Product(
                    user_id=demo_user.id,
                    name="Centrum Multivitamin Tablets 60s",
                    brand="Centrum",
                    category_id=4,
                    expiry_date=today - timedelta(days=5),
                    mfd_date=today - timedelta(days=365),
                    quantity=1,
                    unit="pack",
                    batch_number="PHARM-9901A",
                    ocr_confidence=0.92
                ),
                Product(
                    user_id=demo_user.id,
                    name="Nivea Soft Cream 50ml",
                    brand="Nivea",
                    category_id=5,
                    expiry_date=today + timedelta(days=900),
                    mfd_date=today - timedelta(days=100),
                    quantity=1,
                    unit="tub",
                    batch_number="B61451450",
                    ocr_confidence=0.95
                )
            ]
            db.add_all(sample_products)
            db.commit()
            print("Successfully seeded 5 sample pantry products.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

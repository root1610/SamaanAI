from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import User, Product, ProductImage, Category
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse, AIOCRResult
from app.api.auth import get_current_user
from app.services.storage_service import StorageService
from app.services.ocr_service import OCRService
from app.services.ai_extractor import AIExtractorService

router = APIRouter(prefix="/products", tags=["Products"])

def calculate_product_status(expiry_date: date) -> tuple[str, int]:
    today = date.today()
    days_left = (expiry_date - today).days
    if days_left < 0:
        return "expired", days_left
    elif days_left <= 30:
        return "expiring_soon", days_left
    else:
        return "safe", days_left

def format_product_response(product: Product) -> dict:
    status_str, days_left = calculate_product_status(product.expiry_date)
    return {
        "id": product.id,
        "user_id": product.user_id,
        "name": product.name,
        "brand": product.brand,
        "category_id": product.category_id,
        "category": product.category,
        "expiry_date": product.expiry_date,
        "mfd_date": product.mfd_date,
        "purchase_date": product.purchase_date,
        "quantity": product.quantity,
        "unit": product.unit,
        "batch_number": product.batch_number,
        "ocr_confidence": product.ocr_confidence,
        "image_url": product.image_url,
        "notes": product.notes,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "status": status_str,
        "days_until_expiry": days_left
    }

@router.post("/upload-image", response_model=AIOCRResult)
def upload_image_and_extract(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # 1. Save uploaded image to disk
    image_url = StorageService.save_image(file)
    absolute_path = StorageService.get_absolute_path(image_url)

    # 2. Extract OCR text AND Barcode Information
    ocr_text, barcode_val, barcode_info = OCRService.extract_text(absolute_path)

    # 3. Perform AI Structured Date & Field Extraction with Barcode integration
    extracted_data = AIExtractorService.extract_structured_data(
        ocr_text, image_url, barcode_val=barcode_val, barcode_info=barcode_info
    )
    return extracted_data

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check category
    if product_in.category_id:
        cat = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not cat:
            product_in.category_id = 1

    product = Product(
        user_id=current_user.id,
        name=product_in.name,
        brand=product_in.brand,
        category_id=product_in.category_id,
        expiry_date=product_in.expiry_date,
        mfd_date=product_in.mfd_date,
        purchase_date=product_in.purchase_date,
        quantity=product_in.quantity,
        unit=product_in.unit,
        batch_number=product_in.batch_number,
        ocr_confidence=product_in.ocr_confidence,
        image_url=product_in.image_url,
        notes=product_in.notes
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Save Image record if URL present
    if product_in.image_url:
        img_rec = ProductImage(
            product_id=product.id,
            image_path=product_in.image_url
        )
        db.add(img_rec)
        db.commit()

    return format_product_response(product)

@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search by product name or brand"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    sort_by: Optional[str] = Query("expiry_date", description="Sort by field: expiry_date, name, created_at"),
    order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(joinedload(Product.category)).filter(Product.user_id == current_user.id)

    if search:
        query = query.filter((Product.name.ilike(f"%{search}%")) | (Product.brand.ilike(f"%{search}%")))

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if sort_by == "name":
        sort_attr = Product.name
    elif sort_by == "created_at":
        sort_attr = Product.created_at
    else:
        sort_attr = Product.expiry_date

    if order == "desc":
        query = query.order_by(sort_attr.desc())
    else:
        query = query.order_by(sort_attr.asc())

    products = query.all()
    return [format_product_response(p) for p in products]

@router.get("/expiring", response_model=List[ProductResponse])
def get_expiring_products(
    frame: str = Query("30_days", description="Timeframe: expired, tomorrow, 7_days, 30_days"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    query = db.query(Product).options(joinedload(Product.category)).filter(Product.user_id == current_user.id)

    if frame == "expired":
        query = query.filter(Product.expiry_date < today)
    elif frame == "tomorrow":
        tomorrow = today + timedelta(days=1)
        query = query.filter(Product.expiry_date == tomorrow)
    elif frame == "7_days":
        end_date = today + timedelta(days=7)
        query = query.filter(Product.expiry_date >= today, Product.expiry_date <= end_date)
    else:  # 30_days
        end_date = today + timedelta(days=30)
        query = query.filter(Product.expiry_date >= today, Product.expiry_date <= end_date)

    products = query.order_by(Product.expiry_date.asc()).all()
    return [format_product_response(p) for p in products]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).options(joinedload(Product.category)).filter(
        Product.id == product_id, Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product_response(product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).options(joinedload(Product.category)).filter(
        Product.id == product_id, Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return format_product_response(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id, Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None

import uuid
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    unique_id = str(uuid.uuid4())[:8]
    email = f"tester_{unique_id}@example.com"
    pwd = "securepassword"
    client.post("/auth/register", json={"email": email, "password": pwd, "full_name": "Tester"})
    res = client.post("/auth/login", data={"username": email, "password": pwd})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_product_crud_lifecycle(auth_headers):
    today = date.today()
    exp_date = (today + timedelta(days=15)).strftime("%Y-%m-%d")

    # 1. Create Product
    create_res = client.post("/products", headers=auth_headers, json={
        "name": "Fresh Organic Spinach",
        "brand": "Local Farm",
        "category_id": 1,
        "expiry_date": exp_date,
        "quantity": 2,
        "unit": "bunches",
        "notes": "Keep chilled"
    })
    assert create_res.status_code == 201
    prod = create_res.json()
    prod_id = prod["id"]
    assert prod["name"] == "Fresh Organic Spinach"
    assert prod["status"] == "expiring_soon"

    # 2. Get Products List
    list_res = client.get("/products", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Get Single Product Detail
    detail_res = client.get(f"/products/{prod_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == prod_id

    # 4. Update Product
    update_res = client.put(f"/products/{prod_id}", headers=auth_headers, json={
        "quantity": 5
    })
    assert update_res.status_code == 200
    assert update_res.json()["quantity"] == 5

    # 5. Delete Product
    del_res = client.delete(f"/products/{prod_id}", headers=auth_headers)
    assert del_res.status_code == 204

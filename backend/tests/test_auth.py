import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_user():
    # 1. Register new user with unique email
    unique_id = str(uuid.uuid4())[:8]
    email = f"testuser_{unique_id}@example.com"
    pwd = "password123"
    reg_response = client.post("/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Test User"
    })
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["email"] == email

    # 2. Login user
    login_response = client.post("/auth/login", data={
        "username": email,
        "password": pwd
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Get /auth/me profile
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email

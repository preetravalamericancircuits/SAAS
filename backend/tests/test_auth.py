import pytest
from fastapi.testclient import TestClient

def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert "access_token" in data
    assert data["user"]["username"] == "testuser"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "username": "invalid",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_protected_route_without_auth(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_protected_route_with_auth(client, test_user):
    # Login first
    login_response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    
    # Access protected route
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

def test_register_user(client):
    response = client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "newpass123",
        "confirm_password": "newpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "newuser"
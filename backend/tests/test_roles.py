import pytest

def test_admin_access_users(client, admin_user):
    # Login as admin
    client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    # Access admin endpoint
    response = client.get("/api/users")
    assert response.status_code == 200

def test_regular_user_denied_admin_access(client, test_user):
    # Login as regular user
    client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    
    # Try to access admin endpoint
    response = client.get("/api/users")
    assert response.status_code == 403

def test_create_user_with_auto_password(client, admin_user):
    # Login as admin
    client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    # Create user with auto-generated password
    response = client.post("/api/users/auto-password", json={
        "username": "autouser",
        "email": "auto@example.com",
        "role_id": 1
    })
    assert response.status_code == 200
    data = response.json()
    assert "generated_password" in data
    assert len(data["generated_password"]) >= 8
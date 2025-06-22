import pytest
from fastapi import status
from app.models.user import User
from app.core.security import get_password_hash


class TestUserRegistration:
    """Test user registration endpoint."""
    
    def test_register_success(self, client, test_user_data):
        """Test successful user registration."""
        response = client.post("/api/v1/users/register", json=test_user_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
        assert "id" in data
        assert "password" not in data  # Password should not be returned
    
    def test_register_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email."""
        # Register first user
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Try to register with same email
        response = client.post("/api/v1/users/register", json=test_user_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client, test_user_data):
        """Test registration with invalid email."""
        test_user_data["email"] = "invalid-email"
        response = client.post("/api/v1/users/register", json=test_user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post("/api/v1/users/register", json={"email": "test@example.com"})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_weak_password(self, client, test_user_data):
        """Test registration with weak password (less than 8 characters)."""
        invalid_user_data = test_user_data.copy()
        invalid_user_data["password"] = "123" # Too short
        response = client.post("/api/v1/users/register", json=invalid_user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Check for Pydantic's validation error structure
        error_details = response.json().get("detail", [])
        assert isinstance(error_details, list)
        assert len(error_details) > 0
        password_error_found = False
        for error in error_details:
            # Adjusted to be more flexible with the exact wording of "msg"
            if error.get("loc") == ["body", "password"] and "at least 8 characters" in error.get("msg", "").lower():
                password_error_found = True
                break
        assert password_error_found, f"Pydantic validation error for password min_length not found or incorrect. Actual details: {error_details}"


class TestUserLogin:
    """Test user login endpoint."""
    
    def test_login_success(self, client, test_user_data, test_user_login_data):
        """Test successful user login."""
        # Register user first
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Login
        response = client.post("/api/v1/users/login", json=test_user_login_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_email(self, client, test_user_data):
        """Test login with non-existent email."""
        # Register user
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Try to login with wrong email
        response = client.post("/api/v1/users/login", json={
            "email": "wrong@example.com",
            "password": "testpassword123"
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_invalid_password(self, client, test_user_data):
        """Test login with wrong password."""
        # Register user
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Try to login with wrong password
        response = client.post("/api/v1/users/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_inactive_user(self, client, test_user_data, db):
        """Test login with inactive user account."""
        # Register user
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Deactivate user
        user = db.query(User).filter(User.email == test_user_data["email"]).first()
        user.is_active = False
        db.commit()
        
        # Try to login
        response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user account" in response.json()["detail"]


class TestUserMe:
    """Test get current user endpoint."""
    
    def test_get_current_user_success(self, client, test_user_data):
        """Test getting current user with valid token."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
    
    def test_get_current_user_no_token(self, client):
        """Test getting current user without token."""
        response = client.get("/api/v1/users/me")
        assert response.status_code == 403  # FastAPI HTTPBearer returns 403 if no token is provided
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserList:
    """Test get all users endpoint."""
    
    def test_get_users_success(self, client, test_user_data):
        """Test getting all users."""
        # Register a user
        client.post("/api/v1/users/register", json=test_user_data)
        
        # Get all users
        response = client.get("/api/v1/users/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == test_user_data["email"]
        assert "password" not in data[0]  # Password should not be returned 
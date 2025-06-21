import pytest
from fastapi import status
from app.models.module import Module
from app.models.lesson import Lesson


class TestModuleList:
    """Test get all modules endpoint."""
    
    def test_get_modules_success(self, client, test_user_data):
        """Test getting all modules."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get modules
        response = client.get("/api/v1/modules/", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
    
    def test_get_modules_unauthorized(self, client):
        """Test getting modules without authentication."""
        response = client.get("/api/v1/modules/")
        assert response.status_code == 403  # FastAPI HTTPBearer returns 403


class TestModuleDetail:
    """Test get specific module endpoint."""
    
    def test_get_module_success(self, client, test_user_data, db):
        """Test getting a specific module."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a module
        module_data = {"title": "Test Module", "order": 1}
        create_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = create_response.json()["id"]
        
        # Get the module
        response = client.get(f"/api/v1/modules/{module_id}", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["title"] == module_data["title"]
        assert data["order"] == module_data["order"]
        assert "lesson_count" in data
    
    def test_get_module_not_found(self, client, test_user_data):
        """Test getting a non-existent module."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get non-existent module
        fake_id = "12345678-1234-1234-1234-123456789012"
        response = client.get(f"/api/v1/modules/{fake_id}", headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_module_invalid_id(self, client, test_user_data):
        """Test getting module with invalid ID format."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get module with invalid ID
        response = client.get("/api/v1/modules/invalid-id", headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestModuleCreate:
    """Test create module endpoint."""
    
    def test_create_module_success(self, client, test_user_data):
        """Test creating a module successfully."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create module
        module_data = {"title": "New Module", "order": 1}
        response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["title"] == module_data["title"]
        assert data["order"] == module_data["order"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_module_duplicate_order(self, client, test_user_data):
        """Test creating module with duplicate order."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create first module
        module_data = {"title": "First Module", "order": 1}
        client.post("/api/v1/modules/", json=module_data, headers=headers)
        
        # Try to create second module with same order
        module_data2 = {"title": "Second Module", "order": 1}
        response = client.post("/api/v1/modules/", json=module_data2, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"]
    
    def test_create_module_missing_fields(self, client, test_user_data):
        """Test creating module with missing required fields."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create module with missing fields
        response = client.post("/api/v1/modules/", json={"title": "Incomplete"}, headers=headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestModuleUpdate:
    """Test update module endpoint."""
    
    def test_update_module_success(self, client, test_user_data):
        """Test updating a module successfully."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a module
        module_data = {"title": "Original Title", "order": 1}
        create_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = create_response.json()["id"]
        
        # Update the module
        update_data = {"title": "Updated Title", "order": 2}
        response = client.put(f"/api/v1/modules/{module_id}", json=update_data, headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["order"] == update_data["order"]
    
    def test_update_module_not_found(self, client, test_user_data):
        """Test updating a non-existent module."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to update non-existent module
        fake_id = "12345678-1234-1234-1234-123456789012"
        update_data = {"title": "Updated Title"}
        response = client.put(f"/api/v1/modules/{fake_id}", json=update_data, headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestModuleDelete:
    """Test delete module endpoint."""
    
    def test_delete_module_success(self, client, test_user_data):
        """Test deleting a module successfully."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a module
        module_data = {"title": "Module to Delete", "order": 1}
        create_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = create_response.json()["id"]
        
        # Delete the module
        response = client.delete(f"/api/v1/modules/{module_id}", headers=headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify module is deleted
        get_response = client.get(f"/api/v1/modules/{module_id}", headers=headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_module_not_found(self, client, test_user_data):
        """Test deleting a non-existent module."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to delete non-existent module
        fake_id = "12345678-1234-1234-1234-123456789012"
        response = client.delete(f"/api/v1/modules/{fake_id}", headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND 
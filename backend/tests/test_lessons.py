import pytest
from fastapi import status
from app.models.module import Module
from app.models.lesson import Lesson


class TestLessonList:
    """Test get all lessons endpoint."""
    
    def test_get_lessons_success(self, client, test_user_data):
        """Test getting all lessons."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get lessons
        response = client.get("/api/v1/lessons/", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
    
    def test_get_lessons_by_module(self, client, test_user_data):
        """Test getting lessons filtered by module."""
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
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Get lessons for this module
        response = client.get(f"/api/v1/lessons/?module_id={module_id}", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
    
    def test_get_lessons_invalid_module_id(self, client, test_user_data):
        """Test getting lessons with invalid module ID."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get lessons with invalid module ID
        response = client.get("/api/v1/lessons/?module_id=invalid-id", headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_get_lessons_unauthorized(self, client):
        """Test getting lessons without authentication."""
        response = client.get("/api/v1/lessons/")
        assert response.status_code == 403  # FastAPI HTTPBearer returns 403


class TestLessonDetail:
    """Test get specific lesson endpoint."""
    
    def test_get_lesson_success(self, client, test_user_data):
        """Test getting a specific lesson."""
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
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Create a lesson
        lesson_data = {
            "title": "Test Lesson",
            "content": "This is the lesson content",
            "order": 1,
            "module_id": module_id
        }
        create_response = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        lesson_id = create_response.json()["id"]
        
        # Get the lesson
        response = client.get(f"/api/v1/lessons/{lesson_id}", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["title"] == lesson_data["title"]
        assert data["content"] == lesson_data["content"]
        assert data["order"] == lesson_data["order"]
        assert "exercise_count" in data
    
    def test_get_lesson_not_found(self, client, test_user_data):
        """Test getting a non-existent lesson."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get non-existent lesson
        fake_id = "12345678-1234-1234-1234-123456789012"
        response = client.get(f"/api/v1/lessons/{fake_id}", headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_lesson_invalid_id(self, client, test_user_data):
        """Test getting lesson with invalid ID format."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get lesson with invalid ID
        response = client.get("/api/v1/lessons/invalid-id", headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestLessonCreate:
    """Test create lesson endpoint."""
    
    def test_create_lesson_success(self, client, test_user_data):
        """Test creating a lesson successfully."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a module first
        module_data = {"title": "Test Module", "order": 1}
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Create lesson
        lesson_data = {
            "title": "New Lesson",
            "content": "This is the lesson content",
            "order": 1,
            "module_id": module_id
        }
        response = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["title"] == lesson_data["title"]
        assert data["content"] == lesson_data["content"]
        assert data["order"] == lesson_data["order"]
        assert data["module_id"] == module_id
        assert "id" in data
        assert "created_at" in data
    
    def test_create_lesson_module_not_found(self, client, test_user_data):
        """Test creating lesson with non-existent module."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create lesson with non-existent module
        fake_module_id = "12345678-1234-1234-1234-123456789012"
        lesson_data = {
            "title": "New Lesson",
            "content": "This is the lesson content",
            "order": 1,
            "module_id": fake_module_id
        }
        response = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Module not found" in response.json()["detail"]
    
    def test_create_lesson_duplicate_order(self, client, test_user_data):
        """Test creating lesson with duplicate order in same module."""
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
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Create first lesson
        lesson_data = {
            "title": "First Lesson",
            "content": "First lesson content",
            "order": 1,
            "module_id": module_id
        }
        client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        
        # Try to create second lesson with same order
        lesson_data2 = {
            "title": "Second Lesson",
            "content": "Second lesson content",
            "order": 1,
            "module_id": module_id
        }
        response = client.post("/api/v1/lessons/", json=lesson_data2, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.json()["detail"]
    
    def test_create_lesson_missing_fields(self, client, test_user_data):
        """Test creating lesson with missing required fields."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create lesson with missing fields
        response = client.post("/api/v1/lessons/", json={"title": "Incomplete"}, headers=headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLessonUpdate:
    """Test update lesson endpoint."""
    
    def test_update_lesson_success(self, client, test_user_data):
        """Test updating a lesson successfully."""
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
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Create a lesson
        lesson_data = {
            "title": "Original Title",
            "content": "Original content",
            "order": 1,
            "module_id": module_id
        }
        create_response = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        lesson_id = create_response.json()["id"]
        
        # Update the lesson
        update_data = {"title": "Updated Title", "content": "Updated content", "order": 2}
        response = client.put(f"/api/v1/lessons/{lesson_id}", json=update_data, headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["content"] == update_data["content"]
        assert data["order"] == update_data["order"]
    
    def test_update_lesson_not_found(self, client, test_user_data):
        """Test updating a non-existent lesson."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to update non-existent lesson
        fake_id = "12345678-1234-1234-1234-123456789012"
        update_data = {"title": "Updated Title"}
        response = client.put(f"/api/v1/lessons/{fake_id}", json=update_data, headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestLessonDelete:
    """Test delete lesson endpoint."""
    
    def test_delete_lesson_success(self, client, test_user_data):
        """Test deleting a lesson successfully."""
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
        module_response = client.post("/api/v1/modules/", json=module_data, headers=headers)
        module_id = module_response.json()["id"]
        
        # Create a lesson
        lesson_data = {
            "title": "Lesson to Delete",
            "content": "Lesson content",
            "order": 1,
            "module_id": module_id
        }
        create_response = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
        lesson_id = create_response.json()["id"]
        
        # Delete the lesson
        response = client.delete(f"/api/v1/lessons/{lesson_id}", headers=headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify lesson is deleted
        get_response = client.get(f"/api/v1/lessons/{lesson_id}", headers=headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_lesson_not_found(self, client, test_user_data):
        """Test deleting a non-existent lesson."""
        # Register and login
        client.post("/api/v1/users/register", json=test_user_data)
        login_response = client.post("/api/v1/users/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to delete non-existent lesson
        fake_id = "12345678-1234-1234-1234-123456789012"
        response = client.delete(f"/api/v1/lessons/{fake_id}", headers=headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND 
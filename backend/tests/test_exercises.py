import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.exercise import Exercise
from app.models.lesson import Lesson
from app.models.module import Module
from app.schemas.exercise import ExerciseType
from tests.conftest import TestingSessionLocal
import uuid
import json

client = TestClient(app)


@pytest.fixture
def db():
    return TestingSessionLocal()


# Helper to register and login a user, returns auth headers
def get_auth_headers(client, user_data=None):
    if user_data is None:
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "testpassword123"
        }
    client.post("/api/v1/users/register", json=user_data)
    login_response = client.post("/api/v1/users/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }


@pytest.fixture
def test_module_data():
    return {
        "title": "Test Module",
        "order": 1
    }


@pytest.fixture
def test_lesson_data():
    return {
        "title": "Test Lesson",
        "content": "Test lesson content",
        "order": 1
    }


@pytest.fixture
def test_exercise_data():
    return {
        "title": "Test Exercise",
        "type": "multiple_choice",
        "prompt": "What is the subject of this sentence?",
        "content": {
            "correct_answer": "A",
            "options": ["A", "B", "C", "D"]
        },
        "order": 1
    }


# Helper to create a module via API
def create_test_module(client, auth_headers, module_data=None):
    if module_data is None:
        module_data = {
            "title": "Test Module",
            "order": 1
        }
    response = client.post("/api/v1/modules/", json=module_data, headers=auth_headers)
    return response.json()


# Helper to create a lesson via API
def create_test_lesson(client, auth_headers, module_id, lesson_data=None):
    if lesson_data is None:
        lesson_data = {
            "title": "Test Lesson",
            "content": "Test lesson content",
            "order": 1
        }
    # Create a copy of lesson_data to avoid modifying the original
    lesson_data_copy = lesson_data.copy()
    lesson_data_copy["module_id"] = module_id
    response = client.post("/api/v1/lessons/", json=lesson_data_copy, headers=auth_headers)
    return response.json()


# Helper to create an exercise via API
def create_test_exercise(client, auth_headers, lesson_id, exercise_data=None):
    if exercise_data is None:
        exercise_data = {
            "title": "Test Exercise",
            "type": "multiple_choice",
            "prompt": "What is the subject of this sentence?",
            "content": {
                "correct_answer": "A",
                "options": ["A", "B", "C", "D"]
            },
            "order": 1
        }
    # Add lesson_id to the exercise data
    exercise_data["lesson_id"] = lesson_id
    response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
    return response.json()


class TestExercisesAPI:
    """Test exercises API endpoints."""
    
    def test_get_exercises_empty(self, client, test_user_data):
        """Test getting exercises when none exist."""
        auth_headers = get_auth_headers(client, test_user_data)
        response = client.get("/api/v1/exercises/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_exercises_with_lesson_filter(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test getting exercises filtered by lesson_id."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        response = client.get(f"/api/v1/exercises/?lesson_id={lesson['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Exercise"
        assert data[0]["lesson_id"] == lesson["id"]
    
    def test_get_exercises_invalid_lesson_id(self, client, test_user_data):
        """Test getting exercises with invalid lesson_id."""
        auth_headers = get_auth_headers(client, test_user_data)
        response = client.get("/api/v1/exercises/?lesson_id=invalid-uuid", headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]
    
    def test_get_exercises_nonexistent_lesson(self, client, test_user_data):
        """Test getting exercises for non-existent lesson."""
        auth_headers = get_auth_headers(client, test_user_data)
        fake_lesson_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/exercises/?lesson_id={fake_lesson_id}", headers=auth_headers)
        assert response.status_code == 404
        assert "Lesson not found" in response.json()["detail"]
    
    def test_get_exercise_success(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test getting a specific exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        response = client.get(f"/api/v1/exercises/{exercise['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == exercise["id"]
        assert data["title"] == "Test Exercise"
        assert data["type"] == "multiple_choice"
    
    def test_get_exercise_invalid_id(self, client, test_user_data):
        """Test getting exercise with invalid ID."""
        auth_headers = get_auth_headers(client, test_user_data)
        response = client.get("/api/v1/exercises/invalid-uuid", headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid exercise ID format" in response.json()["detail"]
    
    def test_get_exercise_not_found(self, client, test_user_data):
        """Test getting non-existent exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        fake_exercise_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/exercises/{fake_exercise_id}", headers=auth_headers)
        assert response.status_code == 404
        assert "Exercise not found" in response.json()["detail"]
    
    def test_create_exercise_success(self, client, test_user_data, test_module_data, test_lesson_data):
        """Test creating a new exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module and lesson via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        
        exercise_data = {
            "title": "New Exercise",
            "type": "multiple_choice",
            "prompt": "Choose the correct answer",
            "content": {
                "correct_answer": "B",
                "options": ["A", "B", "C", "D"]
            },
            "order": 1,
            "lesson_id": lesson["id"]
        }
        response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Exercise"
        assert data["type"] == "multiple_choice"
        assert data["lesson_id"] == lesson["id"]
    
    def test_create_exercise_invalid_lesson(self, client, test_user_data):
        """Test creating exercise with invalid lesson_id."""
        auth_headers = get_auth_headers(client, test_user_data)
        exercise_data = {
            "title": "New Exercise",
            "type": "multiple_choice",
            "prompt": "Choose the correct answer",
            "content": {
                "correct_answer": "B",
                "options": ["A", "B", "C", "D"]
            },
            "order": 1,
            "lesson_id": str(uuid.uuid4())
        }
        response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert response.status_code == 404
        assert "Lesson not found" in response.json()["detail"]
    
    def test_create_exercise_duplicate_order(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test creating exercise with duplicate order in same lesson."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and first exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        # Try to create another exercise with the same order
        exercise_data = {
            "title": "Duplicate Order Exercise",
            "type": "multiple_choice",
            "prompt": "Choose the correct answer",
            "content": {
                "correct_answer": "B",
                "options": ["A", "B", "C", "D"]
            },
            "order": 1,
            "lesson_id": lesson["id"]
        }
        response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert response.status_code == 400
        assert "already exists in this lesson" in response.json()["detail"]
    
    def test_create_exercise_invalid_content(self, client, test_user_data, test_module_data, test_lesson_data):
        """Test creating exercise with invalid content structure."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module and lesson via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        
        exercise_data = {
            "title": "Invalid Exercise",
            "type": "multiple_choice",
            "prompt": "Choose the correct answer",
            "content": {
                "wrong_field": "value"
            },
            "order": 2,
            "lesson_id": lesson["id"]
        }
        response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid answer format" in response.json()["detail"]
    
    def test_update_exercise_success(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test updating an exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        update_data = {
            "title": "Updated Exercise",
            "prompt": "Updated prompt"
        }
        response = client.put(f"/api/v1/exercises/{exercise['id']}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Exercise"
        assert data["prompt"] == "Updated prompt"
        assert data["type"] == "multiple_choice"
    
    def test_update_exercise_not_found(self, client, test_user_data):
        """Test updating non-existent exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        fake_exercise_id = str(uuid.uuid4())
        update_data = {"title": "Updated Exercise"}
        response = client.put(f"/api/v1/exercises/{fake_exercise_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 404
        assert "Exercise not found" in response.json()["detail"]
    
    def test_update_exercise_invalid_id(self, client, test_user_data):
        """Test updating exercise with invalid ID."""
        auth_headers = get_auth_headers(client, test_user_data)
        update_data = {"title": "Updated Exercise"}
        response = client.put("/api/v1/exercises/invalid-uuid", json=update_data, headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid exercise ID format" in response.json()["detail"]
    
    def test_delete_exercise_success(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test deleting an exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        response = client.delete(f"/api/v1/exercises/{exercise['id']}", headers=auth_headers)
        assert response.status_code == 204
        
        # Verify exercise is deleted
        get_response = client.get(f"/api/v1/exercises/{exercise['id']}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_exercise_not_found(self, client, test_user_data):
        """Test deleting non-existent exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        fake_exercise_id = str(uuid.uuid4())
        response = client.delete(f"/api/v1/exercises/{fake_exercise_id}", headers=auth_headers)
        assert response.status_code == 404
        assert "Exercise not found" in response.json()["detail"]
    
    def test_submit_exercise_correct_answer(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test submitting correct answer for exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        submission_data = {
            "answer": {"selected_option": "A"},
            "time_spent": 30
        }
        response = client.post(f"/api/v1/exercises/{exercise['id']}/submit", json=submission_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["exercise_id"] == exercise["id"]
        assert data["is_correct"] is True
        assert data["score"] == 1.0
        assert data["time_spent"] == 30
    
    def test_submit_exercise_incorrect_answer(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test submitting incorrect answer for exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        submission_data = {
            "answer": {"selected_option": "B"},
            "time_spent": 45
        }
        response = client.post(f"/api/v1/exercises/{exercise['id']}/submit", json=submission_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["exercise_id"] == exercise["id"]
        assert data["is_correct"] is False
        assert data["score"] == 0.0
        assert data["time_spent"] == 45
    
    def test_submit_exercise_invalid_answer_format(self, client, test_user_data, test_module_data, test_lesson_data, test_exercise_data):
        """Test submitting invalid answer format."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module, lesson, and exercise via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        exercise = create_test_exercise(client, auth_headers, lesson["id"], test_exercise_data)
        
        submission_data = {
            "answer": {"wrong_field": "value"},
            "time_spent": 30
        }
        response = client.post(f"/api/v1/exercises/{exercise['id']}/submit", json=submission_data, headers=auth_headers)
        assert response.status_code == 400
        assert "Invalid answer format" in response.json()["detail"]
    
    def test_submit_exercise_not_found(self, client, test_user_data):
        """Test submitting answer for non-existent exercise."""
        auth_headers = get_auth_headers(client, test_user_data)
        fake_exercise_id = str(uuid.uuid4())
        submission_data = {
            "answer": {"selected_option": "A"},
            "time_spent": 30
        }
        response = client.post(f"/api/v1/exercises/{fake_exercise_id}/submit", json=submission_data, headers=auth_headers)
        assert response.status_code == 404
        assert "Exercise not found" in response.json()["detail"]


class TestExerciseTypes:
    """Test different exercise types."""
    
    def test_identification_exercise(self, client, test_user_data, test_module_data, test_lesson_data):
        """Test identification exercise creation and submission."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module and lesson via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        
        exercise_data = {
            "title": "Identify Parts of Speech",
            "type": "identification",
            "prompt": "Identify the part of speech for each word",
            "content": {
                "correct_identifications": {
                    "word1": "noun",
                    "word2": "verb",
                    "word3": "adjective"
                }
            },
            "order": 1,
            "lesson_id": lesson["id"]
        }
        create_response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert create_response.status_code == 201
        exercise_id = create_response.json()["id"]
        
        submission_data = {
            "answer": {
                "identifications": {
                    "word1": "noun",
                    "word2": "verb",
                    "word3": "adjective"
                }
            },
            "time_spent": 60
        }
        submit_response = client.post(f"/api/v1/exercises/{exercise_id}/submit", json=submission_data, headers=auth_headers)
        assert submit_response.status_code == 200
        data = submit_response.json()
        assert data["is_correct"] is True
        assert data["score"] == 1.0
    
    def test_fill_in_blank_exercise(self, client, test_user_data, test_module_data, test_lesson_data):
        """Test fill-in-blank exercise creation and submission."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module and lesson via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        
        exercise_data = {
            "title": "Fill in the Blanks",
            "type": "fill_in_blank",
            "prompt": "Fill in the missing words",
            "content": {
                "correct_answers": {
                    "blank1": "is",
                    "blank2": "running"
                }
            },
            "order": 2,
            "lesson_id": lesson["id"]
        }
        create_response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert create_response.status_code == 201
        exercise_id = create_response.json()["id"]
        
        submission_data = {
            "answer": {
                "answers": {
                    "blank1": "is",
                    "blank2": "running"
                }
            },
            "time_spent": 45
        }
        submit_response = client.post(f"/api/v1/exercises/{exercise_id}/submit", json=submission_data, headers=auth_headers)
        assert submit_response.status_code == 200
        data = submit_response.json()
        assert data["is_correct"] is True
        assert data["score"] == 1.0
    
    def test_sentence_construction_exercise(self, client, test_user_data, test_module_data, test_lesson_data):
        """Test sentence construction exercise creation and submission."""
        auth_headers = get_auth_headers(client, test_user_data)
        
        # Create module and lesson via API
        module = create_test_module(client, auth_headers, test_module_data)
        lesson = create_test_lesson(client, auth_headers, module["id"], test_lesson_data)
        
        exercise_data = {
            "title": "Construct the Sentence",
            "type": "sentence_construction",
            "prompt": "Arrange the words in correct order",
            "content": {
                "words": ["The", "cat", "is", "sleeping"],
                "correct_order": ["The", "cat", "is", "sleeping"]
            },
            "order": 3,
            "lesson_id": lesson["id"]
        }
        create_response = client.post("/api/v1/exercises/", json=exercise_data, headers=auth_headers)
        assert create_response.status_code == 201
        exercise_id = create_response.json()["id"]
        
        submission_data = {
            "answer": {
                "word_order": ["The", "cat", "is", "sleeping"]
            },
            "time_spent": 90
        }
        submit_response = client.post(f"/api/v1/exercises/{exercise_id}/submit", json=submission_data, headers=auth_headers)
        assert submit_response.status_code == 200
        data = submit_response.json()
        assert data["is_correct"] is True
        assert data["score"] == 1.0 
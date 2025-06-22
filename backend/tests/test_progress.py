import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.progress import ProgressStatus
from app.schemas.progress import ProgressCreate, ProgressUpdate
from app.models.user import User
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.db.base import get_db

client = TestClient(app)

@pytest.fixture
def user_token(client, db):
    # Register and login a user, return the token
    user_data = {"email": "progressuser@example.com", "password": "testpass", "name": "Progress User"}
    client.post("/api/v1/users/register", json=user_data)
    resp = client.post("/api/v1/users/login", json={"email": user_data["email"], "password": user_data["password"]})
    token = resp.json()["access_token"]
    return token

@pytest.fixture
def module_and_lesson(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_data = {"title": "Progress Module", "description": "desc", "order": 1}
    module_resp = client.post("/api/v1/modules/", json=module_data, headers=headers)
    print("MODULE STATUS:", module_resp.status_code)
    print("MODULE BODY:", module_resp.json())
    module_id = module_resp.json()["id"]
    lesson_data = {"title": "Progress Lesson", "content": "content", "module_id": module_id, "order": 1}
    lesson_resp = client.post("/api/v1/lessons/", json=lesson_data, headers=headers)
    print("LESSON STATUS:", lesson_resp.status_code)
    print("LESSON BODY:", lesson_resp.json())
    lesson_id = lesson_resp.json()["id"]
    return module_id, lesson_id

@pytest.fixture
def exercises(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    _, lesson_id = module_and_lesson
    ex1 = {"lesson_id": lesson_id, "type": "multiple_choice", "question": "Q1", "options": ["A", "B"], "answer": "A"}
    ex2 = {"lesson_id": lesson_id, "type": "fill_in_blank", "question": "Q2", "answer": "B"}
    client.post("/api/v1/exercises/", json=ex1, headers=headers)
    client.post("/api/v1/exercises/", json=ex2, headers=headers)


def test_create_progress(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress for module
    resp = client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    print("PROGRESS STATUS:", resp.status_code)
    print("PROGRESS BODY:", resp.json())
    assert resp.status_code == 201
    data = resp.json()
    assert data["module_id"] == module_id
    assert data["status"] == "in_progress"
    # Create progress for lesson
    resp2 = client.post("/api/v1/progress/", json={"lesson_id": lesson_id, "status": "not_started"}, headers=headers)
    assert resp2.status_code == 201
    data2 = resp2.json()
    assert data2["lesson_id"] == lesson_id
    assert data2["status"] == "not_started"

def test_get_progress(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress
    resp = client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    progress_id = resp.json()["id"]
    # Get progress
    get_resp = client.get(f"/api/v1/progress/{progress_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == progress_id

def test_update_progress(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress
    resp = client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    progress_id = resp.json()["id"]
    # Update progress
    update = {"status": "completed"}
    up_resp = client.put(f"/api/v1/progress/{progress_id}", json=update, headers=headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["status"] == "completed"

def test_delete_progress(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress
    resp = client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    progress_id = resp.json()["id"]
    # Delete progress
    del_resp = client.delete(f"/api/v1/progress/{progress_id}", headers=headers)
    assert del_resp.status_code == 204
    # Ensure deleted
    get_resp = client.get(f"/api/v1/progress/{progress_id}", headers=headers)
    assert get_resp.status_code == 404

def test_progress_summary(client, user_token, module_and_lesson, exercises):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress for module and lesson
    client.post("/api/v1/progress/", json={"module_id": module_id, "status": "completed"}, headers=headers)
    client.post("/api/v1/progress/", json={"lesson_id": lesson_id, "status": "completed"}, headers=headers)
    # Update lesson progress with completed exercises
    progress_list = client.get("/api/v1/progress/", headers=headers).json()
    lesson_progress = [p for p in progress_list if p["lesson_id"] == lesson_id][0]
    client.put(f"/api/v1/progress/{lesson_progress['id']}", json={"completed_exercises": 2}, headers=headers)
    # Get summary
    resp = client.get("/api/v1/progress/summary", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["completed_modules"] >= 1
    assert data["completed_lessons"] >= 1
    assert data["completed_exercises"] >= 2
    assert "overall_progress_percentage" in data
    assert isinstance(data["module_progress"], list)

def test_progress_duplicate_entry(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Create progress
    client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    # Try to create duplicate
    resp = client.post("/api/v1/progress/", json={"module_id": module_id, "status": "in_progress"}, headers=headers)
    assert resp.status_code == 400
    assert "already exists" in resp.json()["detail"]

def test_progress_update_or_create(client, user_token, module_and_lesson):
    headers = {"Authorization": f"Bearer {user_token}"}
    module_id, lesson_id = module_and_lesson
    # Use /update endpoint to create
    resp = client.post("/api/v1/progress/update", params={"module_id": module_id, "status": "in_progress"}, headers=headers)
    assert resp.status_code == 200
    # Use /update endpoint to update
    resp2 = client.post("/api/v1/progress/update", params={"module_id": module_id, "status": "completed"}, headers=headers)
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "completed" 
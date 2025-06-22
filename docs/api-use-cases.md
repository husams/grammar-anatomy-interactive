# API Use Cases

This document outlines the use cases for the Grammar Anatomy Interactive API.

## User Management

### User Registration
- **Use Case:** A new user creates an account.
- **Endpoint:** `POST /api/users/register`
- **Request Body:** `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`
- **Response:** `{ "userId": "12345", "token": "jwt_token" }`

### User Login
- **Use Case:** An existing user logs in to their account.
- **Endpoint:** `POST /api/users/login`
- **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** `{ "userId": "12345", "token": "jwt_token" }`

### View User Progress
- **Use Case:** A logged-in user wants to view their progress.
- **Endpoint:** `GET /api/users/progress`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "modules": [ ... ], "achievements": [ ... ], "overallProgress": 0.5 }`

## Learning Content

### List All Modules
- **Use Case:** A user wants to see all available learning modules.
- **Endpoint:** `GET /api/modules`
- **Response:** `[ { "id": "1", "title": "Nouns & Verbs", "status": "in_progress" }, ... ]`

### View a Specific Module
- **Use Case:** A user selects a module to see its lessons.
- **Endpoint:** `GET /api/modules/:id`
- **Response:** `{ "id": "1", "title": "Nouns & Verbs", "lessons": [ ... ] }`

### View a Specific Lesson
- **Use Case:** A user opens a lesson to view its content.
- **Endpoint:** `GET /api/lessons/:id`
- **Response:** `{ "id": "101", "title": "Action Verbs", "content": "...", "exercises": [ ... ] }`

## Exercises and Assessments

### Submit an Exercise
- **Use Case:** A user submits an answer to an exercise.
- **Endpoint:** `POST /api/exercises/:id/submit`
- **Request Body:** `{ "answer": "some answer" }`
- **Response:** `{ "correct": true, "feedback": "Well done!" }`

### View Exercise History
- **Use Case:** A user wants to review their past exercise performance.
- **Endpoint:** `GET /api/exercises/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `[ { "exerciseId": "201", "result": "correct", "timestamp": "..." }, ... ]`

## Reference Tools

### Search the Glossary
- **Use Case:** A user searches for a grammatical term in the glossary.
- **Endpoint:** `GET /api/glossary?query=term`
- **Response:** `[ { "term": "Predicate", "definition": "..." }, ... ]`

### View a Glossary Term
- **Use Case:** A user wants to see the definition and related lessons for a specific term.
- **Endpoint:** `GET /api/glossary/:term`
- **Response:** `{ "term": "Predicate", "definition": "...", "relatedLessons": [ ... ] }`

## Interactive Tools

### Parse a Sentence
- **Use Case:** A user enters a sentence to see its grammatical breakdown.
- **Endpoint:** `POST /api/anatomy-lab/parse`
- **Request Body:** `{ "sentence": "The quick brown fox jumps over the lazy dog." }`
- **Response:** `{ "diagram": { ... }, "components": [ ... ] }`

### Ask the AI Guru
- **Use Case:** A user asks a grammar-related question.
- **Endpoint:** `POST /api/ai-guru/ask`
- **Request Body:** `{ "question": "What is the difference between a gerund and a participle?" }`
- **Response:** `{ "answer": "...", "links": [ ... ] }`

## Accessibility

### Text-to-Speech
- **Use Case:** A user requests audio playback for a piece of text.
- **Endpoint:** `POST /api/tts/speak`
- **Request Body:** `{ "text": "The quick brown fox jumps over the lazy dog." }`
- **Response:** `{ "audioUrl": "..." }`

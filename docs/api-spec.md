# API Specification — Grammar Anatomy Interactive

## User Endpoints

### Register
- **POST** `/api/users/register`
- **Body:** `{ "email": "string", "password": "string", "name": "string" }`
- **Response:** `{ "userId": "string", "token": "string" }`

### Login
- **POST** `/api/users/login`
- **Body:** `{ "email": "string", "password": "string" }`
- **Response:** `{ "userId": "string", "token": "string" }`

### Get Progress
- **GET** `/api/users/progress`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "modules": [ ... ], "achievements": [ ... ], "overallProgress": 0.34 }`

---

## Modules & Lessons

### List Modules
- **GET** `/api/modules`
- **Response:** `[ { "id": "1", "title": "Nouns & Verbs", "status": "in_progress" }, ... ]`

### Get Module Details
- **GET** `/api/modules/:id`
- **Response:** `{ "id": "1", "title": "Nouns & Verbs", "lessons": [ ... ] }`

### Get Lesson
- **GET** `/api/lessons/:id`
- **Response:** `{ "id": "101", "title": "Action Verbs", "content": "...", "exercises": [ ... ] }`

---

## Exercises

### Submit Exercise Answer
- **POST** `/api/exercises/:id/submit`
- **Body:** `{ "answer": "string" }`
- **Response:** `{ "correct": true, "feedback": "Great job!" }`

### Get Exercise History
- **GET** `/api/exercises/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `[ { "exerciseId": "201", "result": "correct", "timestamp": "..." }, ... ]`

---

## Glossary

### Search Glossary
- **GET** `/api/glossary?query=term`
- **Response:** `[ { "term": "Predicate", "definition": "..." }, ... ]`

### Get Glossary Term
- **GET** `/api/glossary/:term`
- **Response:** `{ "term": "Predicate", "definition": "...", "relatedLessons": [ ... ] }`

---

## Anatomy Lab

### Parse Sentence
- **POST** `/api/anatomy-lab/parse`
- **Body:** `{ "sentence": "string" }`
- **Response:** `{ "diagram": { ... }, "components": [ ... ] }`

---

## AI Guru

### Ask a Question
- **POST** `/api/ai-guru/ask`
- **Body:** `{ "question": "string", "context": "optional" }`
- **Response:** `{ "answer": "string", "links": [ ... ] }`

---

## TTS (Text-to-Speech)

### Request Audio
- **POST** `/api/tts/speak`
- **Body:** `{ "text": "string" }`
- **Response:** `{ "audioUrl": "string" }` 
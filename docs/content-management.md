# Content Management — Grammar Anatomy Interactive

## Content Structure
- **Lessons, exercises, and glossary entries** are stored as Markdown or JSON files in the repository or a headless CMS.
- Each module (chapter) has its own directory with lesson and exercise files.
- Glossary is a single file or collection of entries.

## Example Directory
```text
content/
  modules/
    01-nouns-verbs/
      lesson.md
      exercises.json
    02-pronouns/
      lesson.md
      exercises.json
  glossary.json
```

## Example Lesson File (Markdown)
```markdown
---
title: "Nouns & Verbs"
order: 1
---

# Nouns & Verbs

A noun is ...
```

## Example Exercises File (JSON)
```json
[
  {
    "id": "ex1",
    "type": "identification",
    "prompt": "Identify the action verb in the sentence: Pearl painted Mr. Morton's porch.",
    "answer": "painted"
  },
  {
    "id": "ex2",
    "type": "multiple_choice",
    "prompt": "Classify the following sentence: My family owned a cocker spaniel when I was young.",
    "options": ["Simple", "Compound", "Complex", "Compound-Complex"],
    "answer": "Simple"
  }
]
```

## Example Glossary File (JSON)
```json
[
  { "term": "Predicate", "definition": "The part of a sentence or clause containing a verb and stating something about the subject." },
  { "term": "Clause", "definition": "A group of words with a subject and a verb." }
]
```

## Update & Versioning Workflow
- Content updates are made via pull requests or CMS admin interface.
- Each content file includes metadata (title, order, version, etc.).
- Versioning is tracked via git or CMS history.
- Content can be updated independently of app releases. 
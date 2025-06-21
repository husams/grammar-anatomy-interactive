# Frontend Structure — Grammar Anatomy Interactive

## Directory Layout

```text
grammar-anatomy-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SkillChart.tsx
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── Flashcard.tsx
│   │   │   ├── SentenceDiagram.tsx
│   │   │   ├── AudioButton.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Modules.tsx
│   │   │   ├── Module.tsx
│   │   │   ├── LessonPage.tsx
│   │   │   ├── ExercisePage.tsx
│   │   │   ├── AnatomyLab.tsx
│   │   │   ├── AIGuru.tsx
│   │   │   ├── Glossary.tsx
│   │   │   └── Review.tsx
│   │   ├── contexts/
│   │   │   ├── ProgressContext.tsx
│   │   │   ├── UserContext.tsx
│   │   │   └── ChatContext.tsx
│   │   ├── data/
│   │   │   ├── modules.ts
│   │   │   ├── lessons.ts
│   │   │   └── glossary.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
└── docs/
    └── ...
```

## Main Components & Pages

- **Sidebar/Navigation:** App navigation, module links, user info.
- **Dashboard:** Progress, skill mastery, achievements.
- **Modules/Module/Lesson/Exercise Pages:** Learning flow, interactive content.
- **AnatomyLab:** Sentence parsing and diagramming.
- **AIGuru:** AI-powered Q&A chatbot.
- **Glossary:** Searchable grammar terms.
- **Review:** Flashcard review of weak concepts.

## State Management
- **Contexts:**
  - `ProgressContext`: Tracks user progress, module/lesson status.
  - `UserContext`: User info, authentication state.
  - `ChatContext`: AI Guru chat state.
- **Local State:** For UI interactions, exercise answers, etc.

## Responsibilities
- **Components:** Reusable UI elements (charts, badges, diagrams, etc.)
- **Pages:** Route-level screens for each major feature.
- **Contexts:** Provide global state and actions to components/pages.
- **Data:** Static or fetched content (modules, lessons, glossary).
- **Types:** TypeScript types for safety and clarity. 
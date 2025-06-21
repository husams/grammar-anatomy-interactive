// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Module types
export interface Module {
  id: string;
  title: string;
  order: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

// Lesson types
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
}

// Exercise types
export interface Exercise {
  id: string;
  lessonId: string;
  type:
    | 'identification'
    | 'multiple_choice'
    | 'fill_blank'
    | 'sentence_construction';
  prompt: string;
  answer: string;
  options?: string[];
}

// Progress types
export interface Progress {
  id: string;
  userId: string;
  moduleId?: string;
  lessonId?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: Date;
}

// Achievement types
export interface Achievement {
  id: string;
  userId: string;
  type: string;
  earnedAt: Date;
}

// Glossary types
export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedLessons?: string[];
}

// Chat history types
export interface ChatMessage {
  id: string;
  userId: string;
  question: string;
  answer: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Exercise result types
export interface ExerciseResult {
  exerciseId: string;
  result: 'correct' | 'incorrect';
  timestamp: Date;
  feedback?: string;
}

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

// Dashboard-specific types
export interface ModuleProgressDetail {
  module_id: string;
  module_title: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface UserProgressSummary {
  total_modules: number;
  completed_modules: number;
  total_lessons: number;
  completed_lessons: number;
  total_exercises: number;
  completed_exercises: number;
  overall_progress_percentage: number;
  module_progress: ModuleProgressDetail[];
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  progressSummary: UserProgressSummary;
  modules: Module[];
  isLoading: boolean;
  error: string | null;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  enabled: boolean;
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

// Dashboard state types
export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

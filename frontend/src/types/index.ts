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

// Exercise types (comprehensive implementation)
export type ExerciseType = 'multiple_choice' | 'fill_in_blank' | 'identification' | 'sentence_construction';

export interface Exercise {
  id: string;
  lesson_id: string;
  title: string;
  type: ExerciseType;
  prompt: string;
  content: ExerciseContent;
  order: number;
  created_at: string;
}

export interface ExerciseContent {
  // Multiple Choice
  options?: string[];
  correct_answer?: string | number;
  
  // Fill in Blank
  text?: string;
  blanks?: Array<{
    id: string;
    position: number;
    correct_answers: string[];
    case_sensitive?: boolean;
  }>;
  
  // Identification
  target_text?: string;
  target_elements?: Array<{
    id: string;
    text: string;
    type: string;
    explanation: string;
  }>;
  
  // Sentence Construction
  words?: string[];
  correct_sentence?: string;
  alternative_correct?: string[];
}

export interface ExerciseSubmission {
  answer: ExerciseAnswer;
  time_spent?: number;
}

export interface ExerciseAnswer {
  // Multiple Choice
  selected_option?: string | number;
  
  // Fill in Blank
  blank_answers?: Record<string, string>;
  
  // Identification
  identified_elements?: string[];
  
  // Sentence Construction
  constructed_sentence?: string;
}

export interface ExerciseResult {
  exercise_id: string;
  user_id: string;
  answer: ExerciseAnswer;
  is_correct: boolean;
  score: number; // 0-1
  feedback: ExerciseFeedback;
  time_spent?: number;
  submitted_at: string;
}

export interface ExerciseFeedback {
  message: string;
  explanation?: string;
  correct_answer?: ExerciseAnswer;
  hints?: string[];
  next_steps?: {
    action: 'retry' | 'continue' | 'review';
    message: string;
  };
}

export interface ExerciseState {
  current_exercise: Exercise | null;
  user_answer: ExerciseAnswer | null;
  result: ExerciseResult | null;
  is_loading: boolean;
  error: string | null;
  time_started: Date | null;
  attempts: number;
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

// Legacy exercise result types (deprecated - use ExerciseResult from exercise types above)
export interface LegacyExerciseResult {
  exerciseId: string;
  result: 'correct' | 'incorrect';
  timestamp: Date;
  legacyFeedback?: string;
}

// Dashboard state types
export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

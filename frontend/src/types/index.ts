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
  lesson_count: number;
  created_at: string;
  description?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number; // minutes
}

export interface ModuleDetail extends Module {
  exercise_count: number;
  learning_objectives: string[];
  prerequisites: string[];
  lessons: LessonSummary[];
  updated_at: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  duration: number; // minutes
  lesson_type: 'content' | 'exercise' | 'quiz' | 'practice';
  is_locked: boolean;
  description: string;
}

export interface ModuleProgress {
  module_id: string;
  user_id: string;
  overall_progress: number; // 0-1
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  lessons_completed: number;
  total_lessons: number;
  exercises_completed: number;
  total_exercises: number;
  time_spent: number; // minutes
  estimated_time_remaining: number; // minutes
  last_accessed_lesson?: {
    lesson_id: string;
    lesson_title: string;
    position: number;
  };
  lesson_progress: LessonProgress[];
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_date?: string;
  time_spent: number;
  score?: number; // 0-1 for exercises
}

export interface RelatedModules {
  prerequisites: Array<{
    id: string;
    title: string;
    is_completed: boolean;
  }>;
  recommended_next: Array<{
    id: string;
    title: string;
    difficulty: string;
    estimated_duration: number;
  }>;
  related_topics: Array<{
    id: string;
    title: string;
    similarity_score: number;
  }>;
}

export interface ModuleDetailState {
  module: ModuleDetail | null;
  progress: ModuleProgress | null;
  relatedModules: RelatedModules | null;
  isLoading: boolean;
  error: string | null;
  isNavigating: boolean;
}

export interface ModuleProgressDetail {
  module_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
  last_accessed?: string;
  estimated_completion_time?: number;
}

export interface ModuleWithProgress extends Module {
  progress: ModuleProgressDetail;
}

export interface ModuleFilters {
  search: string;
  status: 'all' | 'not_started' | 'in_progress' | 'completed';
  difficulty?: 'all' | 'beginner' | 'intermediate' | 'advanced';
  sortBy: 'order' | 'title' | 'progress' | 'last_accessed';
  sortDirection: 'asc' | 'desc';
}

export interface ModulesListState {
  modules: Module[];
  modulesWithProgress: ModuleWithProgress[];
  filters: ModuleFilters;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  totalCount: number;
}

export interface ModuleSearchParams {
  search?: string;
  status?: 'all' | 'not_started' | 'in_progress' | 'completed';
  sortBy?: 'order' | 'title' | 'progress' | 'last_accessed';
  sortDirection?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

// Lesson types
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
  exercise_count?: number;
}

export interface LessonNavigation {
  previousLessonId: string | null;
  nextLessonId: string | null;
  moduleId: string;
  moduleTitle: string;
}

export interface LessonState {
  lesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
  readingProgress: number; // 0-100%
  timeSpent: number; // minutes
  isCompleted: boolean;
  navigationInfo: LessonNavigation | null;
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
  title: string;
  description: string;
  earned_date: string;
}

// Dashboard-specific types  
export interface DashboardModuleProgress {
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
  module_progress: DashboardModuleProgress[];
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

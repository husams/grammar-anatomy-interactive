import ApiClient from '../utils/apiClient';
import { Lesson, LessonNavigation, ApiResponse } from '../types';

interface LessonWithNavigation extends Lesson {
  navigation?: LessonNavigation;
}

export class LessonService {
  /**
   * Fetch a lesson by ID with full metadata
   */
  static async getLessonById(lessonId: string): Promise<ApiResponse<Lesson>> {
    try {
      const response = await ApiClient.get<Lesson>(`/lessons/${lessonId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all lessons for a specific module (for navigation)
   */
  static async getLessonsByModule(moduleId: string): Promise<ApiResponse<Lesson[]>> {
    try {
      const response = await ApiClient.get<Lesson[]>(`/lessons/?module_id=${moduleId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch module lessons: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get lesson with navigation information (prev/next lessons)
   */
  static async getLessonWithNavigation(lessonId: string): Promise<ApiResponse<LessonWithNavigation>> {
    try {
      // First get the lesson
      const lessonResponse = await this.getLessonById(lessonId);
      const lesson = lessonResponse.data;

      // Then get all lessons in the same module for navigation
      const moduleId = lesson.module_id;
      const moduleLessonsResponse = await this.getLessonsByModule(moduleId);
      const allLessons = moduleLessonsResponse.data;

      // Sort lessons by order
      const sortedLessons = allLessons.sort((a, b) => a.order - b.order);
      
      // Find current lesson index
      const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
      
      // Determine previous and next lessons
      const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

      // Get module info for breadcrumb
      const moduleResponse = await ApiClient.get(`/modules/${moduleId}`);
      const moduleTitle = moduleResponse.data.title;

      const navigation: LessonNavigation = {
        previousLessonId: previousLesson?.id || null,
        nextLessonId: nextLesson?.id || null,
        moduleId: moduleId,
        moduleTitle: moduleTitle
      };

      const lessonWithNavigation: LessonWithNavigation = {
        ...lesson,
        navigation
      };

      return {
        data: lessonWithNavigation,
        message: lessonResponse.message
      };
    } catch (error) {
      throw new Error(`Failed to fetch lesson with navigation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update lesson progress (completion status)
   */
  static async updateLessonProgress(
    lessonId: string, 
    isCompleted: boolean, 
    timeSpent?: number,
    readingProgress?: number
  ): Promise<ApiResponse<any>> {
    try {
      const progressData = {
        is_completed: isCompleted,
        time_spent: timeSpent,
        reading_progress: readingProgress,
        completed_at: isCompleted ? new Date().toISOString() : null
      };

      const response = await ApiClient.post(`/progress/lesson/${lessonId}`, progressData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update lesson progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get lesson progress for a specific lesson
   */
  static async getLessonProgress(lessonId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiClient.get(`/progress/lesson/${lessonId}`);
      return response;
    } catch (error) {
      // Progress might not exist yet, return default
      return {
        data: {
          is_completed: false,
          time_spent: 0,
          reading_progress: 0
        }
      };
    }
  }

  /**
   * Mark lesson as started (for progress tracking)
   */
  static async markLessonStarted(lessonId: string): Promise<void> {
    try {
      await ApiClient.post(`/progress/lesson/${lessonId}/start`, {
        started_at: new Date().toISOString()
      });
    } catch (error) {
      // Fail silently for progress tracking
      console.warn('Failed to mark lesson as started:', error);
    }
  }

  /**
   * Calculate estimated reading time based on content length
   */
  static calculateReadingTime(content: string): number {
    // Average reading speed: 200-250 words per minute
    // Using 225 words per minute
    const wordsPerMinute = 225;
    const wordCount = content.split(/\s+/).length;
    const estimatedMinutes = Math.ceil(wordCount / wordsPerMinute);
    
    // Minimum 1 minute, maximum 30 minutes for a single lesson
    return Math.min(Math.max(estimatedMinutes, 1), 30);
  }

  /**
   * Parse lesson content for interactive features
   */
  static parseInteractiveContent(content: string): {
    content: string;
    examples: Array<{
      id: string;
      text: string;
      explanation?: string;
    }>;
    terms: Array<{
      term: string;
      definition?: string;
    }>;
  } {
    // For now, return content as-is
    // This would be enhanced to identify examples and terms
    return {
      content,
      examples: [],
      terms: []
    };
  }

  /**
   * Format lesson content for display (add IDs to examples, etc.)
   */
  static formatContentForDisplay(content: string): string {
    // Add unique IDs to example blocks for interactivity
    // This would be enhanced with proper markdown parsing
    return content;
  }
}

export default LessonService;
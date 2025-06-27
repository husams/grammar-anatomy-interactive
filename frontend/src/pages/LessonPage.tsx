import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LessonState } from '../types';
import InteractiveMarkdown from '../components/InteractiveMarkdown';
import LessonService from '../services/lessonService';

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<Date | null>(null);

  const [state, setState] = useState<LessonState>({
    lesson: null,
    isLoading: true,
    error: null,
    readingProgress: 0,
    timeSpent: 0,
    isCompleted: false,
    navigationInfo: null,
  });

  // Handle lesson completion
  const handleCompleteLesson = useCallback(async () => {
    if (!id || state.isCompleted) return;

    try {
      await LessonService.updateLessonProgress(
        id, 
        true, 
        state.timeSpent, 
        state.readingProgress
      );
      
      setState(prev => ({ ...prev, isCompleted: true }));
    } catch (error) {
      // Silently handle completion error - lesson can still be marked complete locally
      setState(prev => ({ ...prev, isCompleted: true }));
    }
  }, [id, state.isCompleted, state.timeSpent, state.readingProgress]);

  // Track reading progress based on scroll
  const updateReadingProgress = useCallback(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const windowHeight = window.innerHeight;
    const documentHeight = element.scrollHeight;
    const scrollTop = window.scrollY;
    const trackLength = documentHeight - windowHeight;
    
    const progress = trackLength > 0 ? Math.min((scrollTop / trackLength) * 100, 100) : 100;
    
    setState(prev => ({ ...prev, readingProgress: progress }));

    // Auto-complete lesson when 90% read and minimum time spent
    if (progress >= 90 && state.timeSpent >= 2 && !state.isCompleted) {
      handleCompleteLesson();
    }
  }, [state.timeSpent, state.isCompleted, handleCompleteLesson]);

  // Track time spent in lesson
  useEffect(() => {
    startTimeRef.current = new Date();
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const timeSpentMinutes = (Date.now() - startTimeRef.current.getTime()) / (1000 * 60);
        setState(prev => ({ ...prev, timeSpent: timeSpentMinutes }));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add scroll listener for reading progress
  useEffect(() => {
    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, [updateReadingProgress]);

  // Fetch lesson data
  const fetchLessonData = useCallback(async () => {
    if (!id) {
      setState(prev => ({ 
        ...prev, 
        error: 'Lesson ID is required', 
        isLoading: false 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch lesson with navigation info
      const response = await LessonService.getLessonWithNavigation(id);
      const lessonData = response.data;

      // Mark lesson as started for progress tracking
      await LessonService.markLessonStarted(id);

      // Get existing progress
      const progressResponse = await LessonService.getLessonProgress(id);
      const progressData = progressResponse.data;

      setState(prev => ({
        ...prev,
        lesson: lessonData,
        navigationInfo: lessonData.navigation || null,
        isCompleted: progressData.is_completed || false,
        readingProgress: progressData.reading_progress || 0,
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load lesson',
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  // Navigation handlers
  const handlePreviousLesson = () => {
    if (state.navigationInfo?.previousLessonId) {
      navigate(`/lessons/${state.navigationInfo.previousLessonId}`);
    }
  };

  const handleNextLesson = () => {
    if (state.navigationInfo?.nextLessonId) {
      navigate(`/lessons/${state.navigationInfo.nextLessonId}`);
    }
  };

  const handleBackToModule = () => {
    if (state.navigationInfo?.moduleId) {
      navigate(`/modules/${state.navigationInfo.moduleId}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && state.navigationInfo?.previousLessonId) {
        event.preventDefault();
        handlePreviousLesson();
      } else if (event.key === 'ArrowRight' && state.navigationInfo?.nextLessonId) {
        event.preventDefault();
        handleNextLesson();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.navigationInfo, handlePreviousLesson, handleNextLesson]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Lesson
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{state.error}</p>
            <div className="space-x-3">
              <button
                onClick={fetchLessonData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/modules')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Back to Modules
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No lesson found
  if (!state.lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Lesson Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The lesson you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => navigate('/modules')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  const lesson = state.lesson;
  const estimatedReadingTime = LessonService.calculateReadingTime(lesson.content);

  return (
    <div className="min-h-screen lesson-container">
      {/* Enhanced Reading Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${state.readingProgress}%` }}
        />
      </div>

      {/* Floating Progress Indicator */}
      {state.readingProgress > 0 && (
        <div className="floating-progress">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(state.readingProgress)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link 
              to="/modules" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Modules
            </Link>
            <span>›</span>
            {state.navigationInfo && (
              <>
                <button
                  onClick={handleBackToModule}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {state.navigationInfo.moduleTitle}
                </button>
                <span>›</span>
              </>
            )}
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {lesson.title}
            </span>
          </div>
        </nav>

        {/* Enhanced Lesson Header */}
        <header className="lesson-header mb-12">
          <div className="text-center">
            <h1 className="lesson-title text-5xl font-bold mb-4 text-white">
              {lesson.title}
            </h1>
            <div className="lesson-subtitle mb-6 text-blue-100">
              Master the fundamentals of grammar construction
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-blue-100">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{estimatedReadingTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lesson {lesson.order}</span>
              </div>
              {lesson.exercise_count && lesson.exercise_count > 0 && (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>{lesson.exercise_count} exercises</span>
                </div>
              )}
              {state.isCompleted && (
                <div className="flex items-center space-x-2 bg-green-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-300 font-medium">Completed</span>
                </div>
              )}
            </div>
            
            {/* Complete Lesson Button */}
            {!state.isCompleted && state.readingProgress > 50 && (
              <div className="mt-6">
                <button
                  onClick={handleCompleteLesson}
                  className="nav-button bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Mark Complete</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Enhanced Lesson Content */}
        <main 
          ref={contentRef}
          className="lesson-content-card"
        >
          <InteractiveMarkdown 
            content={lesson.content}
            className="lesson-content-spacing"
          />
        </main>

        {/* Enhanced Lesson Navigation */}
        <nav className="lesson-content-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
              {state.navigationInfo?.previousLessonId ? (
                <button
                  onClick={handlePreviousLesson}
                  className="nav-button nav-button-secondary w-full md:w-auto"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}
            </div>

            <div className="flex-1 text-center w-full md:w-auto">
              <button
                onClick={handleBackToModule}
                className="nav-button nav-button-secondary w-full md:w-auto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back to Module</span>
              </button>
            </div>

            <div className="flex-1 text-right w-full md:w-auto">
              {state.navigationInfo?.nextLessonId ? (
                <button
                  onClick={handleNextLesson}
                  className="nav-button ml-auto w-full md:w-auto"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </nav>

        {/* Enhanced Progress Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="lesson-content-card text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(state.readingProgress)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress
            </div>
          </div>
          
          {state.timeSpent > 0 && (
            <div className="lesson-content-card text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(state.timeSpent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Minutes
              </div>
            </div>
          )}
          
          <div className="lesson-content-card text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {lesson.exercise_count || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Exercises
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage; 
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LessonState } from '../types';
import ReactMarkdown from 'react-markdown';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${state.readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

        {/* Lesson Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {lesson.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Lesson {lesson.order}</span>
                <span>•</span>
                <span>{estimatedReadingTime} min read</span>
                {lesson.exercise_count && lesson.exercise_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{lesson.exercise_count} exercises</span>
                  </>
                )}
                {state.isCompleted && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ Completed
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Complete Lesson Button */}
            {!state.isCompleted && state.readingProgress > 50 && (
              <button
                onClick={handleCompleteLesson}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Mark Complete
              </button>
            )}
          </div>
        </header>

        {/* Lesson Content */}
        <main 
          ref={contentRef}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <div className="prose prose-lg max-w-none dark:prose-invert 
                         prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                         prose-p:text-gray-700 dark:prose-p:text-gray-300
                         prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                         prose-code:text-blue-600 dark:prose-code:text-blue-400
                         prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </main>

        {/* Lesson Navigation */}
        <nav className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex-1">
            {state.navigationInfo?.previousLessonId ? (
              <button
                onClick={handlePreviousLesson}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Previous Lesson</span>
              </button>
            ) : (
              <div></div>
            )}
          </div>

          <div className="flex-1 text-center">
            <button
              onClick={handleBackToModule}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Back to Module
            </button>
          </div>

          <div className="flex-1 text-right">
            {state.navigationInfo?.nextLessonId ? (
              <button
                onClick={handleNextLesson}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-auto"
              >
                <span>Next Lesson</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </nav>

        {/* Progress Info */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {state.timeSpent > 0 && (
            <span>Time spent: {Math.round(state.timeSpent)} minutes</span>
          )}
          {state.readingProgress > 0 && (
            <span className="ml-4">
              Progress: {Math.round(state.readingProgress)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage; 
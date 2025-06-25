import React from 'react';
import { LessonSummary, ModuleProgress, LessonProgress } from '../../types';

interface LessonsListProps {
  lessons: LessonSummary[] | undefined | null;
  progress: ModuleProgress | null;
  onLessonSelect: (lessonId: string, isLocked: boolean) => void;
  isNavigating: boolean;
}

const LessonsList: React.FC<LessonsListProps> = ({ 
  lessons = [], 
  progress, 
  onLessonSelect, 
  isNavigating 
}) => {
  // Ensure lessons is an array
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  
  const getLessonProgress = (lessonId: string): LessonProgress | null => {
    return progress?.lesson_progress?.find(lp => lp.lesson_id === lessonId) || null;
  };

  const getLessonIcon = (lesson: LessonSummary, lessonProgress: LessonProgress | null) => {
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold";
    
    if (lesson.is_locked) {
      return (
        <div className={`${baseClasses} bg-gray-400 dark:bg-gray-600`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (lessonProgress?.status === 'completed') {
      return (
        <div className={`${baseClasses} bg-green-500`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (lessonProgress?.status === 'in_progress') {
      return (
        <div className={`${baseClasses} bg-blue-500`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Check if this is the current lesson (next available lesson)
    const isCurrentLesson = progress?.last_accessed_lesson?.lesson_id === lesson.id;
    if (isCurrentLesson) {
      return (
        <div className={`${baseClasses} bg-blue-500 ring-2 ring-blue-300`}>
          {lesson.order}
        </div>
      );
    }

    return (
      <div className={`${baseClasses} bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300`}>
        {lesson.order}
      </div>
    );
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      case 'practice':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Lessons ({safeLessons.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Complete lessons in order to unlock new content
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {safeLessons.map((lesson) => {
          const lessonProgress = getLessonProgress(lesson.id);
          const isCurrentLesson = progress?.last_accessed_lesson?.lesson_id === lesson.id;
          
          return (
            <div
              key={lesson.id}
              className={`p-6 transition-colors duration-200 ${
                lesson.is_locked 
                  ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' 
                  : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${
                isCurrentLesson ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onLessonSelect(lesson.id, lesson.is_locked)}
              role="button"
              tabIndex={lesson.is_locked ? -1 : 0}
              aria-disabled={lesson.is_locked}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !lesson.is_locked) {
                  e.preventDefault();
                  onLessonSelect(lesson.id, lesson.is_locked);
                }
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Lesson Icon */}
                {getLessonIcon(lesson, lessonProgress)}

                {/* Lesson Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-lg font-medium ${
                        lesson.is_locked 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {lesson.title}
                      </h4>
                      
                      {/* Lesson Type Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.is_locked
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {getLessonTypeIcon(lesson.lesson_type)}
                        <span className="ml-1">
                          {lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)}
                        </span>
                      </span>
                    </div>

                    {/* Duration */}
                    <div className={`text-sm ${
                      lesson.is_locked 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {formatDuration(lesson.duration)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`mt-1 text-sm ${
                    lesson.is_locked 
                      ? 'text-gray-400 dark:text-gray-500' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {lesson.description}
                  </p>

                  {/* Progress Information */}
                  {lessonProgress && (
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      {lessonProgress.completion_date && (
                        <span className="text-green-600 dark:text-green-400">
                          Completed {new Date(lessonProgress.completion_date).toLocaleDateString()}
                        </span>
                      )}
                      {lessonProgress.time_spent > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDuration(lessonProgress.time_spent)} spent
                        </span>
                      )}
                      {lessonProgress.score !== undefined && (
                        <span className="text-blue-600 dark:text-blue-400">
                          Score: {Math.round(lessonProgress.score * 100)}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Locked Message */}
                  {lesson.is_locked && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Complete previous lessons to unlock
                    </div>
                  )}
                </div>

                {/* Navigation Arrow */}
                {!lesson.is_locked && (
                  <div className={`transition-transform duration-200 ${
                    isNavigating ? 'animate-pulse' : 'group-hover:translate-x-1'
                  }`}>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonsList;
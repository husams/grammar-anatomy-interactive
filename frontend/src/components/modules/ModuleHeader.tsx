import React from 'react';
import { ModuleDetail, ModuleProgress } from '../../types';

interface ModuleHeaderProps {
  module: ModuleDetail;
  progress: ModuleProgress | null;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ module, progress }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadge = () => {
    if (!progress) return null;

    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    
    switch (progress.status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            In Progress
          </span>
        );
      case 'mastered':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Mastered
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-lg shadow-lg overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Module {module.order}
              </span>
              {getStatusBadge()}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {module.title}
            </h1>
            
            {module.description && (
              <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                {module.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="text-center sm:text-left">
            <div className="text-blue-200 text-sm font-medium">Difficulty</div>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty_level)}`}>
                {module.difficulty_level ? module.difficulty_level.charAt(0).toUpperCase() + module.difficulty_level.slice(1) : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-blue-200 text-sm font-medium">Duration</div>
            <div className="text-white font-semibold mt-1">
              {module.estimated_duration ? `${Math.ceil(module.estimated_duration / 60)} hours` : 'Varies'}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-blue-200 text-sm font-medium">Lessons</div>
            <div className="text-white font-semibold mt-1">
              {module.lesson_count} lessons
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-blue-200 text-sm font-medium">Exercises</div>
            <div className="text-white font-semibold mt-1">
              {module.exercise_count} exercises
            </div>
          </div>
        </div>

        {/* Progress Bar (if progress exists) */}
        {progress && progress.overall_progress > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress.overall_progress * 100)}% complete</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                style={{ width: `${progress.overall_progress * 100}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress.overall_progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Module progress: ${Math.round(progress.overall_progress * 100)}% complete`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleHeader;
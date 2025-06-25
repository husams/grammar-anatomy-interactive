import React from 'react';
import { ModuleProgress } from '../../types';

interface ModuleActionsProps {
  progress: ModuleProgress | null;
  onStartModule: () => void;
  onContinueModule: () => void;
  isNavigating: boolean;
}

const ModuleActions: React.FC<ModuleActionsProps> = ({
  progress,
  onStartModule,
  onContinueModule,
  isNavigating
}) => {
  const getActionButton = () => {
    if (!progress || progress.status === 'not_started') {
      return (
        <button
          onClick={onStartModule}
          disabled={isNavigating}
          className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
            isNavigating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isNavigating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Module
            </>
          )}
        </button>
      );
    }

    if (progress.status === 'completed') {
      return (
        <button
          onClick={onContinueModule}
          disabled={isNavigating}
          className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
            isNavigating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isNavigating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Review Module
            </>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={onContinueModule}
        disabled={isNavigating}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
          isNavigating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isNavigating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Continuing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Continue Module
          </>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Quick Actions
      </h3>
      
      <div className="space-y-4">
        {getActionButton()}
        
        {progress && progress.status !== 'not_started' && (
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress.overall_progress > 0 && (
                <div className="mb-1">
                  {Math.round(progress.overall_progress * 100)}% completed
                </div>
              )}
              {progress.last_accessed_lesson && (
                <div>
                  Last lesson: {progress.last_accessed_lesson.lesson_title}
                </div>
              )}
            </div>
          </div>
        )}
        
        {progress && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Module Status
              </div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                progress.status === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : progress.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : progress.status === 'mastered'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {progress.status === 'completed' && 'Completed'}
                {progress.status === 'in_progress' && 'In Progress'}
                {progress.status === 'mastered' && 'Mastered'}
                {progress.status === 'not_started' && 'Not Started'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleActions;
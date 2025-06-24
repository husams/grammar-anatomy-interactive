import React from 'react';
import { Link } from 'react-router-dom';
import { Module, ModuleProgressDetail } from '../../types';

interface ModulesListProps {
  modules: Module[];
  moduleProgress: ModuleProgressDetail[];
  isLoading?: boolean;
}

const ModulesList: React.FC<ModulesListProps> = ({ 
  modules, 
  moduleProgress, 
  isLoading = false 
}) => {
  // Merge modules with their progress data
  const modulesWithProgress = modules.map(module => {
    const progress = moduleProgress.find(p => p.module_id === module.id);
    return {
      ...module,
      progress: progress ? {
        total_lessons: progress.total_lessons,
        completed_lessons: progress.completed_lessons,
        progress_percentage: progress.progress_percentage,
        status: progress.status,
      } : {
        total_lessons: 0,
        completed_lessons: 0,
        progress_percentage: 0,
        status: 'not_started' as const,
      }
    };
  }).sort((a, b) => a.order - b.order);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Not Started
          </span>
        );
    }
  };

  const getModuleIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center flex-1">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Grammar Modules
        </h2>
        <Link 
          to="/modules"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
        >
          View All →
        </Link>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modulesWithProgress.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No modules available yet</p>
          </div>
        ) : (
          modulesWithProgress.map((module) => (
            <Link
              key={module.id}
              to={`/modules/${module.id}`}
              className="block group"
            >
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                {/* Module Icon */}
                <div className="flex-shrink-0 mr-4">
                  {getModuleIcon(module.progress.status)}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {module.title}
                    </h3>
                    {getStatusBadge(module.progress.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {module.progress.completed_lessons} of {module.progress.total_lessons} lessons completed
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(module.progress.progress_percentage)}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        module.progress.status === 'completed' 
                          ? 'bg-green-500' 
                          : module.progress.status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${module.progress.progress_percentage}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(module.progress.progress_percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${module.title} progress: ${Math.round(module.progress.progress_percentage)}%`}
                    ></div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0 ml-4">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {modulesWithProgress.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {moduleProgress.filter(m => m.status === 'completed').length} of {modulesWithProgress.length} modules completed
            </span>
            <Link 
              to="/modules"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesList;
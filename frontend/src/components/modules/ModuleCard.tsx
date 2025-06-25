import React from 'react';
import { Link } from 'react-router-dom';
import { ModuleWithProgress } from '../../types';
import { ModuleService } from '../../services/moduleService';

interface ModuleCardProps {
  module: ModuleWithProgress;
  onClick?: (module: ModuleWithProgress) => void;
  className?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, className = '' }) => {
  const { progress } = module;
  const displayData = ModuleService.formatModuleForDisplay(module);
  
  const getStatusBadge = () => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (progress.status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            In Progress
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM8 13a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
            Not Started
          </span>
        );
    }
  };

  const getDifficultyBadge = () => {
    if (!module.difficulty_level) return null;
    
    const colorClass = ModuleService.getDifficultyColor(module.difficulty_level);
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {module.difficulty_level.charAt(0).toUpperCase() + module.difficulty_level.slice(1)}
      </span>
    );
  };

  const getProgressBar = () => {
    const percentage = progress.progress_percentage;
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
              progress.status === 'completed' 
                ? 'bg-green-500' 
                : progress.status === 'in_progress' 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            }`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Module progress: ${percentage}% complete`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{progress.completed_lessons} of {progress.total_lessons} lessons</span>
          {progress.estimated_completion_time && progress.estimated_completion_time > 0 && (
            <span>{Math.ceil(progress.estimated_completion_time / 60)} min left</span>
          )}
        </div>
      </div>
    );
  };

  const cardClasses = `
    group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
    shadow-sm hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer
    focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
    hover:border-blue-300 dark:hover:border-blue-600
    transform hover:-translate-y-1 active:translate-y-0 active:scale-98
    ${className}
  `;

  const handleCardClick = () => {
    if (onClick) {
      onClick(module);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article 
      className={cardClasses}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-labelledby={`module-title-${module.id}`}
      aria-describedby={`module-description-${module.id}`}
    >
      <div className="p-6">
        {/* Header with title and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 
              id={`module-title-${module.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {displayData.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {displayData.subtitle} • {displayData.duration}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end ml-4">
            {getStatusBadge()}
            {getDifficultyBadge()}
          </div>
        </div>

        {/* Description */}
        <p 
          id={`module-description-${module.id}`}
          className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2"
        >
          {displayData.description}
        </p>

        {/* Progress Section */}
        {getProgressBar()}

        {/* Action Link */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/modules/${module.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            {progress.status === 'completed' ? 'Review Module' : 
             progress.status === 'in_progress' ? 'Continue Learning' : 
             'Start Module'}
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Last accessed indicator */}
        {progress.last_accessed && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Recently accessed" />
          </div>
        )}
      </div>
    </article>
  );
};

export default React.memo(ModuleCard);
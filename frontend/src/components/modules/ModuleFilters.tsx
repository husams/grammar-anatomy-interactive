import React from 'react';
import { ModuleFilters as IModuleFilters } from '../../types';

interface ModuleFiltersProps {
  filters: IModuleFilters;
  onFiltersChange: (filters: Partial<IModuleFilters>) => void;
  totalCount: number;
  filteredCount: number;
  disabled?: boolean;
  className?: string;
}

const ModuleFilters: React.FC<ModuleFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  disabled = false,
  className = ''
}) => {
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ 
      status: event.target.value as IModuleFilters['status'] 
    });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDirection] = event.target.value.split('_');
    onFiltersChange({ 
      sortBy: sortBy as IModuleFilters['sortBy'],
      sortDirection: sortDirection as IModuleFilters['sortDirection']
    });
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ 
      difficulty: event.target.value as IModuleFilters['difficulty'] 
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      difficulty: 'all',
      sortBy: 'order',
      sortDirection: 'asc'
    });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.difficulty !== 'all';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex-1">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={handleStatusChange}
            disabled={disabled}
            className={`
              block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <option value="all">All Modules</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex-1">
          <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            value={filters.difficulty || 'all'}
            onChange={handleDifficultyChange}
            disabled={disabled}
            className={`
              block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1">
          <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            id="sort-filter"
            value={`${filters.sortBy}_${filters.sortDirection}`}
            onChange={handleSortChange}
            disabled={disabled}
            className={`
              block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <option value="order_asc">Order (1-10)</option>
            <option value="order_desc">Order (10-1)</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="progress_asc">Progress (Low-High)</option>
            <option value="progress_desc">Progress (High-Low)</option>
            <option value="last_accessed_desc">Recently Accessed</option>
            <option value="last_accessed_asc">Least Recent</option>
          </select>
        </div>
      </div>

      {/* Filter Summary and Clear Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredCount === totalCount ? (
            <span>Showing all {totalCount} modules</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalCount} modules
              {hasActiveFilters && ' (filtered)'}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={disabled}
            className={`
              inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600
              shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Search: &ldquo;{filters.search}&rdquo;
              <button
                type="button"
                onClick={() => onFiltersChange({ search: '' })}
                className="ml-1 inline-flex items-center justify-center w-3 h-3 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              >
                <span className="sr-only">Remove search filter</span>
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Status: {filters.status.replace('_', ' ')}
              <button
                type="button"
                onClick={() => onFiltersChange({ status: 'all' })}
                className="ml-1 inline-flex items-center justify-center w-3 h-3 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
              >
                <span className="sr-only">Remove status filter</span>
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z" />
                </svg>
              </button>
            </span>
          )}

          {filters.difficulty && filters.difficulty !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Level: {filters.difficulty}
              <button
                type="button"
                onClick={() => onFiltersChange({ difficulty: 'all' })}
                className="ml-1 inline-flex items-center justify-center w-3 h-3 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
              >
                <span className="sr-only">Remove difficulty filter</span>
                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleFilters;
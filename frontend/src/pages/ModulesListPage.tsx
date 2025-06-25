import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ModuleWithProgress, 
  ModuleFilters as IModuleFilters, 
  ModulesListState
} from '../types';
import { ModuleService } from '../services/moduleService';
import { ProgressService } from '../services/progressService';
import ModuleCard from '../components/modules/ModuleCard';
import ModuleSearch from '../components/modules/ModuleSearch';
import ModuleFilters from '../components/modules/ModuleFilters';
import ModulesLoadingSkeleton from '../components/modules/ModulesLoadingSkeleton';
import ModulesErrorBoundary from '../components/modules/ModulesErrorBoundary';

const ModulesListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<ModulesListState>({
    modules: [],
    modulesWithProgress: [],
    filters: {
      search: '',
      status: 'all',
      difficulty: 'all',
      sortBy: 'order',
      sortDirection: 'asc'
    },
    isLoading: true,
    error: null,
    searchQuery: '',
    totalCount: 0
  });

  // Load modules and progress data
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load modules and progress in parallel
      const [modulesResult, progressSummary] = await Promise.all([
        ModuleService.getModules({
          search: state.filters.search || undefined,
          sortBy: state.filters.sortBy,
          sortDirection: state.filters.sortDirection
        }),
        ModuleService.getUserProgressSummary()
      ]);

      const modulesWithProgress = ProgressService.mergeModulesWithProgress(
        modulesResult.data,
        progressSummary.module_progress
      );

      // Cache modules for performance
      ModuleService.cacheModules(modulesResult.data);

      setState(prev => ({
        ...prev,
        modules: modulesResult.data,
        modulesWithProgress,
        totalCount: modulesResult.total,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error('Failed to load modules:', error);
      
      // Try to use cached data as fallback
      const cachedModules = ModuleService.getCachedModules();
      if (cachedModules) {
        const modulesWithProgress = ProgressService.mergeModulesWithProgress(
          cachedModules,
          [] // No progress data available
        );
        
        setState(prev => ({
          ...prev,
          modules: cachedModules,
          modulesWithProgress,
          totalCount: cachedModules.length,
          isLoading: false,
          error: 'Using cached data. Some information may be outdated.'
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load modules'
        }));
      }
    }
  }, [state.filters.search, state.filters.sortBy, state.filters.sortDirection]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort modules based on current filters
  const filteredModules = useMemo(() => {
    let filtered = ProgressService.filterModules(
      state.modulesWithProgress,
      state.filters.search,
      state.filters.status
    );

    // Apply difficulty filter
    if (state.filters.difficulty && state.filters.difficulty !== 'all') {
      filtered = filtered.filter(module => 
        module.difficulty_level === state.filters.difficulty
      );
    }

    // Apply sorting
    return ProgressService.sortModulesWithProgress(
      filtered,
      state.filters.sortBy,
      state.filters.sortDirection
    );
  }, [state.modulesWithProgress, state.filters]);

  // Update search query with debouncing
  const handleSearchChange = useCallback((searchValue: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, search: searchValue },
      searchQuery: searchValue
    }));
  }, []);

  // Update filters
  const handleFiltersChange = useCallback((newFilters: Partial<IModuleFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  // Handle module card click
  const handleModuleClick = useCallback((module: ModuleWithProgress) => {
    navigate(`/modules/${module.id}`);
  }, [navigate]);

  // Handle retry for errors
  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  // Get overall progress stats
  const overallStats = useMemo(() => {
    return ProgressService.getOverallStats(state.modulesWithProgress);
  }, [state.modulesWithProgress]);

  // Render empty state
  const renderEmptyState = () => {
    const hasActiveFilters = state.filters.search || state.filters.status !== 'all' || state.filters.difficulty !== 'all';
    
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {hasActiveFilters ? 'No modules match your filters' : 'No modules available'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {hasActiveFilters 
            ? 'Try adjusting your search or filter criteria.' 
            : 'Modules will appear here once they are added to the system.'
          }
        </p>
        {hasActiveFilters && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleFiltersChange({
                search: '',
                status: 'all',
                difficulty: 'all',
                sortBy: 'order',
                sortDirection: 'asc'
              })}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ModulesErrorBoundary onError={(error) => console.error('ModulesListPage error:', error)}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Grammar Modules
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore grammar concepts through interactive lessons and exercises
          </p>
          
          {/* Progress Summary */}
          {!state.isLoading && state.modulesWithProgress.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.totalModules}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.completedModules}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.inProgressModules}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{overallStats.overallProgress}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="space-y-6">
            {/* Search */}
            <ModuleSearch
              value={state.filters.search}
              onChange={handleSearchChange}
              disabled={state.isLoading}
              placeholder="Search modules by title or description..."
            />

            {/* Filters */}
            <ModuleFilters
              filters={state.filters}
              onFiltersChange={handleFiltersChange}
              totalCount={state.modulesWithProgress.length}
              filteredCount={filteredModules.length}
              disabled={state.isLoading}
            />
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-800 dark:text-red-200 underline hover:text-red-600 dark:hover:text-red-100"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {state.isLoading ? (
          <ModulesLoadingSkeleton count={6} />
        ) : filteredModules.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={handleModuleClick}
              />
            ))}
          </div>
        )}
      </div>
    </ModulesErrorBoundary>
  );
};

export default ModulesListPage; 
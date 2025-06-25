import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProgressSummary, Module, DashboardState } from '../types';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import ModulesList from '../components/dashboard/ModulesList';
import QuickActions from '../components/dashboard/QuickActions';
import LoadingStates from '../components/dashboard/LoadingStates';
import ErrorBoundary from '../components/dashboard/ErrorBoundary';
import ApiClient from '../utils/apiClient';

const DashboardPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchDashboardData = async () => {
    if (!token || !isAuthenticated) return;

    try {
      setDashboardState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch progress summary and modules in parallel
      const [progressResponse, modulesResponse] = await Promise.all([
        ApiClient.get<UserProgressSummary>('/progress/summary'),
        ApiClient.get<Module[]>('/modules/'),
      ]);
      
      const progressSummary = progressResponse.data;
      const modules = modulesResponse.data;

      setDashboardState({
        data: {
          user: {
            id: user!.id,
            name: user!.name,
            email: user!.email,
          },
          progressSummary,
          modules,
          isLoading: false,
          error: null,
        },
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, isAuthenticated]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (dashboardState.isLoading && !dashboardState.data) {
    return <LoadingStates />;
  }

  if (dashboardState.error && !dashboardState.data) {
    return (
      <ErrorBoundary
        error={dashboardState.error}
        onRetry={handleRetry}
      />
    );
  }

  if (!dashboardState.data) {
    return <div className="p-8 text-center">No dashboard data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {dashboardState.data.user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your progress and continue your grammar learning journey
          </p>
          {dashboardState.lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Last updated: {dashboardState.lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress and Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <ProgressOverview 
              progressSummary={dashboardState.data.progressSummary}
              isLoading={dashboardState.isLoading}
            />

            {/* Modules List */}
            <ModulesList 
              modules={dashboardState.data.modules}
              moduleProgress={dashboardState.data.progressSummary.module_progress}
              isLoading={dashboardState.isLoading}
            />
          </div>

          {/* Right Column - Quick Actions and Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions 
              modules={dashboardState.data.modules}
              progressSummary={dashboardState.data.progressSummary}
            />

            {/* Additional stats or achievements can go here */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Learning Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Modules</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {dashboardState.data.progressSummary.total_modules}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed Lessons</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {dashboardState.data.progressSummary.completed_lessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Exercises Done</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {dashboardState.data.progressSummary.completed_exercises}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error notification for partial failures */}
        {dashboardState.error && dashboardState.data && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Some data may be outdated due to connection issues. 
                  <button 
                    onClick={handleRetry}
                    className="ml-2 font-medium underline hover:no-underline"
                  >
                    Retry
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
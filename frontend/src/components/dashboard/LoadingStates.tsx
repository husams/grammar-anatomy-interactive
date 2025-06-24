import React from 'react';

const LoadingStates: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
        </div>

        {/* Main Dashboard Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/4 animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Modules List Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingStates;
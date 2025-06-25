import React from 'react';

const LoadingStates: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-lg h-64 animate-pulse">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 w-20 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="h-8 w-3/4 bg-gray-400 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-400 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-400 dark:bg-gray-600 rounded"></div>
          
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 bg-gray-400 dark:bg-gray-600 rounded"></div>
                <div className="h-6 w-20 bg-gray-400 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Learning Objectives Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lessons List Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 w-72 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Section Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-6">
              <div className="h-6 w-36 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
              
              {/* Circular Progress */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
              
              {/* Progress bars */}
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-6">
              <div className="h-6 w-28 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>

          {/* Related Modules Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingStates;
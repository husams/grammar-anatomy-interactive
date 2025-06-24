import React from 'react';

interface ErrorBoundaryProps {
  error: string;
  onRetry: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg 
              className="h-8 w-8 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Error Content */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Oops! Something went wrong
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load your dashboard data. This might be due to a network issue or server problem.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200 font-mono">
              {error}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
            >
              <svg 
                className="inline-block w-4 h-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
            >
              Refresh Page
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            If the problem persists, please check your internet connection or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
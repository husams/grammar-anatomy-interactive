import React from 'react';

interface ErrorBoundaryProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, onRetry, onBack }) => {
  const getErrorIcon = () => {
    if (error.toLowerCase().includes('not found')) {
      return (
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return (
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  const getErrorTitle = () => {
    if (error.toLowerCase().includes('not found')) {
      return 'Module Not Found';
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return 'Connection Error';
    }
    return 'Something Went Wrong';
  };

  const getErrorDescription = () => {
    if (error.toLowerCase().includes('not found')) {
      return 'The module you\'re looking for doesn\'t exist or may have been removed.';
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.';
    }
    return 'An unexpected error occurred while loading the module. Please try again.';
  };

  const getSuggestions = () => {
    if (error.toLowerCase().includes('not found')) {
      return [
        'Check the URL for any typos',
        'Browse all available modules',
        'Contact support if you believe this module should exist'
      ];
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ];
    }
    return [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if the problem persists'
    ];
  };

  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {getErrorIcon()}
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getErrorTitle()}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {getErrorDescription()}
        </p>

        {/* Error Details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 text-left">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error Details
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded">
                {error}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="text-left mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Try these suggestions:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
          
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Modules
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Still having trouble?{' '}
            <a 
              href="mailto:support@example.com" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
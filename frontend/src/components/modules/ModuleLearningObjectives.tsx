import React, { useState } from 'react';

interface ModuleLearningObjectivesProps {
  objectives: string[] | undefined | null;
}

const ModuleLearningObjectives: React.FC<ModuleLearningObjectivesProps> = ({ objectives = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ensure objectives is an array
  const safeObjectives = Array.isArray(objectives) ? objectives : [];
  
  if (safeObjectives.length === 0) {
    return null;
  }

  const displayObjectives = isExpanded ? safeObjectives : safeObjectives.slice(0, 3);
  const hasMore = safeObjectives.length > 3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Learning Objectives
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          What you&apos;ll learn in this module
        </p>
      </div>

      <div className="p-6">
        <ul className="space-y-3">
          {displayObjectives.map((objective, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {objective}
              </span>
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {isExpanded ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Show {safeObjectives.length - 3} more objective{safeObjectives.length - 3 > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleLearningObjectives;
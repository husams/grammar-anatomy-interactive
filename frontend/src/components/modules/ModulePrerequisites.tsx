import React from 'react';

interface ModulePrerequisitesProps {
  prerequisites: string[] | undefined | null;
}

const ModulePrerequisites: React.FC<ModulePrerequisitesProps> = ({ prerequisites = [] }) => {
  // Ensure prerequisites is an array
  const safePrerequisites = Array.isArray(prerequisites) ? prerequisites : [];
  
  if (safePrerequisites.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
            Prerequisites
          </h3>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          Complete these topics before starting this module
        </p>
      </div>

      <div className="p-6">
        <ul className="space-y-3">
          {safePrerequisites.map((prerequisite, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-amber-800 dark:text-amber-200 leading-relaxed">
                {prerequisite}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              While not strictly required, having knowledge of these topics will help you get the most out of this module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePrerequisites;
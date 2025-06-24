import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Module, UserProgressSummary } from '../../types';

interface QuickActionsProps {
  modules: Module[];
  progressSummary: UserProgressSummary;
}

const QuickActions: React.FC<QuickActionsProps> = ({ modules, progressSummary }) => {
  const navigate = useNavigate();

  // Find the first in-progress or not-started module for "Continue Learning"
  const getNextModule = () => {
    const inProgressModule = progressSummary.module_progress.find(
      m => m.status === 'in_progress'
    );
    
    if (inProgressModule) {
      return modules.find(m => m.id === inProgressModule.module_id);
    }
    
    const notStartedModule = progressSummary.module_progress.find(
      m => m.status === 'not_started'
    );
    
    if (notStartedModule) {
      return modules.find(m => m.id === notStartedModule.module_id);
    }
    
    return modules[0]; // Fallback to first module
  };

  const nextModule = getNextModule();

  const quickActions = [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      description: nextModule ? `Resume ${nextModule.title}` : 'Start your first lesson',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      action: () => {
        if (nextModule) {
          navigate(`/modules/${nextModule.id}`);
        } else {
          navigate('/modules');
        }
      },
      enabled: true,
    },
    {
      id: 'practice-quiz',
      title: 'Practice Quiz',
      description: 'Test your knowledge',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white',
      action: () => {
        // For now, navigate to modules as quiz feature isn't implemented yet
        navigate('/modules');
      },
      enabled: progressSummary.completed_lessons > 0,
    },
    {
      id: 'anatomy-lab',
      title: 'Anatomy Lab',
      description: 'Analyze sentences',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01.293.707V12a1 1 0 102 0V9a1 1 0 01.293-.707L13.586 6H12a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293A1 1 0 0112 9v3a3 3 0 11-6 0V8a1 1 0 01.293-.707L8.586 5H7a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      action: () => {
        navigate('/anatomy-lab');
      },
      enabled: true,
    },
    {
      id: 'review-session',
      title: 'Review Session',
      description: 'Refresh concepts',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white',
      action: () => {
        navigate('/review');
      },
      enabled: progressSummary.completed_lessons > 0,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Quick Actions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Jump right into your learning activities
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={!action.enabled}
            className={`
              relative p-4 rounded-lg transition-all duration-200 text-left group
              ${action.enabled 
                ? `${action.color} ${action.textColor} hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900` 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 opacity-20">
              {action.icon}
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  action.enabled 
                    ? 'bg-white/20' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  {action.icon}
                </div>
              </div>
              
              <h3 className="font-semibold text-sm mb-1 leading-tight">
                {action.title}
              </h3>
              
              <p className="text-xs opacity-90 leading-tight">
                {action.description}
              </p>

              {/* Disabled overlay text */}
              {!action.enabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Complete lessons to unlock
                  </span>
                </div>
              )}
            </div>

            {/* Hover arrow */}
            {action.enabled && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Additional Links */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link 
            to="/glossary"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Glossary
          </Link>
          
          <Link 
            to="/ai-guru"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            AI Guru
          </Link>
        </div>
      </div>

      {/* Progress Encouragement */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-blue-800 dark:text-blue-200">
            {progressSummary.overall_progress_percentage >= 50 
              ? "You're doing great! Keep up the momentum!" 
              : "Every lesson brings you closer to mastery!"
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
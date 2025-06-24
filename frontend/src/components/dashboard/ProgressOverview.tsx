import React from 'react';
import { UserProgressSummary } from '../../types';

interface ProgressOverviewProps {
  progressSummary: UserProgressSummary;
  isLoading?: boolean;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({ 
  progressSummary, 
  isLoading = false 
}) => {
  const {
    total_modules,
    completed_modules,
    total_lessons,
    completed_lessons,
    total_exercises,
    completed_exercises,
    overall_progress_percentage,
  } = progressSummary;

  // Calculate completion rates
  const moduleCompletionRate = total_modules > 0 ? (completed_modules / total_modules) * 100 : 0;
  const lessonCompletionRate = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0;
  const exerciseCompletionRate = total_exercises > 0 ? (completed_exercises / total_exercises) * 100 : 0;

  // Animate progress bar on load
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overall_progress_percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [overall_progress_percentage]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Your Progress
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(overall_progress_percentage)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(animatedProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(animatedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall progress: ${Math.round(animatedProgress)}%`}
          ></div>
        </div>
      </div>

      {/* Progress Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modules Progress */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Modules</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {Math.round(moduleCompletionRate)}% complete
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {completed_modules}<span className="text-lg text-blue-600 dark:text-blue-300">/{total_modules}</span>
          </div>
        </div>

        {/* Lessons Progress */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Lessons</p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  {Math.round(lessonCompletionRate)}% complete
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {completed_lessons}<span className="text-lg text-green-600 dark:text-green-300">/{total_lessons}</span>
          </div>
        </div>

        {/* Exercises Progress */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Exercises</p>
                <p className="text-xs text-purple-600 dark:text-purple-300">
                  {Math.round(exerciseCompletionRate)}% complete
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {completed_exercises}<span className="text-lg text-purple-600 dark:text-purple-300">/{total_exercises}</span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {overall_progress_percentage >= 80 ? (
                "Excellent progress! You're almost there!"
              ) : overall_progress_percentage >= 50 ? (
                "Great job! You're halfway through your grammar journey."
              ) : overall_progress_percentage >= 25 ? (
                "Good start! Keep going to master grammar concepts."
              ) : (
                "Welcome to your grammar journey! Start with your first lesson."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;
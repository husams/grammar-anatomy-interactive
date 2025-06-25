import React from 'react';
import { ModuleProgress } from '../../types';

interface ModuleProgressSectionProps {
  progress: ModuleProgress | null;
}

const ModuleProgressSection: React.FC<ModuleProgressSectionProps> = ({ progress }) => {
  if (!progress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Progress Overview
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start learning to see your progress
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(progress.overall_progress * 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress.overall_progress * circumference);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Progress Overview
      </h3>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-500 ease-out ${
                progress.status === 'completed' 
                  ? 'text-green-500' 
                  : progress.status === 'in_progress' 
                  ? 'text-blue-500' 
                  : 'text-gray-300'
              }`}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progressPercentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Statistics */}
      <div className="space-y-4">
        {/* Lessons Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Lessons</span>
            <span>{progress.lessons_completed} of {progress.total_lessons}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.lessons_completed / progress.total_lessons) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercises Progress */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Exercises</span>
            <span>{progress.exercises_completed} of {progress.total_exercises}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.exercises_completed / progress.total_exercises) * 100}%` }}
            />
          </div>
        </div>

        {/* Time Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatTime(progress.time_spent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Time Spent
            </div>
          </div>
          
          {progress.estimated_time_remaining > 0 && (
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(progress.estimated_time_remaining)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Remaining
              </div>
            </div>
          )}
        </div>

        {/* Last Accessed */}
        {progress.last_accessed_lesson && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Last accessed:
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {progress.last_accessed_lesson.lesson_title}
            </div>
          </div>
        )}

        {/* Achievements */}
        {progress.achievements.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Recent Achievements
            </div>
            <div className="space-y-2">
              {progress.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(achievement.earned_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleProgressSection;
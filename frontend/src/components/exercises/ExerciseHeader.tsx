import React from 'react';
import { Exercise } from '../../types/index';

interface ExerciseHeaderProps {
  exercise: Exercise | null;
  isLoading: boolean;
  attempts: number;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({ 
  exercise, 
  isLoading, 
  attempts 
}) => {
  if (isLoading) {
    return (
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {exercise.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {exercise.prompt}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {exercise.type.replace('_', ' ')}
            </span>
            {attempts > 0 && (
              <span>Attempt {attempts}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
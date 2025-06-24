import React from 'react';
import { Exercise } from '../../types/index';

interface ExerciseNavigationProps {
  currentExercise: Exercise | null;
  onPrevious: () => void;
  onNext: () => void;
}

export const ExerciseNavigation: React.FC<ExerciseNavigationProps> = ({ 
  currentExercise, 
  onPrevious, 
  onNext 
}) => {
  if (!currentExercise) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Exercise {currentExercise.order}
        </span>
        
        <button
          onClick={onNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
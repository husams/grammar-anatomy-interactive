import React from 'react';

interface ExerciseContainerProps {
  children: React.ReactNode;
}

export const ExerciseContainer: React.FC<ExerciseContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
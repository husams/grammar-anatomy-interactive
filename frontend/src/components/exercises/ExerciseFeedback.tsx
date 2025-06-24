import React from 'react';
import { ExerciseResult } from '../../types/index';

interface ExerciseFeedbackProps {
  result: ExerciseResult;
  onRetry: () => void;
  onContinue: () => void;
}

export const ExerciseFeedback: React.FC<ExerciseFeedbackProps> = ({ 
  result, 
  onRetry, 
  onContinue 
}) => {
  const isCorrect = result.is_correct;
  const feedback = result.feedback;

  return (
    <div className={`mx-6 mb-6 p-4 rounded-lg border-2 ${
      isCorrect 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isCorrect ? (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">
            {isCorrect ? 'Correct!' : 'Not quite right'}
          </h3>
          <p className="mb-3">{feedback.message}</p>
          
          {feedback.explanation && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Explanation:</h4>
              <p className="text-sm">{feedback.explanation}</p>
            </div>
          )}
          
          {feedback.hints && feedback.hints.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Hints:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {feedback.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-3 mt-4">
            {!isCorrect && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            )}
            
            {feedback.next_steps?.action === 'continue' && (
              <button
                onClick={onContinue}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
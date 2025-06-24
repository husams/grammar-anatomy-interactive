import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseAnswer } from '../../../types/index';

interface FillInBlankExerciseProps {
  exercise: Exercise;
  userAnswer: ExerciseAnswer | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
  onSubmit: (answer: ExerciseAnswer) => void;
  disabled: boolean;
  showResult: boolean;
}

export const FillInBlankExercise: React.FC<FillInBlankExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onSubmit,
  disabled,
  showResult
}) => {
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (userAnswer?.blank_answers) {
      setBlankAnswers(userAnswer.blank_answers);
    }
  }, [userAnswer]);

  const handleBlankChange = (blankId: string, value: string) => {
    if (disabled) return;
    
    const newAnswers = { ...blankAnswers, [blankId]: value };
    setBlankAnswers(newAnswers);
    
    const answer: ExerciseAnswer = { blank_answers: newAnswers };
    onAnswerChange(answer);
  };

  const handleSubmit = () => {
    const answer: ExerciseAnswer = { blank_answers: blankAnswers };
    onSubmit(answer);
    setHasSubmitted(true);
  };

  const renderTextWithBlanks = () => {
    const text = exercise.content.text || '';
    const blanks = exercise.content.blanks || [];
    
    // For now, we'll render a simple version with separate inputs
    // In a real implementation, you'd parse the text and inject inputs inline
    
    return (
      <div className="text-lg leading-relaxed">
        <p className="mb-4">{text}</p>
        <div className="space-y-4">
          {blanks.map((blank) => (
            <div key={blank.id} className="flex items-center space-x-2">
              <span className="text-gray-600">Blank {blank.position}:</span>
              <input
                type="text"
                value={blankAnswers[blank.id] || ''}
                onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                disabled={disabled}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
                placeholder="Type your answer here..."
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasAllAnswers = () => {
    const blanks = exercise.content.blanks || [];
    return blanks.every(blank => blankAnswers[blank.id]?.trim());
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {exercise.prompt}
        </h2>
      </div>

      <div className="mb-8">
        {renderTextWithBlanks()}
      </div>

      {!showResult && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!hasAllAnswers() || disabled || hasSubmitted}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmitted ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
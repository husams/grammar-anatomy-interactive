import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseAnswer } from '../../../types/index';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  userAnswer: ExerciseAnswer | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
  onSubmit: (answer: ExerciseAnswer) => void;
  disabled: boolean;
  showResult: boolean;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onSubmit,
  disabled,
  showResult
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (userAnswer?.selected_option !== undefined) {
      setSelectedOption(userAnswer.selected_option);
    }
  }, [userAnswer]);

  const handleOptionSelect = (option: string | number) => {
    if (disabled) return;
    
    setSelectedOption(option);
    const answer: ExerciseAnswer = { selected_option: option };
    onAnswerChange(answer);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const answer: ExerciseAnswer = { selected_option: selectedOption };
    onSubmit(answer);
    setHasSubmitted(true);
  };

  const options = exercise.content.options || [];

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {exercise.prompt}
        </h2>
      </div>

      <div className="space-y-3 mb-8">
        {options.map((option, index) => {
          const optionValue = index;
          const isSelected = selectedOption === optionValue;
          
          return (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="multiple-choice"
                value={optionValue}
                checked={isSelected}
                onChange={() => handleOptionSelect(optionValue)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">
                {option}
              </span>
            </label>
          );
        })}
      </div>

      {!showResult && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || disabled || hasSubmitted}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmitted ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseAnswer } from '../../../types/index';

interface IdentificationExerciseProps {
  exercise: Exercise;
  userAnswer: ExerciseAnswer | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
  onSubmit: (answer: ExerciseAnswer) => void;
  disabled: boolean;
  showResult: boolean;
}

export const IdentificationExercise: React.FC<IdentificationExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onSubmit,
  disabled,
  showResult
}) => {
  const [identifiedElements, setIdentifiedElements] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (userAnswer?.identified_elements) {
      setIdentifiedElements(userAnswer.identified_elements);
    }
  }, [userAnswer]);

  const handleElementClick = (elementId: string) => {
    if (disabled) return;
    
    let newIdentifiedElements;
    if (identifiedElements.includes(elementId)) {
      // Remove if already selected
      newIdentifiedElements = identifiedElements.filter(id => id !== elementId);
    } else {
      // Add if not selected
      newIdentifiedElements = [...identifiedElements, elementId];
    }
    
    setIdentifiedElements(newIdentifiedElements);
    
    const answer: ExerciseAnswer = { identified_elements: newIdentifiedElements };
    onAnswerChange(answer);
  };

  const handleSubmit = () => {
    const answer: ExerciseAnswer = { identified_elements: identifiedElements };
    onSubmit(answer);
    setHasSubmitted(true);
  };

  const targetText = exercise.content.target_text || '';
  const targetElements = exercise.content.target_elements || [];

  const renderInteractiveText = () => {
    // For now, we'll render clickable elements as buttons
    // In a real implementation, you'd parse the text and make specific words clickable
    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed p-4 bg-gray-50 rounded-lg">
          {targetText}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            Click on the elements you want to identify:
          </h3>
          <div className="flex flex-wrap gap-2">
            {targetElements.map((element) => {
              const isSelected = identifiedElements.includes(element.id);
              
              return (
                <button
                  key={element.id}
                  onClick={() => handleElementClick(element.id)}
                  disabled={disabled}
                  className={`px-3 py-2 rounded-md border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {element.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {exercise.prompt}
        </h2>
      </div>

      <div className="mb-8">
        {renderInteractiveText()}
      </div>

      {identifiedElements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected elements:
          </h4>
          <div className="flex flex-wrap gap-2">
            {identifiedElements.map((elementId) => {
              const element = targetElements.find(el => el.id === elementId);
              return element ? (
                <span
                  key={elementId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {element.text}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {!showResult && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={identifiedElements.length === 0 || disabled || hasSubmitted}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmitted ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
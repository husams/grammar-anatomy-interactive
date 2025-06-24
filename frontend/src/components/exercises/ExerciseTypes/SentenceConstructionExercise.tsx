import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseAnswer } from '../../../types/index';

interface SentenceConstructionExerciseProps {
  exercise: Exercise;
  userAnswer: ExerciseAnswer | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
  onSubmit: (answer: ExerciseAnswer) => void;
  disabled: boolean;
  showResult: boolean;
}

export const SentenceConstructionExercise: React.FC<SentenceConstructionExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onSubmit,
  disabled,
  showResult
}) => {
  const [constructedSentence, setConstructedSentence] = useState<string>('');
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (exercise.content.words) {
      setAvailableWords([...exercise.content.words]);
    }
  }, [exercise]);

  useEffect(() => {
    if (userAnswer?.constructed_sentence) {
      setConstructedSentence(userAnswer.constructed_sentence);
      // Parse the sentence to determine used words
      const words = userAnswer.constructed_sentence.split(' ').filter(w => w.trim());
      setUsedWords(words);
      
      // Update available words
      const remaining = exercise.content.words?.filter(word => {
        const usedCount = words.filter(w => w === word).length;
        const totalCount = exercise.content.words?.filter(w => w === word).length || 0;
        return usedCount < totalCount;
      }) || [];
      setAvailableWords(remaining);
    }
  }, [userAnswer, exercise]);

  const addWordToSentence = (word: string) => {
    if (disabled) return;
    
    const newSentence = constructedSentence ? `${constructedSentence} ${word}` : word;
    const newUsedWords = [...usedWords, word];
    const newAvailableWords = availableWords.filter((w, index) => {
      return !(w === word && availableWords.indexOf(word) === index);
    });
    
    setConstructedSentence(newSentence);
    setUsedWords(newUsedWords);
    setAvailableWords(newAvailableWords);
    
    const answer: ExerciseAnswer = { constructed_sentence: newSentence };
    onAnswerChange(answer);
  };

  const removeWordFromSentence = (wordIndex: number) => {
    if (disabled) return;
    
    const words = constructedSentence.split(' ');
    const removedWord = words[wordIndex];
    words.splice(wordIndex, 1);
    
    const newSentence = words.join(' ');
    const newUsedWords = usedWords.filter((_, index) => index !== wordIndex);
    const newAvailableWords = [...availableWords, removedWord].sort();
    
    setConstructedSentence(newSentence);
    setUsedWords(newUsedWords);
    setAvailableWords(newAvailableWords);
    
    const answer: ExerciseAnswer = { constructed_sentence: newSentence };
    onAnswerChange(answer);
  };

  const clearSentence = () => {
    if (disabled) return;
    
    setConstructedSentence('');
    setUsedWords([]);
    setAvailableWords([...exercise.content.words || []]);
    
    const answer: ExerciseAnswer = { constructed_sentence: '' };
    onAnswerChange(answer);
  };

  const handleSubmit = () => {
    const answer: ExerciseAnswer = { constructed_sentence: constructedSentence };
    onSubmit(answer);
    setHasSubmitted(true);
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {exercise.prompt}
        </h2>
      </div>

      {/* Construction Area */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Your Sentence:
        </h3>
        <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          {constructedSentence ? (
            <div className="flex flex-wrap gap-2">
              {constructedSentence.split(' ').map((word, index) => (
                <button
                  key={index}
                  onClick={() => removeWordFromSentence(index)}
                  disabled={disabled}
                  className={`px-3 py-1 bg-blue-100 text-blue-800 rounded-md border border-blue-200 hover:bg-blue-200 transition-colors ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Drag words here to build your sentence...
            </p>
          )}
        </div>
        
        {constructedSentence && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={clearSentence}
              disabled={disabled}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-60"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Word Bank */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Available Words:
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              onClick={() => addWordToSentence(word)}
              disabled={disabled}
              className={`px-3 py-2 bg-white border border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
        
        {availableWords.length === 0 && (
          <p className="text-gray-500 italic">
            All words have been used.
          </p>
        )}
      </div>

      {!showResult && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!constructedSentence.trim() || disabled || hasSubmitted}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSubmitted ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
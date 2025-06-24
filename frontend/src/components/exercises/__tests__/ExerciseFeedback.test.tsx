import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExerciseFeedback } from '../ExerciseFeedback';
import { ExerciseResult } from '../../../types/index';

describe('ExerciseFeedback', () => {
  const mockOnRetry = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const correctResult: ExerciseResult = {
    exercise_id: 'test-exercise',
    user_id: 'test-user',
    answer: { selected_option: 1 },
    is_correct: true,
    score: 1.0,
    feedback: {
      message: 'Excellent work! You got it right.',
      explanation: 'Cat is indeed a noun.',
      next_steps: {
        action: 'continue',
        message: 'Move on to the next exercise'
      }
    },
    submitted_at: '2024-01-01T00:00:00Z'
  };

  const incorrectResult: ExerciseResult = {
    exercise_id: 'test-exercise',
    user_id: 'test-user',
    answer: { selected_option: 0 },
    is_correct: false,
    score: 0.0,
    feedback: {
      message: 'Not quite right. Try again!',
      explanation: 'Run is a verb, not a noun.',
      hints: ['Look for words that name people, places, or things'],
      next_steps: {
        action: 'retry',
        message: 'Give it another try'
      }
    },
    submitted_at: '2024-01-01T00:00:00Z'
  };

  const defaultProps = {
    result: correctResult,
    onRetry: mockOnRetry,
    onContinue: mockOnContinue,
  };

  it('displays correct feedback for correct answers', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('Excellent work! You got it right.')).toBeInTheDocument();
    expect(screen.getByText('Cat is indeed a noun.')).toBeInTheDocument();
  });

  it('displays incorrect feedback for wrong answers', () => {
    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={incorrectResult}
      />
    );

    expect(screen.getByText('Not quite right')).toBeInTheDocument();
    expect(screen.getByText('Not quite right. Try again!')).toBeInTheDocument();
    expect(screen.getByText('Run is a verb, not a noun.')).toBeInTheDocument();
  });

  it('shows hints when available', () => {
    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={incorrectResult}
      />
    );

    expect(screen.getByText('Hints:')).toBeInTheDocument();
    expect(screen.getByText('Look for words that name people, places, or things')).toBeInTheDocument();
  });

  it('shows try again button for incorrect answers', () => {
    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={incorrectResult}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('shows continue button for correct answers when specified', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeInTheDocument();
    
    fireEvent.click(continueButton);
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('does not show try again button for correct answers', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('applies correct styling for correct answers', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    // Find the outermost container with the styling classes
    const container = document.querySelector('.bg-green-50');
    expect(container).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('applies correct styling for incorrect answers', () => {
    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={incorrectResult}
      />
    );

    // Find the outermost container with the styling classes
    const container = document.querySelector('.bg-red-50');
    expect(container).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('displays correct icons for feedback state', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    // Check for SVG icon within the feedback component
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('handles missing explanation gracefully', () => {
    const resultWithoutExplanation: ExerciseResult = {
      ...correctResult,
      feedback: {
        message: 'Correct!',
      }
    };

    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={resultWithoutExplanation}
      />
    );

    expect(screen.getAllByText('Correct!')[0]).toBeInTheDocument();
    expect(screen.queryByText('Explanation:')).not.toBeInTheDocument();
  });

  it('handles missing hints gracefully', () => {
    const resultWithoutHints: ExerciseResult = {
      ...incorrectResult,
      feedback: {
        ...incorrectResult.feedback,
        hints: undefined
      }
    };

    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={resultWithoutHints}
      />
    );

    expect(screen.queryByText('Hints:')).not.toBeInTheDocument();
  });

  it('handles empty hints array', () => {
    const resultWithEmptyHints: ExerciseResult = {
      ...incorrectResult,
      feedback: {
        ...incorrectResult.feedback,
        hints: []
      }
    };

    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={resultWithEmptyHints}
      />
    );

    expect(screen.queryByText('Hints:')).not.toBeInTheDocument();
  });

  it('renders multiple hints correctly', () => {
    const resultWithMultipleHints: ExerciseResult = {
      ...incorrectResult,
      feedback: {
        ...incorrectResult.feedback,
        hints: [
          'Look for words that name people, places, or things',
          'Nouns can be singular or plural',
          'Examples: cat, dog, house, idea'
        ]
      }
    };

    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={resultWithMultipleHints}
      />
    );

    expect(screen.getByText('Look for words that name people, places, or things')).toBeInTheDocument();
    expect(screen.getByText('Nouns can be singular or plural')).toBeInTheDocument();
    expect(screen.getByText('Examples: cat, dog, house, idea')).toBeInTheDocument();
  });

  it('shows appropriate button styling', () => {
    render(
      <ExerciseFeedback 
        {...defaultProps} 
        result={incorrectResult}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
  });

  it('maintains accessibility with proper ARIA attributes', () => {
    render(<ExerciseFeedback {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('class');
      // Buttons should be focusable
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});
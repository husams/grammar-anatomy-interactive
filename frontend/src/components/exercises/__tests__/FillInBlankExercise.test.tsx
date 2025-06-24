import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FillInBlankExercise } from '../ExerciseTypes/FillInBlankExercise';
import { Exercise, ExerciseAnswer } from '../../../types/index';

const mockExercise: Exercise = {
  id: 'test-exercise-id',
  lesson_id: 'test-lesson-id',
  title: 'Fill in the Blank Exercise',
  type: 'fill_in_blank',
  prompt: 'Complete the following sentence:',
  content: {
    text: 'The cat ____ on the mat.',
    blanks: [
      {
        id: 'blank1',
        position: 1,
        correct_answers: ['sits', 'sat'],
        case_sensitive: false
      },
      {
        id: 'blank2',
        position: 2,
        correct_answers: ['quickly'],
        case_sensitive: true
      }
    ]
  },
  order: 1,
  created_at: '2024-01-01T00:00:00Z'
};

describe('FillInBlankExercise', () => {
  const mockOnAnswerChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    exercise: mockExercise,
    userAnswer: null,
    onAnswerChange: mockOnAnswerChange,
    onSubmit: mockOnSubmit,
    disabled: false,
    showResult: false,
  };

  it('renders exercise prompt and text correctly', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    expect(screen.getByText('Complete the following sentence:')).toBeInTheDocument();
    expect(screen.getByText('The cat ____ on the mat.')).toBeInTheDocument();
  });

  it('renders input fields for each blank', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    expect(screen.getAllByDisplayValue('')[0]).toBeInTheDocument(); // First blank input
    expect(screen.getByText('Blank 1:')).toBeInTheDocument();
    expect(screen.getByText('Blank 2:')).toBeInTheDocument();
    
    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    expect(inputs).toHaveLength(2);
  });

  it('updates answer when user types in blanks', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    fireEvent.change(inputs[0], { target: { value: 'sits' } });
    
    expect(mockOnAnswerChange).toHaveBeenCalledWith({
      blank_answers: { blank1: 'sits' }
    });

    fireEvent.change(inputs[1], { target: { value: 'quickly' } });
    
    expect(mockOnAnswerChange).toHaveBeenCalledWith({
      blank_answers: { blank1: 'sits', blank2: 'quickly' }
    });
  });

  it('enables submit button only when all blanks are filled', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    // Fill first blank only
    fireEvent.change(inputs[0], { target: { value: 'sits' } });
    expect(submitButton).toBeDisabled();

    // Fill second blank
    fireEvent.change(inputs[1], { target: { value: 'quickly' } });
    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit with correct answers when submitted', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    fireEvent.change(inputs[0], { target: { value: 'sits' } });
    fireEvent.change(inputs[1], { target: { value: 'quickly' } });

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      blank_answers: { blank1: 'sits', blank2: 'quickly' }
    });
  });

  it('shows submitting state after submission', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    fireEvent.change(inputs[0], { target: { value: 'sits' } });
    fireEvent.change(inputs[1], { target: { value: 'quickly' } });

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('pre-fills blanks when userAnswer is provided', () => {
    const userAnswer: ExerciseAnswer = { 
      blank_answers: { blank1: 'sits', blank2: 'fast' }
    };
    
    render(
      <FillInBlankExercise 
        {...defaultProps} 
        userAnswer={userAnswer}
      />
    );

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    expect(inputs[0]).toHaveValue('sits');
    expect(inputs[1]).toHaveValue('fast');
  });

  it('disables interaction when disabled prop is true', () => {
    render(<FillInBlankExercise {...defaultProps} disabled={true} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    fireEvent.change(inputs[0], { target: { value: 'sits' } });
    
    expect(mockOnAnswerChange).not.toHaveBeenCalled();
    
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('hides submit button when showResult is true', () => {
    render(<FillInBlankExercise {...defaultProps} showResult={true} />);

    expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
  });

  it('handles empty blanks array gracefully', () => {
    const exerciseWithoutBlanks: Exercise = {
      ...mockExercise,
      content: {
        text: 'This is a complete sentence.'
      }
    };

    render(
      <FillInBlankExercise 
        {...defaultProps} 
        exercise={exerciseWithoutBlanks}
      />
    );

    expect(screen.getByText('This is a complete sentence.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Type your answer here...')).not.toBeInTheDocument();
  });

  it('handles whitespace-only answers correctly', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    // Fill with whitespace only
    fireEvent.change(inputs[0], { target: { value: '   ' } });
    fireEvent.change(inputs[1], { target: { value: '\\t\\n' } });

    // Should still be disabled because answers are only whitespace
    expect(submitButton).toBeDisabled();
  });

  it('applies correct styling for input states', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    inputs.forEach(input => {
      expect(input).toHaveClass('border-gray-300');
      
      // Focus the input
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-blue-500', 'focus:border-blue-500');
    });
  });

  it('applies disabled styling when disabled', () => {
    render(<FillInBlankExercise {...defaultProps} disabled={true} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    inputs.forEach(input => {
      expect(input).toHaveClass('disabled:opacity-60');
      expect(input).toBeDisabled();
    });
  });

  it('provides accessible labels for inputs', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    expect(screen.getByText('Blank 1:')).toBeInTheDocument();
    expect(screen.getByText('Blank 2:')).toBeInTheDocument();
    
    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  it('maintains input state during component re-renders', () => {
    const { rerender } = render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    fireEvent.change(inputs[0], { target: { value: 'sits' } });

    // Re-render with same props
    rerender(<FillInBlankExercise {...defaultProps} />);

    // Input should maintain its value
    const updatedInputs = screen.getAllByPlaceholderText('Type your answer here...');
    expect(updatedInputs[0]).toHaveValue('sits');
  });

  it('handles special characters in answers', () => {
    render(<FillInBlankExercise {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('Type your answer here...');
    
    fireEvent.change(inputs[0], { target: { value: "can't" } });
    fireEvent.change(inputs[1], { target: { value: '100%' } });

    expect(mockOnAnswerChange).toHaveBeenCalledWith({
      blank_answers: { blank1: "can't", blank2: '100%' }
    });
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultipleChoiceExercise } from '../ExerciseTypes/MultipleChoiceExercise';
import { Exercise, ExerciseAnswer } from '../../../types/index';

const mockExercise: Exercise = {
  id: 'test-exercise-id',
  lesson_id: 'test-lesson-id',
  title: 'Test Multiple Choice Exercise',
  type: 'multiple_choice',
  prompt: 'Which of the following is a noun?',
  content: {
    options: ['Run', 'Cat', 'Quick', 'Blue'],
    correct_answer: 1
  },
  order: 1,
  created_at: '2024-01-01T00:00:00Z'
};

describe('MultipleChoiceExercise', () => {
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

  it('renders exercise prompt and options correctly', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    expect(screen.getByText('Which of the following is a noun?')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('allows selecting an option', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    expect(catOption).toBeChecked();
    expect(mockOnAnswerChange).toHaveBeenCalledWith({ selected_option: 1 });
  });

  it('allows changing selection', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    // Select first option
    const runOption = screen.getByLabelText(/run/i);
    fireEvent.click(runOption);

    expect(mockOnAnswerChange).toHaveBeenCalledWith({ selected_option: 0 });

    // Select second option
    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    expect(mockOnAnswerChange).toHaveBeenCalledWith({ selected_option: 1 });
    expect(catOption).toBeChecked();
    expect(runOption).not.toBeChecked();
  });

  it('enables submit button when option is selected', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit with correct answer when submitted', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({ selected_option: 1 });
  });

  it('shows submitting state after submission', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('pre-selects option when userAnswer is provided', () => {
    const userAnswer: ExerciseAnswer = { selected_option: 2 };
    
    render(
      <MultipleChoiceExercise 
        {...defaultProps} 
        userAnswer={userAnswer}
      />
    );

    const quickOption = screen.getByLabelText(/quick/i);
    expect(quickOption).toBeChecked();
  });

  it('disables interaction when disabled prop is true', () => {
    render(<MultipleChoiceExercise {...defaultProps} disabled={true} />);

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    expect(mockOnAnswerChange).not.toHaveBeenCalled();
    expect(catOption).not.toBeChecked();
  });

  it('hides submit button when showResult is true', () => {
    render(<MultipleChoiceExercise {...defaultProps} showResult={true} />);

    expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
  });

  it('applies correct styling for selected options', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const catLabel = screen.getByLabelText(/cat/i).closest('label');
    expect(catLabel).toHaveClass('border-gray-200');

    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    expect(catLabel).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('applies disabled styling when disabled', () => {
    render(<MultipleChoiceExercise {...defaultProps} disabled={true} />);

    const labels = screen.getAllByRole('radio').map(radio => radio.closest('label'));
    labels.forEach(label => {
      expect(label).toHaveClass('opacity-60', 'cursor-not-allowed');
    });
  });

  it('handles empty options gracefully', () => {
    const exerciseWithoutOptions: Exercise = {
      ...mockExercise,
      content: {}
    };

    render(
      <MultipleChoiceExercise 
        {...defaultProps} 
        exercise={exerciseWithoutOptions}
      />
    );

    expect(screen.getByText('Which of the following is a noun?')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('provides accessible labels and roles', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);

    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'multiple-choice');
    });

    expect(screen.getByLabelText(/run/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quick/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/blue/i)).toBeInTheDocument();
  });

  it('maintains focus management for keyboard navigation', () => {
    render(<MultipleChoiceExercise {...defaultProps} />);

    const firstOption = screen.getByLabelText(/run/i);
    firstOption.focus();

    expect(document.activeElement).toBe(firstOption);
  });
});
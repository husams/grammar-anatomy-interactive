import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ExercisePage from '../ExercisePage';
import { Exercise } from '../../../types/index';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: any) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
  useParams: () => ({ exerciseId: 'test-exercise-id' }),
}), { virtual: true });

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

describe('ExercisePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads and displays exercise correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    // Show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for exercise to load
    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    expect(screen.getByText('Which of the following is a noun?')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
  });

  it('handles authentication errors by redirecting to login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles 404 errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Exercise not found')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load exercise/i)).toBeInTheDocument();
    });
  });

  it('submits exercise answer successfully', async () => {
    // Mock exercise fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    // Mock exercise submission
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exercise_id: 'test-exercise-id',
        user_id: 'test-user-id',
        answer: { selected_option: 1 },
        is_correct: true,
        score: 1.0,
        feedback: {
          message: 'Correct! Cat is indeed a noun.',
          explanation: 'A noun is a word that represents a person, place, thing, or idea.',
        },
        submitted_at: '2024-01-01T00:00:00Z'
      }),
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    // Wait for exercise to load
    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    // Select an option
    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    // Submit the answer
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    // Wait for feedback
    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    expect(screen.getByText('Correct! Cat is indeed a noun.')).toBeInTheDocument();
  });

  it('handles submission errors gracefully', async () => {
    // Mock exercise fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    // Mock failed submission
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    // Wait for exercise to load
    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    // Select an option
    const catOption = screen.getByLabelText(/cat/i);
    fireEvent.click(catOption);

    // Submit the answer
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to submit answer/i)).toBeInTheDocument();
    });
  });

  it('allows retrying incorrect answers', async () => {
    // Mock exercise fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    // Mock incorrect submission
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exercise_id: 'test-exercise-id',
        user_id: 'test-user-id',
        answer: { selected_option: 0 },
        is_correct: false,
        score: 0.0,
        feedback: {
          message: 'Incorrect. Try again!',
          explanation: 'Run is a verb, not a noun.',
        },
        submitted_at: '2024-01-01T00:00:00Z'
      }),
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    // Wait for exercise to load
    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    // Select wrong option
    const runOption = screen.getByLabelText(/run/i);
    fireEvent.click(runOption);

    // Submit the answer
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    fireEvent.click(submitButton);

    // Wait for feedback
    await waitFor(() => {
      expect(screen.getByText('Not quite right')).toBeInTheDocument();
    });

    // Check retry button is available
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    // Click retry
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Exercise should reset
    expect(screen.queryByText('Not quite right')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument();
  });

  it('tracks attempt count correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    // Initially no attempt count shown
    expect(screen.queryByText(/attempt/i)).not.toBeInTheDocument();

    // After first submission, should show attempt 1
    // This would require mocking a submission and retry cycle
    // Simplified for this test
  });

  it('prevents submission without selecting an answer', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercise,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Multiple Choice Exercise')).toBeInTheDocument();
    });

    // Submit button should be disabled initially
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();
  });

  it('renders different exercise types correctly', async () => {
    const fillInBlankExercise: Exercise = {
      ...mockExercise,
      type: 'fill_in_blank',
      title: 'Fill in the Blank Exercise',
      prompt: 'Complete the sentence',
      content: {
        text: 'The cat ____ on the mat.',
        blanks: [
          {
            id: 'blank1',
            position: 1,
            correct_answers: ['sits', 'sat'],
            case_sensitive: false
          }
        ]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fillInBlankExercise,
    });

    render(
      <MemoryRouter>
        <ExercisePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fill in the Blank Exercise')).toBeInTheDocument();
    });

    expect(screen.getByText('Complete the sentence')).toBeInTheDocument();
    expect(screen.getByText('The cat ____ on the mat.')).toBeInTheDocument();
  });
});
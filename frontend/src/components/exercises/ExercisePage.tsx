import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Exercise, ExerciseState, ExerciseAnswer, ExerciseSubmission, ExerciseResult } from '../../types/index';
import { ExerciseContainer } from './ExerciseContainer';
import { ExerciseHeader } from './ExerciseHeader';
import { MultipleChoiceExercise } from './ExerciseTypes/MultipleChoiceExercise';
import { FillInBlankExercise } from './ExerciseTypes/FillInBlankExercise';
import { IdentificationExercise } from './ExerciseTypes/IdentificationExercise';
import { SentenceConstructionExercise } from './ExerciseTypes/SentenceConstructionExercise';
import { ExerciseFeedback } from './ExerciseFeedback';
import { ExerciseNavigation } from './ExerciseNavigation';
import { ExerciseErrorBoundary } from './ExerciseErrorBoundary';

const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    current_exercise: null,
    user_answer: null,
    result: null,
    is_loading: true,
    error: null,
    time_started: null,
    attempts: 0
  });

  const fetchExercise = async (id: string) => {
    try {
      setExerciseState(prev => ({ ...prev, is_loading: true, error: null }));
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/v1/exercises/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.status === 404) {
        setExerciseState(prev => ({ ...prev, error: 'Exercise not found', is_loading: false }));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load exercise');
      }

      const exercise: Exercise = await response.json();
      
      setExerciseState(prev => ({
        ...prev,
        current_exercise: exercise,
        is_loading: false,
        time_started: new Date(),
        user_answer: null,
        result: null,
        attempts: 0
      }));

    } catch (error) {
      console.error('Error fetching exercise:', error);
      setExerciseState(prev => ({
        ...prev,
        error: 'Failed to load exercise. Please try again.',
        is_loading: false
      }));
    }
  };

  const submitExercise = async (answer: ExerciseAnswer) => {
    if (!exerciseState.current_exercise) return;

    try {
      setExerciseState(prev => ({ ...prev, is_loading: true }));

      const timeSpent = exerciseState.time_started 
        ? Math.floor((Date.now() - exerciseState.time_started.getTime()) / 1000)
        : undefined;

      const submission: ExerciseSubmission = {
        answer,
        time_spent: timeSpent
      };

      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/v1/exercises/${exerciseState.current_exercise.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error('Failed to submit exercise');
      }

      const result: ExerciseResult = await response.json();
      
      setExerciseState(prev => ({
        ...prev,
        user_answer: answer,
        result,
        is_loading: false,
        attempts: prev.attempts + 1
      }));

    } catch (error) {
      console.error('Error submitting exercise:', error);
      setExerciseState(prev => ({
        ...prev,
        error: 'Failed to submit answer. Please try again.',
        is_loading: false
      }));
    }
  };

  const retryExercise = () => {
    setExerciseState(prev => ({
      ...prev,
      user_answer: null,
      result: null,
      time_started: new Date(),
      error: null
    }));
  };

  const handleAnswerChange = (answer: ExerciseAnswer) => {
    setExerciseState(prev => ({ ...prev, user_answer: answer }));
  };

  useEffect(() => {
    if (exerciseId) {
      fetchExercise(exerciseId);
    }
  }, [exerciseId]);

  const renderExerciseType = () => {
    if (!exerciseState.current_exercise) return null;

    const exercise = exerciseState.current_exercise;
    const commonProps = {
      exercise,
      userAnswer: exerciseState.user_answer,
      onAnswerChange: handleAnswerChange,
      onSubmit: submitExercise,
      disabled: exerciseState.is_loading || !!exerciseState.result,
      showResult: !!exerciseState.result
    };

    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoiceExercise {...commonProps} />;
      case 'fill_in_blank':
        return <FillInBlankExercise {...commonProps} />;
      case 'identification':
        return <IdentificationExercise {...commonProps} />;
      case 'sentence_construction':
        return <SentenceConstructionExercise {...commonProps} />;
      default:
        return <div className="text-red-600">Unknown exercise type: {exercise.type}</div>;
    }
  };

  if (exerciseState.error) {
    return (
      <ExerciseErrorBoundary
        error={exerciseState.error}
        onRetry={() => exerciseId && fetchExercise(exerciseId)}
        onGoBack={() => navigate(-1)}
      />
    );
  }

  return (
    <ExerciseContainer>
      <ExerciseHeader
        exercise={exerciseState.current_exercise}
        isLoading={exerciseState.is_loading}
        attempts={exerciseState.attempts}
      />
      
      <div className="exercise-content">
        {renderExerciseType()}
      </div>

      {exerciseState.result && (
        <ExerciseFeedback
          result={exerciseState.result}
          onRetry={retryExercise}
          onContinue={() => {/* Navigate to next exercise */}}
        />
      )}

      <ExerciseNavigation
        currentExercise={exerciseState.current_exercise}
        onPrevious={() => {/* Navigate to previous exercise */}}
        onNext={() => {/* Navigate to next exercise */}}
      />
    </ExerciseContainer>
  );
};

export default ExercisePage;
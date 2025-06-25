import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleCard from '../ModuleCard';
import { ModuleWithProgress } from '../../../types';

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  return {
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>
  };
}, { virtual: true });

// Mock ModuleService - create a simple implementation without API calls
jest.mock('../../../services/moduleService', () => ({
  ModuleService: {
    formatModuleForDisplay: (module: any) => {
      const duration = module.estimated_duration 
        ? `${Math.ceil(module.estimated_duration / 60)} hours`
        : 'Duration varies';

      const lessonText = module.lesson_count === 1 
        ? '1 lesson' 
        : `${module.lesson_count} lessons`;

      return {
        title: module.title,
        subtitle: `Module ${module.order}`,
        description: module.description || `Learn grammar concepts through ${lessonText}`,
        duration
      };
    },
    getDifficultyColor: (difficulty?: string) => {
      switch (difficulty) {
        case 'beginner': return 'bg-green-100 text-green-800';
        case 'intermediate': return 'bg-yellow-100 text-yellow-800';
        case 'advanced': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  }
}));

const mockModule: ModuleWithProgress = {
  id: 'test-module-1',
  title: 'Test Module',
  order: 1,
  lesson_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  description: 'A test module for learning',
  difficulty_level: 'beginner',
  estimated_duration: 120,
  progress: {
    module_id: 'test-module-1',
    total_lessons: 5,
    completed_lessons: 2,
    progress_percentage: 40,
    status: 'in_progress',
    last_accessed: '2024-01-01T12:00:00Z',
    estimated_completion_time: 72
  }
};

const renderModuleCard = (module: ModuleWithProgress, onClick?: jest.Mock) => {
  return render(<ModuleCard module={module} onClick={onClick} />);
};

describe('ModuleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders module information correctly', () => {
    renderModuleCard(mockModule);

    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('Module 1 • 2 hours')).toBeInTheDocument();
    expect(screen.getByText('A test module for learning')).toBeInTheDocument();
  });

  it('displays progress information', () => {
    renderModuleCard(mockModule);

    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('2 of 5 lessons')).toBeInTheDocument();
    expect(screen.getByText('2 min left')).toBeInTheDocument();
  });

  it('shows correct status badge for in progress module', () => {
    renderModuleCard(mockModule);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    const statusBadge = screen.getByText('In Progress').closest('span');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('shows correct status badge for completed module', () => {
    const completedModule: ModuleWithProgress = {
      ...mockModule,
      progress: {
        ...mockModule.progress,
        status: 'completed',
        completed_lessons: 5,
        progress_percentage: 100
      }
    };

    renderModuleCard(completedModule);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    const statusBadge = screen.getByText('Completed').closest('span');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows correct status badge for not started module', () => {
    const notStartedModule: ModuleWithProgress = {
      ...mockModule,
      progress: {
        ...mockModule.progress,
        status: 'not_started',
        completed_lessons: 0,
        progress_percentage: 0
      }
    };

    renderModuleCard(notStartedModule);

    expect(screen.getByText('Not Started')).toBeInTheDocument();
    const statusBadge = screen.getByText('Not Started').closest('span');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('displays difficulty badge when provided', () => {
    renderModuleCard(mockModule);

    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('shows correct action link text based on status', () => {
    // In Progress
    renderModuleCard(mockModule);
    expect(screen.getByText('Continue Learning')).toBeInTheDocument();

    // Completed
    const completedModule = {
      ...mockModule,
      progress: { ...mockModule.progress, status: 'completed' as const }
    };
    renderModuleCard(completedModule);
    expect(screen.getByText('Review Module')).toBeInTheDocument();

    // Not Started
    const notStartedModule = {
      ...mockModule,
      progress: { ...mockModule.progress, status: 'not_started' as const }
    };
    renderModuleCard(notStartedModule);
    expect(screen.getByText('Start Module')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClickMock = jest.fn();
    renderModuleCard(mockModule, onClickMock);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onClickMock).toHaveBeenCalledWith(mockModule);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClickMock = jest.fn();
    renderModuleCard(mockModule, onClickMock);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onClickMock).toHaveBeenCalledWith(mockModule);
  });

  it('calls onClick when Space key is pressed', () => {
    const onClickMock = jest.fn();
    renderModuleCard(mockModule, onClickMock);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClickMock).toHaveBeenCalledWith(mockModule);
  });

  it('has correct accessibility attributes', () => {
    renderModuleCard(mockModule);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-labelledby', `module-title-${mockModule.id}`);
    expect(card).toHaveAttribute('aria-describedby', `module-description-${mockModule.id}`);
    expect(card).toHaveAttribute('tabIndex', '0');

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', 'Module progress: 40% complete');
  });

  it('renders progress bar with correct width', () => {
    renderModuleCard(mockModule);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 40%');
  });

  it('shows recently accessed indicator when last_accessed is provided', () => {
    renderModuleCard(mockModule);

    const indicator = screen.getByTitle('Recently accessed');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('animate-pulse');
  });

  it('does not show recently accessed indicator when last_accessed is not provided', () => {
    const moduleWithoutLastAccessed = {
      ...mockModule,
      progress: {
        ...mockModule.progress,
        last_accessed: undefined
      }
    };

    renderModuleCard(moduleWithoutLastAccessed);

    expect(screen.queryByTitle('Recently accessed')).not.toBeInTheDocument();
  });

  it('renders without difficulty badge when not provided', () => {
    const moduleWithoutDifficulty = {
      ...mockModule,
      difficulty_level: undefined
    };

    renderModuleCard(moduleWithoutDifficulty);

    expect(screen.queryByText('Beginner')).not.toBeInTheDocument();
  });

  it('does not show estimated completion time when it is 0', () => {
    const moduleWithZeroTime = {
      ...mockModule,
      progress: {
        ...mockModule.progress,
        estimated_completion_time: 0
      }
    };

    renderModuleCard(moduleWithZeroTime);

    expect(screen.queryByText(/min left/)).not.toBeInTheDocument();
  });
});
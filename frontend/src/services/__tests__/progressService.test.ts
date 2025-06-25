import { ProgressService } from '../progressService';
import { Module, DashboardModuleProgress, ModuleWithProgress } from '../../types';

describe('ProgressService', () => {
  const mockModules: Module[] = [
    {
      id: 'module-1',
      title: 'Basic Grammar',
      order: 1,
      lesson_count: 5,
      created_at: '2024-01-01T00:00:00Z',
      estimated_duration: 120
    },
    {
      id: 'module-2',
      title: 'Advanced Grammar',
      order: 2,
      lesson_count: 8,
      created_at: '2024-01-02T00:00:00Z',
      estimated_duration: 180
    }
  ];

  const mockProgressData: DashboardModuleProgress[] = [
    {
      module_id: 'module-1',
      module_title: 'Basic Grammar',
      total_lessons: 5,
      completed_lessons: 3,
      progress_percentage: 60,
      status: 'in_progress'
    },
    {
      module_id: 'module-2',
      module_title: 'Advanced Grammar',
      total_lessons: 8,
      completed_lessons: 8,
      progress_percentage: 100,
      status: 'completed'
    }
  ];

  describe('mergeModulesWithProgress', () => {
    it('merges modules with existing progress data', () => {
      const result = ProgressService.mergeModulesWithProgress(mockModules, mockProgressData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockModules[0],
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 3,
          progress_percentage: 60,
          status: 'in_progress',
          last_accessed: undefined,
          estimated_completion_time: 48 // 40% remaining of 120 minutes
        }
      });
    });

    it('creates default progress for modules without progress data', () => {
      const result = ProgressService.mergeModulesWithProgress([mockModules[0]], []);

      expect(result[0].progress).toEqual({
        module_id: 'module-1',
        total_lessons: 5,
        completed_lessons: 0,
        progress_percentage: 0,
        status: 'not_started',
        last_accessed: undefined,
        estimated_completion_time: 120
      });
    });
  });

  describe('calculateEstimatedCompletion', () => {
    it('calculates remaining time correctly', () => {
      const result = ProgressService.calculateEstimatedCompletion(120, 60);
      expect(result).toBe(48); // 40% remaining of 120 minutes
    });

    it('returns 0 for 100% completion', () => {
      const result = ProgressService.calculateEstimatedCompletion(120, 100);
      expect(result).toBe(0);
    });

    it('returns full duration for 0% completion', () => {
      const result = ProgressService.calculateEstimatedCompletion(120, 0);
      expect(result).toBe(120);
    });
  });

  describe('calculateModuleStatus', () => {
    it('returns not_started when no lessons completed', () => {
      const result = ProgressService.calculateModuleStatus(0, 5);
      expect(result).toBe('not_started');
    });

    it('returns completed when all lessons completed', () => {
      const result = ProgressService.calculateModuleStatus(5, 5);
      expect(result).toBe('completed');
    });

    it('returns in_progress for partial completion', () => {
      const result = ProgressService.calculateModuleStatus(3, 5);
      expect(result).toBe('in_progress');
    });
  });

  describe('calculateProgressPercentage', () => {
    it('calculates percentage correctly', () => {
      const result = ProgressService.calculateProgressPercentage(3, 5);
      expect(result).toBe(60);
    });

    it('returns 0 for zero total lessons', () => {
      const result = ProgressService.calculateProgressPercentage(0, 0);
      expect(result).toBe(0);
    });

    it('rounds to nearest integer', () => {
      const result = ProgressService.calculateProgressPercentage(1, 3);
      expect(result).toBe(33);
    });
  });

  describe('sortModulesWithProgress', () => {
    const mockModulesWithProgress: ModuleWithProgress[] = [
      {
        ...mockModules[0],
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 3,
          progress_percentage: 60,
          status: 'in_progress',
          last_accessed: '2024-01-01T12:00:00Z'
        }
      },
      {
        ...mockModules[1],
        progress: {
          module_id: 'module-2',
          total_lessons: 8,
          completed_lessons: 8,
          progress_percentage: 100,
          status: 'completed',
          last_accessed: '2024-01-01T10:00:00Z'
        }
      }
    ];

    it('sorts by order ascending', () => {
      const result = ProgressService.sortModulesWithProgress(
        mockModulesWithProgress.reverse(), // Start with reversed order
        'order',
        'asc'
      );

      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
    });

    it('sorts by title descending', () => {
      const result = ProgressService.sortModulesWithProgress(
        mockModulesWithProgress,
        'title',
        'desc'
      );

      expect(result[0].title).toBe('Basic Grammar');
      expect(result[1].title).toBe('Advanced Grammar');
    });

    it('sorts by progress percentage', () => {
      const result = ProgressService.sortModulesWithProgress(
        mockModulesWithProgress,
        'progress',
        'desc'
      );

      expect(result[0].progress.progress_percentage).toBe(100);
      expect(result[1].progress.progress_percentage).toBe(60);
    });

    it('sorts by last accessed', () => {
      const result = ProgressService.sortModulesWithProgress(
        mockModulesWithProgress,
        'last_accessed',
        'desc'
      );

      expect(result[0].progress.last_accessed).toBe('2024-01-01T12:00:00Z');
      expect(result[1].progress.last_accessed).toBe('2024-01-01T10:00:00Z');
    });
  });

  describe('filterModules', () => {
    const mockModulesWithProgress: ModuleWithProgress[] = [
      {
        ...mockModules[0],
        description: 'Learn basic grammar concepts',
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 3,
          progress_percentage: 60,
          status: 'in_progress'
        }
      },
      {
        ...mockModules[1],
        description: 'Master advanced grammar topics',
        progress: {
          module_id: 'module-2',
          total_lessons: 8,
          completed_lessons: 8,
          progress_percentage: 100,
          status: 'completed'
        }
      }
    ];

    it('filters by search query', () => {
      const result = ProgressService.filterModules(
        mockModulesWithProgress,
        'basic',
        'all'
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Basic Grammar');
    });

    it('filters by status', () => {
      const result = ProgressService.filterModules(
        mockModulesWithProgress,
        '',
        'completed'
      );

      expect(result).toHaveLength(1);
      expect(result[0].progress.status).toBe('completed');
    });

    it('filters by both search and status', () => {
      const result = ProgressService.filterModules(
        mockModulesWithProgress,
        'grammar',
        'in_progress'
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Basic Grammar');
    });

    it('returns all modules when no filters applied', () => {
      const result = ProgressService.filterModules(
        mockModulesWithProgress,
        '',
        'all'
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('getOverallStats', () => {
    const mockModulesWithProgress: ModuleWithProgress[] = [
      {
        ...mockModules[0],
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 3,
          progress_percentage: 60,
          status: 'in_progress'
        }
      },
      {
        ...mockModules[1],
        progress: {
          module_id: 'module-2',
          total_lessons: 8,
          completed_lessons: 8,
          progress_percentage: 100,
          status: 'completed'
        }
      }
    ];

    it('calculates overall statistics correctly', () => {
      const result = ProgressService.getOverallStats(mockModulesWithProgress);

      expect(result).toEqual({
        totalModules: 2,
        completedModules: 1,
        inProgressModules: 1,
        notStartedModules: 0,
        overallProgress: 80 // (60 + 100) / 2
      });
    });

    it('handles empty modules array', () => {
      const result = ProgressService.getOverallStats([]);

      expect(result).toEqual({
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        notStartedModules: 0,
        overallProgress: 0
      });
    });
  });

  describe('getNextRecommendedModule', () => {
    const mockModulesWithProgress: ModuleWithProgress[] = [
      {
        ...mockModules[0],
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 5,
          progress_percentage: 100,
          status: 'completed'
        }
      },
      {
        ...mockModules[1],
        progress: {
          module_id: 'module-2',
          total_lessons: 8,
          completed_lessons: 3,
          progress_percentage: 38,
          status: 'in_progress'
        }
      }
    ];

    it('returns in progress module as recommendation', () => {
      const result = ProgressService.getNextRecommendedModule(mockModulesWithProgress);
      expect(result?.id).toBe('module-2');
    });

    it('returns first not started module when no in progress modules', () => {
      const modulesWithNotStarted = mockModulesWithProgress.map(m => ({
        ...m,
        progress: { ...m.progress, status: 'not_started' as const }
      }));

      const result = ProgressService.getNextRecommendedModule(modulesWithNotStarted);
      expect(result?.order).toBe(1);
    });

    it('returns null when all modules are completed', () => {
      const completedModules = mockModulesWithProgress.map(m => ({
        ...m,
        progress: { ...m.progress, status: 'completed' as const }
      }));

      const result = ProgressService.getNextRecommendedModule(completedModules);
      expect(result).toBeNull();
    });
  });

  describe('isModuleAvailable', () => {
    const mockModulesWithProgress: ModuleWithProgress[] = [
      {
        ...mockModules[0],
        order: 1,
        progress: {
          module_id: 'module-1',
          total_lessons: 5,
          completed_lessons: 5,
          progress_percentage: 100,
          status: 'completed'
        }
      },
      {
        ...mockModules[1],
        order: 2,
        progress: {
          module_id: 'module-2',
          total_lessons: 8,
          completed_lessons: 0,
          progress_percentage: 0,
          status: 'not_started'
        }
      }
    ];

    it('returns true for first module', () => {
      const result = ProgressService.isModuleAvailable(
        mockModulesWithProgress[0],
        mockModulesWithProgress
      );
      expect(result).toBe(true);
    });

    it('returns true when previous module is completed', () => {
      const result = ProgressService.isModuleAvailable(
        mockModulesWithProgress[1],
        mockModulesWithProgress
      );
      expect(result).toBe(true);
    });

    it('returns true when previous module is in progress', () => {
      const modulesWithIncompleteFirst = [
        {
          ...mockModulesWithProgress[0],
          progress: { ...mockModulesWithProgress[0].progress, status: 'in_progress' as const }
        },
        mockModulesWithProgress[1]
      ];

      const result = ProgressService.isModuleAvailable(
        modulesWithIncompleteFirst[1],
        modulesWithIncompleteFirst
      );
      expect(result).toBe(true); // Previous module in progress allows access
    });

    it('returns false when previous module is not started', () => {
      const modulesWithNotStartedFirst = [
        {
          ...mockModulesWithProgress[0],
          progress: { ...mockModulesWithProgress[0].progress, status: 'not_started' as const }
        },
        mockModulesWithProgress[1]
      ];

      const result = ProgressService.isModuleAvailable(
        modulesWithNotStartedFirst[1],
        modulesWithNotStartedFirst
      );
      expect(result).toBe(false); // Previous module not started blocks access
    });
  });
});
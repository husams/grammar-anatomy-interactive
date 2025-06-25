import { Module, ModuleWithProgress, DashboardModuleProgress } from '../types';

export class ProgressService {
  /**
   * Merges module data with user progress to create ModuleWithProgress objects
   */
  static mergeModulesWithProgress(
    modules: Module[], 
    progressData: DashboardModuleProgress[]
  ): ModuleWithProgress[] {
    return modules.map(module => {
      const progress = progressData.find(p => p.module_id === module.id);
      
      return {
        ...module,
        progress: progress ? {
          module_id: module.id,
          total_lessons: progress.total_lessons,
          completed_lessons: progress.completed_lessons,
          progress_percentage: progress.progress_percentage,
          status: progress.status,
          last_accessed: undefined, // TODO: Add last_accessed to backend
          estimated_completion_time: this.calculateEstimatedCompletion(
            module.estimated_duration || 0,
            progress.progress_percentage
          )
        } : {
          module_id: module.id,
          total_lessons: module.lesson_count || 0,
          completed_lessons: 0,
          progress_percentage: 0,
          status: 'not_started' as const,
          last_accessed: undefined,
          estimated_completion_time: module.estimated_duration || 0
        }
      };
    });
  }

  /**
   * Calculates estimated completion time based on remaining progress
   */
  static calculateEstimatedCompletion(
    totalDuration: number, 
    progressPercentage: number
  ): number {
    const remainingPercentage = 1 - (progressPercentage / 100);
    return Math.ceil(totalDuration * remainingPercentage);
  }

  /**
   * Determines module status based on progress
   */
  static calculateModuleStatus(
    completedLessons: number,
    totalLessons: number
  ): 'not_started' | 'in_progress' | 'completed' {
    if (completedLessons === 0) return 'not_started';
    if (completedLessons === totalLessons) return 'completed';
    return 'in_progress';
  }

  /**
   * Calculates progress percentage
   */
  static calculateProgressPercentage(
    completedLessons: number,
    totalLessons: number
  ): number {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }

  /**
   * Sorts modules with progress based on criteria
   */
  static sortModulesWithProgress(
    modules: ModuleWithProgress[],
    sortBy: 'order' | 'title' | 'progress' | 'last_accessed',
    direction: 'asc' | 'desc' = 'asc'
  ): ModuleWithProgress[] {
    const sorted = [...modules].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'order':
          comparison = a.order - b.order;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          comparison = a.progress.progress_percentage - b.progress.progress_percentage;
          break;
        case 'last_accessed': {
          const aDate = a.progress.last_accessed ? new Date(a.progress.last_accessed) : new Date(0);
          const bDate = b.progress.last_accessed ? new Date(b.progress.last_accessed) : new Date(0);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        }
        default:
          comparison = a.order - b.order;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Filters modules based on search and status criteria
   */
  static filterModules(
    modules: ModuleWithProgress[],
    searchQuery: string,
    statusFilter: 'all' | 'not_started' | 'in_progress' | 'completed'
  ): ModuleWithProgress[] {
    let filtered = modules;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(module => 
        module.title.toLowerCase().includes(query) ||
        (module.description && module.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(module => module.progress.status === statusFilter);
    }

    return filtered;
  }

  /**
   * Gets overall progress statistics
   */
  static getOverallStats(modules: ModuleWithProgress[]): {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    notStartedModules: number;
    overallProgress: number;
  } {
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.progress.status === 'completed').length;
    const inProgressModules = modules.filter(m => m.progress.status === 'in_progress').length;
    const notStartedModules = modules.filter(m => m.progress.status === 'not_started').length;
    
    const overallProgress = totalModules > 0 
      ? Math.round(modules.reduce((sum, m) => sum + m.progress.progress_percentage, 0) / totalModules)
      : 0;

    return {
      totalModules,
      completedModules,
      inProgressModules,
      notStartedModules,
      overallProgress
    };
  }

  /**
   * Finds the next recommended module based on progress
   */
  static getNextRecommendedModule(modules: ModuleWithProgress[]): ModuleWithProgress | null {
    // First, try to find a module in progress
    const inProgress = modules.find(m => m.progress.status === 'in_progress');
    if (inProgress) return inProgress;

    // Then, find the first not started module in order
    const notStarted = modules
      .filter(m => m.progress.status === 'not_started')
      .sort((a, b) => a.order - b.order);
    
    return notStarted[0] || null;
  }

  /**
   * Checks if a module is available based on prerequisites
   */
  static isModuleAvailable(
    module: ModuleWithProgress,
    allModules: ModuleWithProgress[]
  ): boolean {
    // For now, assume linear progression - module is available if it's the first module
    // or if the previous module is completed or in progress (allowing users to work ahead)
    if (module.order === 1) return true;

    const previousModule = allModules.find(m => m.order === module.order - 1);
    return previousModule ? 
      previousModule.progress.status !== 'not_started'
      : true;
  }

  /**
   * Calculates learning streak information
   */
  static calculateLearningStreak(modules: ModuleWithProgress[]): {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
  } {
    // This is a simplified calculation - in a real app, you'd track daily activity
    const activeDays = modules.filter(m => 
      m.progress.status === 'in_progress' || m.progress.status === 'completed'
    ).length;

    return {
      currentStreak: activeDays,
      longestStreak: activeDays, // Simplified
      lastActivityDate: new Date() // Simplified
    };
  }
}

export default ProgressService;
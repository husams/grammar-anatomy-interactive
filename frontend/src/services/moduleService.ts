import { Module, ModuleSearchParams, UserProgressSummary } from '../types';
import ApiClient from '../utils/apiClient';

export class ModuleService {
  /**
   * Fetches all modules with optional search and filter parameters
   */
  static async getModules(params?: ModuleSearchParams): Promise<{
    data: Module[];
    total: number;
  }> {
    const queryParams: Record<string, string> = {};
    
    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params?.sortBy) {
      queryParams.sort_by = params.sortBy;
    }
    if (params?.sortDirection) {
      queryParams.sort_direction = params.sortDirection;
    }
    if (params?.skip !== undefined) {
      queryParams.skip = params.skip.toString();
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }

    const response = await ApiClient.get<Module[] | { data: Module[]; total: number }>('/modules', queryParams);
    const result = response.data;
    
    // Handle both array response and paginated response formats
    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length
      };
    } else {
      return {
        data: result.data || [],
        total: result.total || result.data?.length || 0
      };
    }
  }

  /**
   * Fetches a specific module by ID
   */
  static async getModule(moduleId: string): Promise<Module> {
    try {
      const response = await ApiClient.get<Module>(`/modules/${moduleId}`);
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Module not found');
      }
      throw error;
    }
  }

  /**
   * Fetches user progress summary including module progress
   */
  static async getUserProgressSummary(): Promise<UserProgressSummary> {
    const response = await ApiClient.get<UserProgressSummary>('/progress/summary');
    return response.data;
  }

  /**
   * Searches modules with debounced functionality
   */
  static async searchModules(
    query: string,
    abortSignal?: AbortSignal
  ): Promise<Module[]> {
    if (!query.trim()) {
      return [];
    }

    const searchParams = new URLSearchParams({ search: query });
    const response = await ApiClient.request<Module[] | { data: Module[] }>(`/modules?${searchParams.toString()}`, {
      method: 'GET',
      signal: abortSignal,
    });
    
    const result = response.data;
    return Array.isArray(result) ? result : result.data || [];
  }


  /**
   * Validates module data
   */
  static validateModule(module: Partial<Module>): module is Module {
    return !!(
      module.id &&
      module.title &&
      typeof module.order === 'number' &&
      typeof module.lesson_count === 'number' &&
      module.created_at
    );
  }

  /**
   * Formats module data for display
   */
  static formatModuleForDisplay(module: Module): {
    title: string;
    subtitle: string;
    description: string;
    duration: string;
  } {
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
  }

  /**
   * Gets module difficulty badge color
   */
  static getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Caches modules data in localStorage
   */
  static cacheModules(modules: Module[]): void {
    try {
      const cacheData = {
        modules,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('modules_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache modules:', error);
    }
  }

  /**
   * Retrieves cached modules if valid
   */
  static getCachedModules(): Module[] | null {
    try {
      const cached = localStorage.getItem('modules_cache');
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (Date.now() - cacheData.timestamp > maxAge) {
        localStorage.removeItem('modules_cache');
        return null;
      }

      return cacheData.modules;
    } catch (error) {
      console.warn('Failed to retrieve cached modules:', error);
      return null;
    }
  }
}

export default ModuleService;
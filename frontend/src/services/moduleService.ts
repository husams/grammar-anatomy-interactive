import { Module, ModuleSearchParams, UserProgressSummary } from '../types';

const API_BASE = '/api/v1';

export class ModuleService {
  /**
   * Fetches all modules with optional search and filter parameters
   */
  static async getModules(params?: ModuleSearchParams): Promise<{
    data: Module[];
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    if (params?.status && params.status !== 'all') {
      searchParams.append('status', params.status);
    }
    if (params?.sortBy) {
      searchParams.append('sort_by', params.sortBy);
    }
    if (params?.sortDirection) {
      searchParams.append('sort_direction', params.sortDirection);
    }
    if (params?.skip !== undefined) {
      searchParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE}/modules/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch modules: ${response.statusText}`);
    }

    const result = await response.json();
    
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
    const response = await fetch(`${API_BASE}/modules/${moduleId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Module not found');
      }
      throw new Error(`Failed to fetch module: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetches user progress summary including module progress
   */
  static async getUserProgressSummary(): Promise<UserProgressSummary> {
    const response = await fetch(`${API_BASE}/progress/summary`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch progress summary: ${response.statusText}`);
    }

    return response.json();
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

    const response = await fetch(`${API_BASE}/modules?search=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  /**
   * Gets authentication token from storage
   */
  private static getAuthToken(): string {
    // Try multiple possible token keys for backward compatibility
    const token = localStorage.getItem('grammar_anatomy_token') || 
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('access_token') ||
                  sessionStorage.getItem('grammar_anatomy_token');
    
    if (!token) {
      console.warn('No authentication token found in storage. Available keys:', 
        Object.keys(localStorage).filter(key => key.includes('token') || key.includes('auth')));
      throw new Error('No authentication token found');
    }
    return token;
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
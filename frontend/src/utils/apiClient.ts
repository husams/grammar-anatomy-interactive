export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public isHtmlResponse: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static baseUrl = process.env.REACT_APP_API_URL 
    ? (process.env.REACT_APP_API_URL.endsWith('/api/v1') 
        ? process.env.REACT_APP_API_URL 
        : `${process.env.REACT_APP_API_URL}/api/v1`)
    : (process.env.NODE_ENV === 'production' 
        ? '/api/v1' 
        : 'http://localhost:8000/api/v1');

  /**
   * Gets authentication token from storage
   */
  private static getAuthToken(): string {
    const token = localStorage.getItem('grammar_anatomy_token') || 
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('access_token') ||
                  sessionStorage.getItem('grammar_anatomy_token');
    
    if (!token) {
      console.warn('No authentication token found in storage. Available keys:', 
        Object.keys(localStorage).filter(key => key.includes('token') || key.includes('auth')));
      throw new ApiError('No authentication token found', 401, 'Unauthorized');
    }
    return token;
  }

  /**
   * Checks if response is HTML (indicates authentication failure or server error)
   */
  private static isHtmlResponse(response: Response): Promise<boolean> {
    const contentType = response.headers.get('content-type');
    return Promise.resolve(
      contentType?.includes('text/html') || 
      contentType?.includes('application/html') ||
      false
    );
  }

  /**
   * Safely parses JSON response, detecting HTML responses
   */
  private static async safeJsonParse(response: Response): Promise<any> {
    const text = await response.text();
    
    // Check if response starts with HTML doctype or tags
    if (text.trim().startsWith('<!DOCTYPE') || 
        text.trim().startsWith('<html') ||
        text.trim().startsWith('<HTML')) {
      throw new ApiError(
        'Server returned HTML instead of JSON (possible authentication failure)',
        response.status,
        response.statusText,
        true
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new ApiError(
        `Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        response.status,
        response.statusText
      );
    }
  }

  /**
   * Makes authenticated API request
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      // Check for HTML response before parsing
      if (await this.isHtmlResponse(response)) {
        throw new ApiError(
          'Server returned HTML instead of JSON (possible authentication failure)',
          response.status,
          response.statusText,
          true
        );
      }

      const data = await this.safeJsonParse(response);

      if (!response.ok) {
        throw new ApiError(
          data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        'Network Error'
      );
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url);
  }

  /**
   * POST request
   */
  static async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  static async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export default ApiClient;
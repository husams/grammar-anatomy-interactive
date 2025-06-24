import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for authentication context
interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token storage utilities
const TOKEN_KEY = 'grammar_anatomy_token';

const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
  },
  
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.warn('Failed to save token to localStorage:', error);
    }
  },
  
  remove: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to remove token from localStorage:', error);
    }
  }
};

// API utilities
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `http://localhost:8000/api/v1${endpoint}`;
  console.log('🔥 Making API call to:', url);
  console.log('🔥 Options:', JSON.stringify(options, null, 2));
  
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('🔥 Response status:', response.status);
    console.log('🔥 Response ok:', response.ok);
    console.log('🔥 Response type:', response.type);

    const data = await response.json();
    console.log('🔥 Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('🔥 API call error:', error);
    console.error('🔥 Error type:', typeof error);
    if (error instanceof Error) {
      console.error('🔥 Error message:', error.message);
      console.error('🔥 Error stack:', error.stack);
    }
    throw error;
  }
};

const fetchCurrentUser = async (token: string): Promise<User> => {
  return apiCall('/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.get();
      
      if (!storedToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user = await fetchCurrentUser(storedToken);
        setState({
          user,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.warn('Failed to validate stored token:', error);
        tokenStorage.remove();
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiCall('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { access_token } = response;
      tokenStorage.set(access_token);

      // Fetch user data with the new token
      const user = await fetchCurrentUser(access_token);

      setState({
        user,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  // Register function with auto-login
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Register the user
      await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // Auto-login after successful registration
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        return { success: true };
      } else {
        // Registration succeeded but auto-login failed
        setState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: 'Registration successful, but auto-login failed. Please try logging in manually.' 
        };
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false
      }));
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = (): void => {
    tokenStorage.remove();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // Clear error function (for future use)
  const clearError = (): void => {
    // This function can be extended in the future for error state management
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
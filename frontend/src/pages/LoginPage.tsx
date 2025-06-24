import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const result = await login(form.email, form.password);
      
      if (result.success) {
        // Navigate to intended destination or dashboard
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <div className="flex justify-between mt-6 text-sm">
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Register</Link>
          <Link to="/reset-password" className="text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
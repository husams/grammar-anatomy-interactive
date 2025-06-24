import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Grammar Anatomy Interactive
          </Link>
          
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <span className="text-gray-600 dark:text-gray-300">
                  Welcome, {user?.name}
                </span>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/modules" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Modules
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              // Unauthenticated user navigation
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Register
                </Link>
              </>
            )}
            
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="ml-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
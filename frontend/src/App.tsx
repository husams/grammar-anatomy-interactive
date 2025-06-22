import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Placeholder components - will be implemented in Phase 2
const Dashboard = () => <div className="p-8">Dashboard - Coming Soon</div>;
const Modules = () => <div className="p-8">Modules - Coming Soon</div>;
const Module = () => <div className="p-8">Module Detail - Coming Soon</div>;
const Lesson = () => <div className="p-8">Lesson - Coming Soon</div>;
const Exercise = () => <div className="p-8">Exercise - Coming Soon</div>;
const AnatomyLab = () => <div className="p-8">Anatomy Lab - Coming Soon</div>;
const AIGuru = () => <div className="p-8">AI Guru - Coming Soon</div>;
const Glossary = () => <div className="p-8">Glossary - Coming Soon</div>;
const Review = () => <div className="p-8">Review - Coming Soon</div>;

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  return (
    <Router>
      <div className={"min-h-screen bg-gray-50 dark:bg-gray-900"}>
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Grammar Anatomy Interactive
              </h1>
              <nav className="space-x-4">
                <a href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Login
                </a>
                <a href="/register" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Register
                </a>
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

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/modules/:id" element={<Module />} />
            <Route path="/lessons/:id" element={<Lesson />} />
            <Route path="/exercises/:id" element={<Exercise />} />
            <Route path="/anatomy-lab" element={<AnatomyLab />} />
            <Route path="/ai-guru" element={<AIGuru />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/review" element={<Review />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PasswordResetPage from './pages/PasswordResetPage';
import DashboardPage from './pages/DashboardPage';
import ModulesListPage from './pages/ModulesListPage';

// Placeholder components - will be implemented in future phases
const Module = () => <div className="p-8">Module Detail - Coming Soon</div>;
const Lesson = () => <div className="p-8">Lesson - Coming Soon</div>;
const Exercise = () => <div className="p-8">Exercise - Coming Soon</div>;
const AnatomyLab = () => <div className="p-8">Anatomy Lab - Coming Soon</div>;
const AIGuru = () => <div className="p-8">AI Guru - Coming Soon</div>;
const Glossary = () => <div className="p-8">Glossary - Coming Soon</div>;
const Review = () => <div className="p-8">Review - Coming Soon</div>;

// Main App content component that uses auth context
const AppContent: React.FC = () => {
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
    <div className={"min-h-screen bg-gray-50 dark:bg-gray-900"}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/modules" element={
            <ProtectedRoute>
              <ModulesListPage />
            </ProtectedRoute>
          } />
          <Route path="/modules/:id" element={
            <ProtectedRoute>
              <Module />
            </ProtectedRoute>
          } />
          <Route path="/lessons/:id" element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          } />
          <Route path="/exercises/:id" element={
            <ProtectedRoute>
              <Exercise />
            </ProtectedRoute>
          } />
          <Route path="/anatomy-lab" element={
            <ProtectedRoute>
              <AnatomyLab />
            </ProtectedRoute>
          } />
          <Route path="/ai-guru" element={
            <ProtectedRoute>
              <AIGuru />
            </ProtectedRoute>
          } />
          <Route path="/glossary" element={
            <ProtectedRoute>
              <Glossary />
            </ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

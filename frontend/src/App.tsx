import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

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
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Grammar Anatomy Interactive
              </h1>
              <nav className="space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <a
                  href="/modules"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Modules
                </a>
                <a
                  href="/anatomy-lab"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Anatomy Lab
                </a>
                <a
                  href="/glossary"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Glossary
                </a>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/modules/:id" element={<Module />} />
            <Route path="/lessons/:id" element={<Lesson />} />
            <Route path="/exercises/:id" element={<Exercise />} />
            <Route path="/anatomy-lab" element={<AnatomyLab />} />
            <Route path="/ai-guru" element={<AIGuru />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/review" element={<Review />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Module } from '../types';

const ModulesListPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API call
    fetch('/api/v1/modules')
      .then((res) => res.json())
      .then((data) => {
        setModules(data.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-lg text-gray-700 dark:text-gray-200 py-16">Loading modules...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Modules</h2>
      <ul className="space-y-4">
        {modules.map((mod) => (
          <li key={mod.id} className="p-4 border rounded flex items-center justify-between bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div>
              <Link to={`/modules/${mod.id}`} className="text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                {mod.title}
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">Order: {mod.order}</div>
            </div>
            <div>
              {mod.status === 'completed' ? (
                <span className="text-green-600 dark:text-green-400 font-bold">Completed</span>
              ) : mod.status === 'in_progress' ? (
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">In Progress</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Not Started</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModulesListPage; 
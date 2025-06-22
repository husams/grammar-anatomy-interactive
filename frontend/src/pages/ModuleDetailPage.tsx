import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Module, Lesson } from '../types';

const ModuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API calls
    Promise.all([
      fetch(`/api/v1/modules/${id}`).then((res) => res.json()),
      fetch(`/api/v1/lessons?module_id=${id}`).then((res) => res.json()),
    ]).then(([modRes, lessonsRes]) => {
      setModule(modRes.data);
      setLessons(lessonsRes.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center text-lg text-gray-700 dark:text-gray-200 py-16">Loading module...</div>;
  if (!module) return <div className="text-center text-lg text-red-600 dark:text-red-400 py-16">Module not found.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{module.title}</h2>
      <div className="mb-6 text-gray-600 dark:text-gray-300">Module Order: {module.order}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Lessons</h3>
      <ul className="space-y-3">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="p-3 border rounded flex items-center justify-between bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <Link to={`/lessons/${lesson.id}`} className="text-blue-700 dark:text-blue-400 hover:underline font-medium">
              {lesson.title}
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400">Order: {lesson.order}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleDetailPage; 
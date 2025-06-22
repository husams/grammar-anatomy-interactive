import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lesson } from '../types';
// You may want to use a Markdown renderer like 'marked' or 'react-markdown'
import ReactMarkdown from 'react-markdown';

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  // For navigation
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Replace with real API call
    fetch(`/api/v1/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data.data);
        // Optionally fetch prev/next lesson IDs
        setPrevLessonId(data.data.prevLessonId || null);
        setNextLessonId(data.data.nextLessonId || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center text-lg text-gray-700 dark:text-gray-200 py-16">Loading lesson...</div>;
  if (!lesson) return <div className="text-center text-lg text-red-600 dark:text-red-400 py-16">Lesson not found.</div>;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{lesson.title}</h2>
      <div className="prose max-w-none mb-6 text-gray-800 dark:text-gray-200">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>
      {/* Interactive examples would be rendered here if present in content */}
      <div className="flex justify-between mt-8">
        {prevLessonId ? (
          <Link to={`/lessons/${prevLessonId}`} className="text-blue-700 dark:text-blue-400 hover:underline">
            ← Previous Lesson
          </Link>
        ) : <span />}
        {nextLessonId ? (
          <Link to={`/lessons/${nextLessonId}`} className="text-blue-700 dark:text-blue-400 hover:underline">
            Next Lesson →
          </Link>
        ) : <span />}
      </div>
    </div>
  );
};

export default LessonPage; 
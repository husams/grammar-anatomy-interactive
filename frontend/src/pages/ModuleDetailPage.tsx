import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ModuleDetail, ModuleProgress, RelatedModules, ModuleDetailState } from '../types';
import ApiClient from '../utils/apiClient';
import ModuleHeader from '../components/modules/ModuleHeader';
import ModuleProgressSection from '../components/modules/ModuleProgressSection';
import LessonsList from '../components/modules/LessonsList';
import ModuleLearningObjectives from '../components/modules/ModuleLearningObjectives';
import ModulePrerequisites from '../components/modules/ModulePrerequisites';
import RelatedModulesSection from '../components/modules/RelatedModulesSection';
import ModuleActions from '../components/modules/ModuleActions';
import LoadingStates from '../components/modules/LoadingStates';
import ErrorBoundary from '../components/modules/ErrorBoundary';

const ModuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<ModuleDetailState>({
    module: null,
    progress: null,
    relatedModules: null,
    isLoading: true,
    error: null,
    isNavigating: false,
  });

  const fetchModuleData = useCallback(async () => {
    if (!id) {
      setState(prev => ({ ...prev, error: 'Module ID is required', isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch module detail, progress, and related modules in parallel
      const [moduleResponse, progressResponse, relatedResponse] = await Promise.allSettled([
        ApiClient.get<ModuleDetail>(`/modules/${id}`),
        ApiClient.get<ModuleProgress>(`/progress/module/${id}`),
        ApiClient.get<RelatedModules>(`/modules/${id}/related`),
      ]);

      let moduleData: ModuleDetail | null = null;
      let progressData: ModuleProgress | null = null;
      let relatedData: RelatedModules | null = null;

      // Handle module data
      if (moduleResponse.status === 'fulfilled') {
        moduleData = moduleResponse.value.data;
        // Ensure required properties exist with defaults
        if (moduleData) {
          moduleData.learning_objectives = moduleData.learning_objectives || [];
          moduleData.prerequisites = moduleData.prerequisites || [];
          moduleData.lessons = moduleData.lessons || [];
        }
      } else {
        throw new Error('Module not found');
      }

      // Handle progress data (optional - might not exist for new users)
      if (progressResponse.status === 'fulfilled') {
        progressData = progressResponse.value.data;
      } else {
        // Create default progress state
        progressData = {
          module_id: id,
          user_id: '', // Will be set by backend
          overall_progress: 0,
          status: 'not_started',
          lessons_completed: 0,
          total_lessons: moduleData?.lesson_count || 0,
          exercises_completed: 0,
          total_exercises: moduleData?.exercise_count || 0,
          time_spent: 0,
          estimated_time_remaining: moduleData?.estimated_duration || 0,
          lesson_progress: [],
          achievements: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Handle related modules (optional)
      if (relatedResponse.status === 'fulfilled') {
        relatedData = relatedResponse.value.data;
        // Ensure required properties exist with defaults
        if (relatedData) {
          relatedData.prerequisites = relatedData.prerequisites || [];
          relatedData.recommended_next = relatedData.recommended_next || [];
          relatedData.related_topics = relatedData.related_topics || [];
        }
      }

      setState({
        module: moduleData,
        progress: progressData,
        relatedModules: relatedData,
        isLoading: false,
        error: null,
        isNavigating: false,
      });
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load module data',
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchModuleData();
  }, [id, fetchModuleData]);

  const handleStartModule = () => {
    if (!state.module || !state.module.lessons || !state.module.lessons.length) return;
    
    setState(prev => ({ ...prev, isNavigating: true }));
    const firstLesson = state.module.lessons.find(lesson => !lesson.is_locked);
    if (firstLesson) {
      navigate(`/lessons/${firstLesson.id}`);
    }
  };

  const handleContinueModule = () => {
    if (!state.progress?.last_accessed_lesson) {
      handleStartModule();
      return;
    }
    
    setState(prev => ({ ...prev, isNavigating: true }));
    navigate(`/lessons/${state.progress.last_accessed_lesson.lesson_id}`);
  };

  const handleLessonSelect = (lessonId: string, isLocked: boolean) => {
    if (isLocked) return;
    
    setState(prev => ({ ...prev, isNavigating: true }));
    navigate(`/lessons/${lessonId}`);
  };

  const handleRetry = () => {
    fetchModuleData();
  };

  const handleBackToModules = () => {
    navigate('/modules');
  };

  // Loading state
  if (state.isLoading && !state.module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingStates />
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary
            error={state.error}
            onRetry={handleRetry}
            onBack={handleBackToModules}
          />
        </div>
      </div>
    );
  }

  // Main content
  if (!state.module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Module not found
          </h2>
          <button
            onClick={handleBackToModules}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/modules"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Modules
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  {state.module.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Module Header */}
            <ModuleHeader module={state.module} progress={state.progress} />
            
            {/* Learning Objectives */}
            <ModuleLearningObjectives objectives={state.module.learning_objectives || []} />
            
            {/* Prerequisites */}
            {state.module.prerequisites && state.module.prerequisites.length > 0 && (
              <ModulePrerequisites prerequisites={state.module.prerequisites} />
            )}
            
            {/* Lessons List */}
            <LessonsList
              lessons={state.module.lessons || []}
              progress={state.progress}
              onLessonSelect={handleLessonSelect}
              isNavigating={state.isNavigating}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Section */}
            <ModuleProgressSection progress={state.progress} />
            
            {/* Action Buttons */}
            <ModuleActions
              progress={state.progress}
              onStartModule={handleStartModule}
              onContinueModule={handleContinueModule}
              isNavigating={state.isNavigating}
            />
            
            {/* Related Modules */}
            {state.relatedModules && (
              <RelatedModulesSection relatedModules={state.relatedModules} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailPage;
"""
Content management endpoints for modules, lessons, exercises, and glossary.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.content_loader import content_loader, Exercise, LessonContent, GlossaryEntry

router = APIRouter()


@router.get("/modules", response_model=List[dict])
async def get_modules():
    """Get all available modules with metadata."""
    try:
        modules = content_loader.get_modules()
        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading modules: {str(e)}")


@router.get("/modules/{module_id}")
async def get_module(module_id: str):
    """Get a specific module with its lesson content and exercises."""
    try:
        # Get module metadata
        modules = content_loader.get_modules()
        module = next((m for m in modules if m["id"] == module_id), None)
        
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Get lesson content
        lesson_content = content_loader.get_lesson_content(module_id)
        if not lesson_content:
            raise HTTPException(status_code=404, detail="Lesson content not found")
        
        # Get exercises
        exercises = content_loader.get_exercises(module_id)
        
        return {
            "module": module,
            "lesson": lesson_content.dict(),
            "exercises": [ex.dict() for ex in exercises],
            "exercise_count": len(exercises)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading module: {str(e)}")


@router.get("/modules/{module_id}/lesson")
async def get_lesson(module_id: str):
    """Get lesson content for a specific module."""
    try:
        lesson_content = content_loader.get_lesson_content(module_id)
        if not lesson_content:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        return lesson_content.dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading lesson: {str(e)}")


@router.get("/modules/{module_id}/exercises")
async def get_exercises(module_id: str):
    """Get exercises for a specific module."""
    try:
        exercises = content_loader.get_exercises(module_id)
        return [ex.dict() for ex in exercises]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading exercises: {str(e)}")


@router.get("/exercises/{exercise_id}")
async def get_exercise(module_id: str, exercise_id: str):
    """Get a specific exercise by ID."""
    try:
        exercises = content_loader.get_exercises(module_id)
        exercise = next((ex for ex in exercises if ex.id == exercise_id), None)
        
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")
        
        return exercise.dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading exercise: {str(e)}")


@router.get("/glossary")
async def get_glossary(
    query: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Get glossary entries with optional search and category filtering."""
    try:
        if query:
            entries = content_loader.search_glossary(query)
        elif category:
            entries = content_loader.get_glossary_by_category(category)
        else:
            entries = content_loader.get_glossary()
        
        return [entry.dict() for entry in entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading glossary: {str(e)}")


@router.get("/glossary/{term}")
async def get_glossary_term(term: str):
    """Get a specific glossary term."""
    try:
        glossary = content_loader.get_glossary()
        entry = next((entry for entry in glossary if entry.term.lower() == term.lower()), None)
        
        if not entry:
            raise HTTPException(status_code=404, detail="Glossary term not found")
        
        return entry.dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading glossary term: {str(e)}")


@router.get("/glossary/categories")
async def get_glossary_categories():
    """Get all available glossary categories."""
    try:
        glossary = content_loader.get_glossary()
        categories = list(set(entry.category for entry in glossary))
        return {"categories": sorted(categories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading categories: {str(e)}")


@router.get("/content/validate")
async def validate_content():
    """Validate all content files and return any errors."""
    try:
        errors = content_loader.validate_content()
        has_errors = any(len(error_list) > 0 for error_list in errors.values())
        
        return {
            "valid": not has_errors,
            "errors": errors,
            "summary": {
                "modules": len(content_loader.get_modules()),
                "glossary_entries": len(content_loader.get_glossary()),
                "total_exercises": sum(
                    len(content_loader.get_exercises(module["id"])) 
                    for module in content_loader.get_modules()
                )
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating content: {str(e)}")


@router.post("/content/clear-cache")
async def clear_content_cache():
    """Clear the content cache to force reloading of content files."""
    try:
        content_loader.clear_cache()
        return {"message": "Content cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}") 
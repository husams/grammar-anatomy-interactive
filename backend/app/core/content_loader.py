"""
Content loader utilities for parsing markdown lessons and JSON exercises.
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
try:
    import frontmatter
except ImportError:
    frontmatter = None
from pydantic import BaseModel, Field


class Exercise(BaseModel):
    """Exercise model for validation."""
    id: str
    type: str
    prompt: str
    answer: str
    explanation: str
    difficulty: str = "easy"
    options: Optional[List[str]] = None
    acceptable_answers: Optional[List[str]] = None


class LessonContent(BaseModel):
    """Lesson content model for validation."""
    title: str
    order: int
    module: str
    content: str


class GlossaryEntry(BaseModel):
    """Glossary entry model for validation."""
    term: str
    definition: str
    examples: List[str]
    related_lessons: List[str]
    category: str


class ContentLoader:
    """Utility class for loading and parsing content files."""
    
    def __init__(self, content_dir: str = "../content"):
        # Look for content in parent directory by default
        self.content_dir = Path(content_dir)
        if not self.content_dir.is_absolute():
            # If relative path, make it relative to the current file's directory
            current_file = Path(__file__)
            self.content_dir = current_file.parent.parent.parent / content_dir
        
        self._modules_cache: Optional[List[Dict[str, Any]]] = None
        self._glossary_cache: Optional[List[GlossaryEntry]] = None
    
    def get_modules(self) -> List[Dict[str, Any]]:
        """Get all available modules with their metadata."""
        if self._modules_cache is not None:
            return self._modules_cache
        
        modules = []
        modules_dir = self.content_dir / "modules"
        
        if not modules_dir.exists():
            return modules
        
        for module_dir in sorted(modules_dir.iterdir()):
            if not module_dir.is_dir():
                continue
                
            module_id = module_dir.name
            lesson_file = module_dir / "lesson.md"
            
            if lesson_file.exists():
                try:
                    with open(lesson_file, 'r', encoding='utf-8') as f:
                        if frontmatter:
                            post = frontmatter.load(f)
                            modules.append({
                                "id": module_id,
                                "title": post.get("title", module_id.replace("-", " ").title()),
                                "order": post.get("order", 0),
                                "module": post.get("module", module_id),
                                "lesson_file": str(lesson_file),
                                "exercises_file": str(module_dir / "exercises.json")
                            })
                        else:
                            # Fallback without frontmatter
                            content = f.read()
                            modules.append({
                                "id": module_id,
                                "title": module_id.replace("-", " ").title(),
                                "order": 0,
                                "module": module_id,
                                "lesson_file": str(lesson_file),
                                "exercises_file": str(module_dir / "exercises.json")
                            })
                except Exception as e:
                    print(f"Error loading module {module_id}: {e}")
        
        # Sort by order
        modules.sort(key=lambda x: x["order"])
        self._modules_cache = modules
        return modules
    
    def get_lesson_content(self, module_id: str) -> Optional[LessonContent]:
        """Get lesson content for a specific module."""
        lesson_file = self.content_dir / "modules" / module_id / "lesson.md"
        
        if not lesson_file.exists():
            return None
        
        try:
            with open(lesson_file, 'r', encoding='utf-8') as f:
                if frontmatter:
                    post = frontmatter.load(f)
                    return LessonContent(
                        title=post.get("title", ""),
                        order=post.get("order", 0),
                        module=post.get("module", module_id),
                        content=post.content
                    )
                else:
                    # Fallback without frontmatter
                    content = f.read()
                    return LessonContent(
                        title=module_id.replace("-", " ").title(),
                        order=0,
                        module=module_id,
                        content=content
                    )
        except Exception as e:
            print(f"Error loading lesson content for {module_id}: {e}")
            return None
    
    def get_exercises(self, module_id: str) -> List[Exercise]:
        """Get exercises for a specific module."""
        exercises_file = self.content_dir / "modules" / module_id / "exercises.json"
        
        if not exercises_file.exists():
            return []
        
        try:
            with open(exercises_file, 'r', encoding='utf-8') as f:
                exercises_data = json.load(f)
                exercises = []
                
                for ex_data in exercises_data:
                    try:
                        exercise = Exercise(**ex_data)
                        exercises.append(exercise)
                    except Exception as e:
                        print(f"Error parsing exercise {ex_data.get('id', 'unknown')}: {e}")
                
                return exercises
        except Exception as e:
            print(f"Error loading exercises for {module_id}: {e}")
            return []
    
    def get_glossary(self) -> List[GlossaryEntry]:
        """Get all glossary entries."""
        if self._glossary_cache is not None:
            return self._glossary_cache
        
        glossary_file = self.content_dir / "glossary.json"
        
        if not glossary_file.exists():
            return []
        
        try:
            with open(glossary_file, 'r', encoding='utf-8') as f:
                glossary_data = json.load(f)
                entries = []
                
                for entry_data in glossary_data:
                    try:
                        entry = GlossaryEntry(**entry_data)
                        entries.append(entry)
                    except Exception as e:
                        print(f"Error parsing glossary entry {entry_data.get('term', 'unknown')}: {e}")
                
                self._glossary_cache = entries
                return entries
        except Exception as e:
            print(f"Error loading glossary: {e}")
            return []
    
    def search_glossary(self, query: str) -> List[GlossaryEntry]:
        """Search glossary entries by term."""
        glossary = self.get_glossary()
        query_lower = query.lower()
        
        results = []
        for entry in glossary:
            if (query_lower in entry.term.lower() or 
                query_lower in entry.definition.lower() or
                any(query_lower in example.lower() for example in entry.examples)):
                results.append(entry)
        
        return results
    
    def get_glossary_by_category(self, category: str) -> List[GlossaryEntry]:
        """Get glossary entries by category."""
        glossary = self.get_glossary()
        return [entry for entry in glossary if entry.category.lower() == category.lower()]
    
    def clear_cache(self):
        """Clear the content cache."""
        self._modules_cache = None
        self._glossary_cache = None
    
    def validate_content(self) -> Dict[str, List[str]]:
        """Validate all content files and return any errors."""
        errors = {
            "modules": [],
            "exercises": [],
            "glossary": []
        }
        
        # Validate modules
        modules = self.get_modules()
        for module in modules:
            module_id = module["id"]
            
            # Check lesson content
            lesson_content = self.get_lesson_content(module_id)
            if not lesson_content:
                errors["modules"].append(f"Module {module_id}: Could not load lesson content")
            
            # Check exercises
            exercises = self.get_exercises(module_id)
            if not exercises:
                errors["exercises"].append(f"Module {module_id}: No exercises found")
            
            # Validate exercise types
            valid_types = ["identification", "multiple_choice", "fill_in_blank", "sentence_construction"]
            for exercise in exercises:
                if exercise.type not in valid_types:
                    errors["exercises"].append(
                        f"Module {module_id}, Exercise {exercise.id}: Invalid type '{exercise.type}'"
                    )
        
        # Validate glossary
        glossary = self.get_glossary()
        if not glossary:
            errors["glossary"].append("No glossary entries found")
        
        return errors


# Global content loader instance
content_loader = ContentLoader() 